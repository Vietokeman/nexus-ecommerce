using StackExchange.Redis;

namespace FlashSale.API.Services;

/// <summary>
/// Redis-based atomic stock management using Lua Scripts.
/// Designed for 100k CCU flash sale scenarios where race conditions
/// must be eliminated at the database level.
/// 
/// Lua Script advantages:
/// - Atomic execution (no WATCH/MULTI needed)
/// - Single network round-trip
/// - Server-side execution (minimal latency)
/// </summary>
public class RedisStockService
{
    private readonly IConnectionMultiplexer _redis;
    private readonly ILogger<RedisStockService> _logger;

    // Lua Script: Atomically deduct stock if sufficient, enforce per-user limit
    // KEYS[1] = stock key (e.g., "flash:item:{itemId}:stock")
    // KEYS[2] = user purchase key (e.g., "flash:item:{itemId}:user:{userName}")
    // ARGV[1] = requested quantity
    // ARGV[2] = max per user
    // Returns: 1 = success, -1 = out of stock, -2 = user limit exceeded
    private const string DeductStockScript = @"
        local stock = tonumber(redis.call('GET', KEYS[1]) or '0')
        local userBought = tonumber(redis.call('GET', KEYS[2]) or '0')
        local qty = tonumber(ARGV[1])
        local maxPerUser = tonumber(ARGV[2])

        if userBought + qty > maxPerUser then
            return -2
        end

        if stock < qty then
            return -1
        end

        redis.call('DECRBY', KEYS[1], qty)
        redis.call('INCRBY', KEYS[2], qty)
        return 1
    ";

    // Lua Script: Initialize stock for a flash sale item
    // KEYS[1] = stock key
    // ARGV[1] = total stock
    // ARGV[2] = TTL in seconds
    private const string InitStockScript = @"
        redis.call('SET', KEYS[1], ARGV[1])
        redis.call('EXPIRE', KEYS[1], ARGV[2])
        return 1
    ";

    public RedisStockService(IConnectionMultiplexer redis, ILogger<RedisStockService> logger)
    {
        _redis = redis;
        _logger = logger;
    }

    /// <summary>
    /// Initialize stock in Redis when a flash sale session goes active.
    /// </summary>
    public async Task InitializeStockAsync(long itemId, int totalStock, TimeSpan ttl)
    {
        var db = _redis.GetDatabase();
        var stockKey = GetStockKey(itemId);

        var result = await db.ScriptEvaluateAsync(
            InitStockScript,
            new RedisKey[] { stockKey },
            new RedisValue[] { totalStock, (int)ttl.TotalSeconds });

        _logger.LogInformation(
            "Initialized flash sale stock: ItemId={ItemId}, Stock={Stock}, TTL={TTL}s",
            itemId, totalStock, ttl.TotalSeconds);
    }

    /// <summary>
    /// Atomically deduct stock using Lua Script.
    /// Returns: 1 = success, -1 = out of stock, -2 = user limit exceeded
    /// </summary>
    public async Task<int> TryDeductStockAsync(long itemId, string userName, int quantity, int maxPerUser)
    {
        var db = _redis.GetDatabase();
        var stockKey = GetStockKey(itemId);
        var userKey = GetUserKey(itemId, userName);

        var result = (int)await db.ScriptEvaluateAsync(
            DeductStockScript,
            new RedisKey[] { stockKey, userKey },
            new RedisValue[] { quantity, maxPerUser });

        _logger.LogInformation(
            "Flash sale stock deduction: ItemId={ItemId}, User={User}, Qty={Qty}, Result={Result}",
            itemId, userName, quantity, result switch
            {
                1 => "SUCCESS",
                -1 => "OUT_OF_STOCK",
                -2 => "USER_LIMIT_EXCEEDED",
                _ => "UNKNOWN"
            });

        return result;
    }

    /// <summary>
    /// Rollback stock when an order is cancelled.
    /// </summary>
    public async Task RollbackStockAsync(long itemId, string userName, int quantity)
    {
        var db = _redis.GetDatabase();
        var stockKey = GetStockKey(itemId);
        var userKey = GetUserKey(itemId, userName);

        await db.StringIncrementAsync(stockKey, quantity);
        await db.StringDecrementAsync(userKey, quantity);

        _logger.LogInformation(
            "Flash sale stock rollback: ItemId={ItemId}, User={User}, Qty={Qty}",
            itemId, userName, quantity);
    }

    /// <summary>
    /// Get remaining stock from Redis.
    /// </summary>
    public async Task<int> GetRemainingStockAsync(long itemId)
    {
        var db = _redis.GetDatabase();
        var value = await db.StringGetAsync(GetStockKey(itemId));
        return value.HasValue ? (int)value : 0;
    }

    private static string GetStockKey(long itemId) => $"flash:item:{itemId}:stock";
    private static string GetUserKey(long itemId, string userName) => $"flash:item:{itemId}:user:{userName}";
}
