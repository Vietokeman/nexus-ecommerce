using Grpc.Net.Client;
using Inventory.Grpc;

namespace Basket.API.GrpcServices
{
    /// <summary>
    /// gRPC client for communicating with Inventory.API
    /// Provides high-performance stock checking functionality
    /// </summary>
    public class StockGrpcClient
    {
        private readonly ILogger<StockGrpcClient> _logger;
        private readonly string _grpcUrl;

        public StockGrpcClient(IConfiguration configuration, ILogger<StockGrpcClient> logger)
        {
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _grpcUrl = configuration.GetValue<string>("GrpcSettings:InventoryUrl") 
                ?? throw new ArgumentNullException("GrpcSettings:InventoryUrl not configured");
        }

        /// <summary>
        /// Check stock availability for a single item
        /// </summary>
        public async Task<StockResponse> GetStockAsync(string itemNo)
        {
            _logger.LogInformation("Calling Inventory gRPC service for item: {ItemNo}", itemNo);

            try
            {
                using var channel = GrpcChannel.ForAddress(_grpcUrl);
                var client = new StockProtoService.StockProtoServiceClient(channel);

                var request = new StockRequest { ItemNo = itemNo };
                var response = await client.GetStockAsync(request);

                _logger.LogDebug("Stock for {ItemNo}: {Quantity}, Available: {IsAvailable}", 
                    response.ItemNo, response.Quantity, response.IsAvailable);

                return response;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error calling Inventory gRPC service for item: {ItemNo}", itemNo);
                throw;
            }
        }

        /// <summary>
        /// Check stock availability for multiple items in a single call
        /// More efficient than calling GetStockAsync multiple times
        /// </summary>
        public async Task<StocksResponse> GetStocksAsync(IEnumerable<string> itemNos)
        {
            _logger.LogInformation("Calling Inventory gRPC service for {Count} items", itemNos.Count());

            try
            {
                using var channel = GrpcChannel.ForAddress(_grpcUrl);
                var client = new StockProtoService.StockProtoServiceClient(channel);

                var request = new StocksRequest();
                request.ItemNos.AddRange(itemNos);

                var response = await client.GetStocksAsync(request);

                _logger.LogDebug("Received stock for {Count} items", response.Stocks.Count);

                return response;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error calling Inventory gRPC service for multiple items");
                throw;
            }
        }

        /// <summary>
        /// Validate if all items in cart have sufficient stock
        /// Returns true if all items are available, false otherwise
        /// </summary>
        public async Task<Dictionary<string, bool>> ValidateCartStockAsync(Dictionary<string, int> cartItems)
        {
            var itemNos = cartItems.Keys;
            var stockResponse = await GetStocksAsync(itemNos);

            var result = new Dictionary<string, bool>();

            foreach (var item in cartItems)
            {
                var stock = stockResponse.Stocks.FirstOrDefault(s => s.ItemNo == item.Key);
                var isAvailable = stock != null && stock.Quantity >= item.Value;
                result[item.Key] = isAvailable;

                if (!isAvailable)
                {
                    _logger.LogWarning("Insufficient stock for item {ItemNo}. Required: {Required}, Available: {Available}",
                        item.Key, item.Value, stock?.Quantity ?? 0);
                }
            }

            return result;
        }
    }
}
