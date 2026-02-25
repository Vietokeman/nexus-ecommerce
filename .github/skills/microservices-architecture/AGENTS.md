# Microservices Architecture Best Practices

**Version 1.0.0**  
Nexus Commerce Platform  
February 2026

> **Note:**  
> This document is for agents and LLMs to follow when maintaining,  
> generating, or refactoring .NET microservices. Humans may also  
> find it useful, but guidance here is optimized for automation  
> and consistency by AI-assisted workflows.

---

## Abstract

Comprehensive architectural guide for building distributed microservices using ASP.NET Core 8.0, Docker, RabbitMQ, PostgreSQL, Redis, and Elasticsearch. This guide provides detailed rules, real-world examples, and templates to ensure consistency across service boundaries, communication patterns, and deployment strategies.

---

## Table of Contents

1. [Service Design](#1-service-design) — **CRITICAL**
2. [API Gateway Pattern](#2-api-gateway-pattern) — **CRITICAL**
3. [Event-Driven Communication](#3-event-driven-communication) — **HIGH**
4. [Data Management](#4-data-management) — **HIGH**
5. [Resilience Patterns](#5-resilience-patterns) — **MEDIUM-HIGH**
6. [Observability](#6-observability) — **MEDIUM**
7. [Security](#7-security) — **MEDIUM**
8. [Quick Reference Templates](#8-quick-reference-templates)

---

## 1. Service Design

**Impact: CRITICAL**

Each microservice must be autonomous, independently deployable, and own its data. Services communicate via APIs or async messaging, never direct database access.

### 1.1 Service Boundaries

**Impact: CRITICAL (ensures proper service isolation)**

Services should be organized around business capabilities, not technical layers. Each service should have a single responsibility and own its domain.

**Incorrect: Services organized by technical layers**

```plaintext
Services/
├── Database.Service/      ❌ Technical concern
├── Business.Logic/        ❌ Too broad
└── Api.Layer/            ❌ Not business-focused
```

**Correct: Services organized by business domains**

```plaintext
Services/
├── Product.API/          ✅ Product catalog management
├── Customer.API/         ✅ Customer data and profiles
├── Ordering.API/         ✅ Order processing
├── Payment.API/          ✅ Payment processing
├── Inventory.API/        ✅ Stock management
├── Basket.API/           ✅ Shopping cart
├── Identity.API/         ✅ Authentication & Authorization
├── FlashSale.API/        ✅ Flash sale campaigns
└── GroupBuy.API/         ✅ Group buying features
```

### 1.2 Service Communication Patterns

**Impact: HIGH (determines scalability and coupling)**

Use synchronous HTTP for queries, async messaging for commands and events.

**Incorrect: Direct database access between services**

```csharp
// ❌ OrderService accessing CustomerDb directly
public class OrderService
{
    private readonly CustomerDbContext _customerDb;

    public async Task CreateOrder(CreateOrderRequest request)
    {
        // Direct database access violates service boundaries
        var customer = await _customerDb.Customers
            .FirstOrDefaultAsync(c => c.Id == request.CustomerId);
    }
}
```

**Correct: API call or event-based communication**

```csharp
// ✅ OrderService calling Customer.API
public class OrderService
{
    private readonly ICustomerApiClient _customerClient;

    public async Task CreateOrder(CreateOrderRequest request)
    {
        // Synchronous API call for queries
        var customer = await _customerClient
            .GetCustomerByIdAsync(request.CustomerId);

        if (customer == null)
            return Result.Failure("Customer not found");

        var order = new Order(customer.Id, customer.Email);
        await _orderRepository.AddAsync(order);

        // Async event for notifications
        await _messageBus.PublishAsync(new OrderCreatedEvent
        {
            OrderId = order.Id,
            CustomerId = customer.Id,
            TotalAmount = order.Total
        });
    }
}
```

### 1.3 Database per Service

**Impact: CRITICAL (ensures data ownership)**

Each service must have its own database/schema. No shared databases between services.

**Incorrect: Shared database**

```yaml
# ❌ All services using same database
services:
  product.api:
    environment:
      - ConnectionStrings__DefaultConnectionString=Host=nexusdb;Database=SharedDb

  ordering.api:
    environment:
      - ConnectionStrings__DefaultConnectionString=Host=nexusdb;Database=SharedDb
```

**Correct: Isolated databases**

```yaml
# ✅ Each service has its own database
services:
  product.api:
    environment:
      - ConnectionStrings__DefaultConnectionString=Host=nexusdb;Database=ProductDb

  ordering.api:
    environment:
      - ConnectionStrings__DefaultConnectionString=Host=nexusdb;Database=OrderDb
```

**Implementation in appsettings.json:**

```json
{
  "ConnectionStrings": {
    "DefaultConnectionString": "Host=nexusdb;Port=5432;Database=ProductDb;Username=admin;Password=admin1234;"
  }
}
```

---

## 2. API Gateway Pattern

**Impact: CRITICAL**

API Gateway (Ocelot) provides single entry point, routing, load balancing, authentication, rate limiting, and aggregation.

### 2.1 Gateway Configuration

**Impact: CRITICAL (controls all external access)**

Configure routes, downstream services, QoS, rate limiting, and caching in ocelot.json.

**Correct: Comprehensive gateway configuration**

```json
{
  "Routes": [
    {
      "DownstreamPathTemplate": "/api/v1/products",
      "DownstreamScheme": "http",
      "DownstreamHostAndPorts": [
        {
          "Host": "product.api",
          "Port": 80
        }
      ],
      "UpstreamPathTemplate": "/products",
      "UpstreamHttpMethod": ["GET"],
      "RateLimitOptions": {
        "ClientWhitelist": [],
        "EnableRateLimiting": true,
        "Period": "1m",
        "PeriodTimespan": 60,
        "Limit": 100
      },
      "QoSOptions": {
        "ExceptionsAllowedBeforeBreaking": 3,
        "DurationOfBreak": 5000,
        "TimeoutValue": 10000
      },
      "FileCacheOptions": {
        "TtlSeconds": 30,
        "Region": "products"
      }
    }
  ],
  "GlobalConfiguration": {
    "BaseUrl": "http://localhost:5000",
    "RateLimitOptions": {
      "DisableRateLimitHeaders": false,
      "QuotaExceededMessage": "Rate limit exceeded. Retry after {0}",
      "HttpStatusCode": 429
    }
  }
}
```

### 2.2 Gateway Dependencies

**Impact: HIGH (required for QoS and caching)**

Always include required Ocelot packages for production features.

**Required packages in OcelotApiGw.csproj:**

```xml
<PackageReference Include="Ocelot" Version="23.0.0" />
<PackageReference Include="Ocelot.Provider.Polly" Version="23.0.0" />
<PackageReference Include="Ocelot.Cache.CacheManager" Version="23.0.0" />
```

**Program.cs registration:**

```csharp
using Ocelot.DependencyInjection;
using Ocelot.Middleware;
using Ocelot.Provider.Polly;
using Ocelot.Cache.CacheManager;

var builder = WebApplication.CreateBuilder(args);

// Add Ocelot with Polly (QoS) and CacheManager
builder.Services
    .AddOcelot(builder.Configuration)
    .AddCacheManager(x => x.WithDictionaryHandle())
    .AddPolly();

var app = builder.Build();

await app.UseOcelot();
app.Run();
```

---

## 3. Event-Driven Communication

**Impact: HIGH**

Use RabbitMQ for async communication between services. Events represent facts that happened in the past.

### 3.1 Event Naming Convention

**Impact: MEDIUM (ensures clarity)**

Events should be named in past tense: `[Entity][Action]Event`

**Incorrect: Command-style naming**

```csharp
// ❌ Sounds like a command
public class CreateOrderEvent { }
public class UpdateInventoryEvent { }
```

**Correct: Past-tense event naming**

```csharp
// ✅ Represents something that happened
public class OrderCreatedEvent
{
    public Guid OrderId { get; init; }
    public Guid CustomerId { get; init; }
    public decimal TotalAmount { get; init; }
    public DateTime CreatedAt { get; init; }
}

public class InventoryUpdatedEvent
{
    public Guid ProductId { get; init; }
    public int QuantityChanged { get; init; }
    public int CurrentStock { get; init; }
}
```

### 3.2 Event Publishing

**Impact: HIGH (ensures reliable messaging)**

Publish events after successful database transaction using outbox pattern or immediate publish.

**Correct: Event publishing with RabbitMQ**

```csharp
public class OrderService
{
    private readonly IOrderRepository _repository;
    private readonly IBusPublisher _busPublisher;

    public async Task<Result<Order>> CreateOrderAsync(CreateOrderCommand command)
    {
        // Create order
        var order = new Order(command.CustomerId, command.Items);
        await _repository.AddAsync(order);

        // Publish event after commit
        await _busPublisher.PublishAsync(new OrderCreatedEvent
        {
            OrderId = order.Id,
            CustomerId = order.CustomerId,
            TotalAmount = order.TotalAmount,
            CreatedAt = DateTime.UtcNow
        }, "orders.created");

        return Result.Success(order);
    }
}
```

### 3.3 Event Handling

**Impact: HIGH (ensures idempotency)**

Event handlers must be idempotent. Handle duplicate events gracefully.

**Correct: Idempotent event handler**

```csharp
public class OrderCreatedEventHandler : IEventHandler<OrderCreatedEvent>
{
    private readonly IInventoryService _inventoryService;
    private readonly IProcessedEventRepository _processedEvents;

    public async Task HandleAsync(OrderCreatedEvent @event)
    {
        // Check if already processed (idempotency)
        if (await _processedEvents.ExistsAsync(@event.OrderId))
        {
            _logger.LogInformation("Event already processed: {OrderId}", @event.OrderId);
            return;
        }

        try
        {
            // Reserve inventory
            await _inventoryService.ReserveStockAsync(
                @event.OrderId,
                @event.Items);

            // Mark as processed
            await _processedEvents.MarkAsProcessedAsync(@event.OrderId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to handle OrderCreated event");
            throw; // Requeue for retry
        }
    }
}
```

---

## 4. Data Management

**Impact: HIGH**

Each service owns its data. Use eventual consistency with events for cross-service data needs.

### 4.1 Eventual Consistency

**Impact: HIGH (distributed data strategy)**

Accept that data across services will be eventually consistent, not immediately consistent.

**Scenario: Order creation needs customer data**

```csharp
// ✅ Synchronous call for validation
var customer = await _customerApiClient.GetCustomerAsync(customerId);
if (customer == null)
    return Result.Failure("Customer not found");

// ✅ Create order in local database
var order = new Order(customer.Id, customer.Email);
await _orderRepository.AddAsync(order);

// ✅ Publish event for other services
await _eventBus.PublishAsync(new OrderCreatedEvent
{
    OrderId = order.Id,
    CustomerId = customer.Id
});

// ⚠️ Payment service will eventually process this order
// ⚠️ Inventory service will eventually reserve stock
// ⚠️ Notification service will eventually send email
```

### 4.2 Data Replication for Queries

**Impact: MEDIUM (read performance optimization)**

Replicate read-only data from other services for query performance.

**Correct: Local cache of customer names for order list**

```csharp
// Customer.API publishes customer updates
public class CustomerUpdatedEvent
{
    public Guid CustomerId { get; init; }
    public string FullName { get; init; }
    public string Email { get; init; }
}

// Order.API maintains local customer cache
public class CustomerCacheUpdater : IEventHandler<CustomerUpdatedEvent>
{
    private readonly ICustomerCacheRepository _cache;

    public async Task HandleAsync(CustomerUpdatedEvent @event)
    {
        await _cache.UpsertAsync(new CustomerCache
        {
            CustomerId = @event.CustomerId,
            FullName = @event.FullName,
            Email = @event.Email
        });
    }
}

// Fast queries without calling Customer.API
public async Task<List<OrderDto>> GetOrdersAsync()
{
    var orders = await _orderRepository.GetAllAsync();
    return orders.Select(o => new OrderDto
    {
        OrderId = o.Id,
        CustomerName = _customerCache.GetName(o.CustomerId), // Local cache
        TotalAmount = o.TotalAmount
    }).ToList();
}
```

---

## 5. Resilience Patterns

**Impact: MEDIUM-HIGH**

Services must handle failures gracefully: network timeouts, service unavailability, partial failures.

### 5.1 Circuit Breaker

**Impact: HIGH (prevents cascading failures)**

Use Polly circuit breaker to stop calling failing services.

**Correct: Circuit breaker for external API calls**

```csharp
public class ResilientHttpClient
{
    private readonly IAsyncPolicy<HttpResponseMessage> _circuitBreakerPolicy;

    public ResilientHttpClient()
    {
        _circuitBreakerPolicy = Policy
            .HandleResult<HttpResponseMessage>(r => !r.IsSuccessStatusCode)
            .Or<HttpRequestException>()
            .CircuitBreakerAsync(
                handledEventsAllowedBeforeBreaking: 3,
                durationOfBreak: TimeSpan.FromSeconds(30),
                onBreak: (result, duration) =>
                {
                    _logger.LogWarning("Circuit breaker opened for {Duration}s", duration.TotalSeconds);
                },
                onReset: () =>
                {
                    _logger.LogInformation("Circuit breaker reset");
                });
    }

    public async Task<T> GetAsync<T>(string url)
    {
        var response = await _circuitBreakerPolicy.ExecuteAsync(() =>
            _httpClient.GetAsync(url));

        response.EnsureSuccessStatusCode();
        return await response.Content.ReadFromJsonAsync<T>();
    }
}
```

### 5.2 Retry with Exponential Backoff

**Impact: MEDIUM (handles transient failures)**

Retry failed operations with increasing delays.

**Correct: Retry policy**

```csharp
var retryPolicy = Policy
    .Handle<HttpRequestException>()
    .Or<TimeoutException>()
    .WaitAndRetryAsync(
        retryCount: 3,
        sleepDurationProvider: retryAttempt =>
            TimeSpan.FromSeconds(Math.Pow(2, retryAttempt)),
        onRetry: (exception, timeSpan, retryCount, context) =>
        {
            _logger.LogWarning(
                "Retry {RetryCount} after {Delay}s due to {Exception}",
                retryCount,
                timeSpan.TotalSeconds,
                exception.GetType().Name);
        });

await retryPolicy.ExecuteAsync(async () =>
{
    return await _httpClient.GetAsync(url);
});
```

### 5.3 Timeout Policy

**Impact: MEDIUM (prevents hanging requests)**

Always set timeouts for external calls.

```csharp
var timeoutPolicy = Policy
    .TimeoutAsync<HttpResponseMessage>(
        timeout: TimeSpan.FromSeconds(10),
        onTimeoutAsync: async (context, timespan, task) =>
        {
            _logger.LogWarning("Request timed out after {Timeout}s", timespan.TotalSeconds);
        });

var response = await timeoutPolicy.ExecuteAsync(() =>
    _httpClient.GetAsync(url));
```

---

## 6. Observability

**Impact: MEDIUM**

Implement logging, monitoring, and distributed tracing across all services.

### 6.1 Structured Logging with Serilog

**Impact: MEDIUM (debugging and monitoring)**

Use structured logging with Elasticsearch sink.

**Correct: Serilog configuration**

```csharp
// Program.cs
builder.Host.UseSerilog((context, configuration) =>
{
    configuration
        .ReadFrom.Configuration(context.Configuration)
        .Enrich.FromLogContext()
        .Enrich.WithMachineName()
        .Enrich.WithProperty("Application", "Product.API")
        .WriteTo.Console()
        .WriteTo.Elasticsearch(new ElasticsearchSinkOptions(
            new Uri(context.Configuration["ElasticConfiguration:Uri"]))
        {
            AutoRegisterTemplate = true,
            IndexFormat = $"nexus-commerce-logs-{DateTime.UtcNow:yyyy-MM}",
            NumberOfShards = 2,
            NumberOfReplicas = 1
        });
});
```

**Usage in code:**

```csharp
public class ProductService
{
    private readonly ILogger<ProductService> _logger;

    public async Task<Product> CreateProductAsync(CreateProductCommand command)
    {
        _logger.LogInformation(
            "Creating product {ProductName} in category {CategoryId}",
            command.Name,
            command.CategoryId);

        try
        {
            var product = new Product(command.Name, command.Price);
            await _repository.AddAsync(product);

            _logger.LogInformation(
                "Product created successfully {ProductId}",
                product.Id);

            return product;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "Failed to create product {ProductName}",
                command.Name);
            throw;
        }
    }
}
```

### 6.2 Health Checks

**Impact: MEDIUM (infrastructure monitoring)**

Implement health checks for all dependencies.

```csharp
builder.Services
    .AddHealthChecks()
    .AddNpgSql(connectionString, name: "postgresql")
    .AddRedis(redisConnection, name: "redis")
    .AddRabbitMQ(rabbitConnection, name: "rabbitmq")
    .AddElasticsearch(elasticConnection, name: "elasticsearch");

app.MapHealthChecks("/health", new HealthCheckOptions
{
    ResponseWriter = UIResponseWriter.WriteHealthCheckUIResponse
});
```

---

## 7. Security

**Impact: MEDIUM**

Implement authentication, authorization, and secure communication.

### 7.1 JWT Authentication

**Impact: MEDIUM (API security)**

Use JWT tokens issued by Identity.API for all protected endpoints.

```csharp
// Identity.API issues tokens
public class TokenService
{
    public string GenerateToken(User user)
    {
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role)
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.Secret));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _jwtSettings.Issuer,
            audience: _jwtSettings.Audience,
            claims: claims,
            expires: DateTime.UtcNow.AddHours(24),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}

// Other services validate tokens
builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings.Issuer,
            ValidAudience = jwtSettings.Audience,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwtSettings.Secret))
        };
    });
```

---

## 8. Quick Reference Templates

### 8.1 New Microservice Template

```plaintext
Services/[ServiceName].API/
├── Controllers/
│   └── [Entity]Controller.cs
├── Entities/
│   └── [Entity].cs
├── Repositories/
│   ├── I[Entity]Repository.cs
│   └── [Entity]Repository.cs
├── Services/
│   └── [Entity]Service.cs
├── Extensions/
│   └── ServiceExtensions.cs
├── appsettings.json
├── appsettings.Development.json
├── Dockerfile
└── Program.cs
```

### 8.2 Docker Compose Service Template

```yaml
[service-name].api:
  image: ${DOCKER_REGISTRY-}src/[service-name]-api:${TAG:-latest}
  container_name: src-[service-name]-api
  build:
    context: .
    dockerfile: Services/[ServiceName].API/Dockerfile
  environment:
    - ASPNETCORE_ENVIRONMENT=Development
    - ConnectionStrings__DefaultConnectionString=Host=nexusdb;Database=[ServiceName]Db
    - EventBusSettings__HostAddress=amqp://guest:guest@rabbitmq:5672
    - ElasticConfiguration__Uri=http://elasticsearch:9200
  depends_on:
    - nexusdb
    - rabbitmq
    - elasticsearch
  restart: always
```

### 8.3 Dockerfile Multi-Stage Template

```dockerfile
# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy csproj and restore dependencies (cached layer)
COPY ["Services/[ServiceName].API/[ServiceName].API.csproj", "Services/[ServiceName].API/"]
COPY ["BuildingBlocks/Shared/Shared.csproj", "BuildingBlocks/Shared/"]
RUN dotnet restore "Services/[ServiceName].API/[ServiceName].API.csproj"

# Copy source code and build
COPY . .
WORKDIR "/src/Services/[ServiceName].API"
RUN dotnet build "[ServiceName].API.csproj" -c Release -o /app/build

# Publish stage
FROM build AS publish
RUN dotnet publish "[ServiceName].API.csproj" -c Release -o /app/publish

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
EXPOSE 80
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "[ServiceName].API.dll"]
```

---

## Conclusion

This guide provides the foundation for building scalable, resilient microservices with ASP.NET Core. Follow these patterns consistently across all services to maintain system integrity and team productivity.

**Key Takeaways:**

1. ✅ Design services around business domains, not technical layers
2. ✅ Each service owns its database—no shared databases
3. ✅ Use API Gateway (Ocelot) as single entry point
4. ✅ Communicate via HTTP for queries, events for commands
5. ✅ Implement circuit breakers and retry policies
6. ✅ Use structured logging and health checks
7. ✅ Secure APIs with JWT authentication

**Next Steps:**

- Review existing services against these patterns
- Refactor non-compliant code
- Add missing resilience patterns
- Improve observability with Elasticsearch/Kibana
