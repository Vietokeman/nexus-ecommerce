# 📘 SECTION 10 — Advanced Configuration & Extensions: Detailed Implementation Guide

**Scope:** Transaction Management, ELK Stack, Polly Resilience, Health Checks, WebHealthStatus  
**Technologies:** Serilog, Elasticsearch, Kibana, Polly, ASP.NET Health Checks, Hangfire  
**Date:** February 15, 2026

---

## 📋 Table of Contents

1. [Transaction Management Across Microservices](#1-transaction-management-across-microservices)
2. [Elasticsearch & Kibana Integration](#2-elasticsearch--kibana-integration)
3. [Serilog → Elasticsearch Pipeline](#3-serilog--elasticsearch-pipeline)
4. [Request Correlation & Distributed Tracing](#4-request-correlation--distributed-tracing)
5. [Polly Resilience Policies](#5-polly-resilience-policies)
6. [Health Checks Implementation](#6-health-checks-implementation)
7. [WebHealthStatus Dashboard](#7-webhealthstatus-dashboard)
8. [Docker Compose Updates](#8-docker-compose-updates)
9. [Implementation Tasks & Timeline](#9-implementation-tasks--timeline)

---

## 1. Transaction Management Across Microservices

### The Problem

In a microservices architecture, a single business operation (e.g., checkout) spans multiple services:

1. **Basket.API** → Remove items from cart
2. **Ordering.API** → Create order
3. **Inventory.API** → Deduct stock
4. **Payment.API** → Process payment

If step 3 fails, steps 1-2 must be rolled back. Traditional DB transactions don't work across service boundaries.

### Solution: Saga Pattern with Outbox

#### Choreography-Based Saga (Event-Driven)

```
Basket.API                  Ordering.API              Inventory.API            Payment.API
    │                           │                          │                       │
    │── BasketCheckoutEvent ──→ │                          │                       │
    │                           │── OrderCreatedEvent ──→  │                       │
    │                           │                          │── StockReservedEvent ─→│
    │                           │                          │                       │── PaymentProcessed
    │                           │←── OrderConfirmedEvent ──│←── PaymentSuccess ────│
    │                           │                          │                       │
    │ [If any step fails]       │                          │                       │
    │                           │←── CompensateOrderEvent  │←── CompensateStock    │
    │←── CompensateBasketEvent ─│                          │                       │
```

#### Outbox Pattern Implementation

Each service maintains an **Outbox table** to ensure events are published reliably:

```csharp
// Domain/Entities/OutboxMessage.cs (add to BuildingBlocks/Contracts)
public class OutboxMessage
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string EventType { get; set; } = string.Empty;
    public string Payload { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ProcessedAt { get; set; }
    public int RetryCount { get; set; }
    public string? Error { get; set; }
}
```

```csharp
// Infrastructure/Outbox/OutboxProcessor.cs
public class OutboxProcessor : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly IMessageProducer _messageProducer;
    private readonly ILogger<OutboxProcessor> _logger;

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            using var scope = _serviceProvider.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<OrderContext>();

            var messages = await dbContext.OutboxMessages
                .Where(m => m.ProcessedAt == null && m.RetryCount < 3)
                .OrderBy(m => m.CreatedAt)
                .Take(10)
                .ToListAsync(stoppingToken);

            foreach (var message in messages)
            {
                try
                {
                    await _messageProducer.PublishAsync(message.EventType, message.Payload);
                    message.ProcessedAt = DateTime.UtcNow;
                }
                catch (Exception ex)
                {
                    message.RetryCount++;
                    message.Error = ex.Message;
                    _logger.LogError(ex, "Failed to publish outbox message {Id}", message.Id);
                }
            }

            await dbContext.SaveChangesAsync(stoppingToken);
            await Task.Delay(TimeSpan.FromSeconds(5), stoppingToken);
        }
    }
}
```

#### Compensation Events

```csharp
// EventBus.Messages/Events/
public record OrderCompensationEvent : IntegrationBaseEvent
{
    public string OrderNo { get; init; } = string.Empty;
    public string Reason { get; init; } = string.Empty;
}

public record StockCompensationEvent : IntegrationBaseEvent
{
    public string ItemNo { get; init; } = string.Empty;
    public int Quantity { get; init; }
}

public record PaymentRefundEvent : IntegrationBaseEvent
{
    public string OrderNo { get; init; } = string.Empty;
    public decimal Amount { get; init; }
}
```

---

## 2. Elasticsearch & Kibana Integration

### Current State

- **Elasticsearch** container running at `:9200` (docker-compose.override.yml)
- **Kibana** container running at `:5601`
- **Ocelot Gateway** already pushes logs to ES (`ocelot-gateway-logs-*` index)
- Other services log to Console/Debug only

### Goal

Push ALL microservice logs to Elasticsearch for centralized monitoring.

### 2.1 NuGet Packages Required (per service)

```xml
<PackageReference Include="Serilog.Sinks.Elasticsearch" Version="10.0.0" />
<PackageReference Include="Serilog.Enrichers.Environment" Version="3.0.1" />
<PackageReference Include="Serilog.Enrichers.Thread" Version="4.0.0" />
```

### 2.2 Serilog Configuration (appsettings.json)

Add to each microservice's `appsettings.json`:

```json
{
  "Serilog": {
    "MinimumLevel": {
      "Default": "Information",
      "Override": {
        "Microsoft": "Warning",
        "Microsoft.Hosting.Lifetime": "Information",
        "System": "Warning"
      }
    },
    "WriteTo": [
      { "Name": "Console" },
      {
        "Name": "Elasticsearch",
        "Args": {
          "nodeUris": "http://elasticsearch:9200",
          "autoRegisterTemplate": true,
          "indexFormat": "{service-name}-logs-{0:yyyy.MM.dd}",
          "numberOfShards": 2,
          "numberOfReplicas": 1
        }
      }
    ],
    "Enrich": ["FromLogContext", "WithMachineName", "WithThreadId"],
    "Properties": {
      "Application": "{service-name}"
    }
  },
  "ElasticConfiguration": {
    "Uri": "http://elasticsearch:9200"
  }
}
```

### 2.3 Update Common.Logging/SeriLogger.cs

```csharp
using Serilog;
using Serilog.Sinks.Elasticsearch;

namespace Common.Logging;

public static class SeriLogger
{
    public static Action<HostBuilderContext, LoggerConfiguration> Configure =>
        (context, configuration) =>
        {
            var elasticUri = context.Configuration.GetValue<string>("ElasticConfiguration:Uri")
                             ?? "http://localhost:9200";
            var applicationName = context.HostingEnvironment.ApplicationName?.ToLower().Replace(".", "-")
                                  ?? "unknown";
            var environment = context.HostingEnvironment.EnvironmentName?.ToLower().Replace(".", "-")
                              ?? "development";

            configuration
                .Enrich.FromLogContext()
                .Enrich.WithMachineName()
                .Enrich.WithProperty("Environment", environment)
                .Enrich.WithProperty("Application", applicationName)
                .WriteTo.Debug()
                .WriteTo.Console()
                .WriteTo.Elasticsearch(new ElasticsearchSinkOptions(new Uri(elasticUri))
                {
                    AutoRegisterTemplate = true,
                    IndexFormat = $"{applicationName}-{environment}-logs-{{0:yyyy.MM.dd}}",
                    NumberOfReplicas = 1,
                    NumberOfShards = 2
                })
                .ReadFrom.Configuration(context.Configuration);
        };
}
```

### 2.4 Index Naming Convention

| Service        | Index Pattern                               |
| -------------- | ------------------------------------------- |
| Product.API    | `product-api-development-logs-2026.02.15`   |
| Customer.API   | `customer-api-development-logs-2026.02.15`  |
| Basket.API     | `basket-api-development-logs-2026.02.15`    |
| Ordering.API   | `ordering-api-development-logs-2026.02.15`  |
| Inventory.API  | `inventory-api-development-logs-2026.02.15` |
| Payment.API    | `payment-api-development-logs-2026.02.15`   |
| Identity.API   | `identity-api-development-logs-2026.02.15`  |
| Ocelot Gateway | `ocelot-gateway-logs-2026.02.15`            |

---

## 3. Serilog → Elasticsearch Pipeline

### Log Flow Architecture

```
                         ┌──────────────────┐
Product.API ─────────────┤                  │
Customer.API ────────────┤                  │
Basket.API ──────────────┤  Elasticsearch   │──→ Kibana (:5601)
Ordering.API ────────────┤     (:9200)      │    ├── Dashboard
Inventory.API ───────────┤                  │    ├── Log Search
Payment.API ─────────────┤                  │    ├── Alerts
Identity.API ────────────┤                  │    └── Correlation
Ocelot Gateway ──────────┤                  │
                         └──────────────────┘
```

### 3.1 Structured Logging Best Practices

```csharp
// ✅ Good — structured properties
_logger.LogInformation("Order {OrderId} created for customer {CustomerId} with total {Total:C}",
    order.Id, order.CustomerId, order.Total);

// ❌ Bad — string interpolation (loses structure)
_logger.LogInformation($"Order {order.Id} created for customer {order.CustomerId}");
```

### 3.2 Kibana Dashboard Setup

After services push logs to ES, configure Kibana:

1. **Navigate to** `http://localhost:5601`
2. **Create Index Patterns:**
   - `*-logs-*` (all services)
   - `product-api-*-logs-*` (product only)
   - `ocelot-gateway-logs-*` (gateway only)
3. **Key Visualizations:**
   - Request count by service (bar chart)
   - Error rate over time (line chart)
   - Response time percentiles (area chart)
   - Correlation ID trace view (search)
   - Top error messages (data table)

---

## 4. Request Correlation & Distributed Tracing

### 4.1 Correlation ID Flow

```
React Client                   Ocelot Gateway              Product.API
    │                              │                            │
    │── Request ─────────────────→ │                            │
    │   (no correlation ID)        │                            │
    │                              │─ Generate: X-Correlation-ID│
    │                              │  = "abc-123-def"           │
    │                              │                            │
    │                              │── Proxy Request ──────────→│
    │                              │   X-Correlation-ID:abc-123 │
    │                              │                            │
    │                              │←── Response ──────────────│
    │                              │   X-Correlation-ID:abc-123 │
    │←── Response ────────────────│                             │
    │   X-Correlation-ID:abc-123  │                             │
```

### 4.2 Delegating Handler for HttpClient

```csharp
// BuildingBlocks/Infrastructure/Common/CorrelationIdDelegatingHandler.cs
public class CorrelationIdDelegatingHandler : DelegatingHandler
{
    private readonly IHttpContextAccessor _httpContextAccessor;
    private const string CorrelationIdHeader = "X-Correlation-ID";

    public CorrelationIdDelegatingHandler(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    protected override async Task<HttpResponseMessage> SendAsync(
        HttpRequestMessage request, CancellationToken cancellationToken)
    {
        var correlationId = _httpContextAccessor.HttpContext?
            .Request.Headers[CorrelationIdHeader].FirstOrDefault()
            ?? Guid.NewGuid().ToString();

        request.Headers.TryAddWithoutValidation(CorrelationIdHeader, correlationId);

        return await base.SendAsync(request, cancellationToken);
    }
}
```

### 4.3 Register in All Services

```csharp
// Program.cs (each service)
builder.Services.AddHttpContextAccessor();
builder.Services.AddTransient<CorrelationIdDelegatingHandler>();

builder.Services.AddHttpClient("downstream-service")
    .AddHttpMessageHandler<CorrelationIdDelegatingHandler>();
```

---

## 5. Polly Resilience Policies

### 5.1 NuGet Packages

```xml
<PackageReference Include="Microsoft.Extensions.Http.Polly" Version="8.0.*" />
<PackageReference Include="Polly" Version="8.4.*" />
<PackageReference Include="Polly.Extensions.Http" Version="3.0.*" />
```

### 5.2 Policy Definitions

#### Retry Policy (Exponential Backoff)

```csharp
// BuildingBlocks/Infrastructure/Policies/HttpClientPolicies.cs
public static class HttpClientPolicies
{
    // Retry 3 times with exponential backoff: 2s, 4s, 8s
    public static IAsyncPolicy<HttpResponseMessage> GetRetryPolicy()
    {
        return HttpPolicyExtensions
            .HandleTransientHttpError()
            .OrResult(msg => msg.StatusCode == System.Net.HttpStatusCode.NotFound)
            .WaitAndRetryAsync(
                retryCount: 3,
                sleepDurationProvider: retryAttempt =>
                    TimeSpan.FromSeconds(Math.Pow(2, retryAttempt)),
                onRetry: (outcome, timespan, retryAttempt, context) =>
                {
                    Log.Warning(
                        "Retry {RetryAttempt} after {Delay}ms for {PolicyKey} due to {StatusCode}",
                        retryAttempt, timespan.TotalMilliseconds,
                        context.PolicyKey, outcome.Result?.StatusCode);
                });
    }

    // Circuit Breaker: open after 5 failures, stay open for 30s
    public static IAsyncPolicy<HttpResponseMessage> GetCircuitBreakerPolicy()
    {
        return HttpPolicyExtensions
            .HandleTransientHttpError()
            .CircuitBreakerAsync(
                handledEventsAllowedBeforeBreaking: 5,
                durationOfBreak: TimeSpan.FromSeconds(30),
                onBreak: (outcome, breakDelay) =>
                {
                    Log.Error(
                        "Circuit OPEN for {BreakDuration}s due to {StatusCode}",
                        breakDelay.TotalSeconds, outcome.Result?.StatusCode);
                },
                onReset: () => Log.Information("Circuit CLOSED — normal operations resumed"),
                onHalfOpen: () => Log.Information("Circuit HALF-OPEN — testing with single request"));
    }

    // Timeout: cancel after 30s
    public static IAsyncPolicy<HttpResponseMessage> GetTimeoutPolicy()
    {
        return Policy.TimeoutAsync<HttpResponseMessage>(
            seconds: 30,
            onTimeoutAsync: (context, timespan, task) =>
            {
                Log.Warning("Request timed out after {Timeout}s", timespan.TotalSeconds);
                return Task.CompletedTask;
            });
    }

    // Bulkhead: max 10 concurrent, 25 queued
    public static IAsyncPolicy<HttpResponseMessage> GetBulkheadPolicy()
    {
        return Policy.BulkheadAsync<HttpResponseMessage>(
            maxParallelization: 10,
            maxQueuingActions: 25,
            onBulkheadRejectedAsync: (context) =>
            {
                Log.Warning("Bulkhead rejected — too many concurrent requests");
                return Task.CompletedTask;
            });
    }

    // Combined policy wrap (order matters: outermost → innermost)
    public static IAsyncPolicy<HttpResponseMessage> GetCombinedPolicy()
    {
        return Policy.WrapAsync(
            GetBulkheadPolicy(),
            GetTimeoutPolicy(),
            GetRetryPolicy(),
            GetCircuitBreakerPolicy());
    }
}
```

### 5.3 Apply Polly to HttpClients

```csharp
// Basket.API/Program.cs — for Inventory gRPC HTTP fallback
builder.Services.AddHttpClient("InventoryService", c =>
{
    c.BaseAddress = new Uri("http://inventory.api:80");
    c.DefaultRequestHeaders.Add("Accept", "application/json");
})
.AddPolicyHandler(HttpClientPolicies.GetRetryPolicy())
.AddPolicyHandler(HttpClientPolicies.GetCircuitBreakerPolicy());

// Ordering.API/Program.cs — for downstream calls
builder.Services.AddHttpClient("ProductService", c =>
{
    c.BaseAddress = new Uri("http://product.api:80");
})
.AddPolicyHandler(HttpClientPolicies.GetCombinedPolicy());

// Payment.API/Program.cs — for PayOS external API (longer timeout)
builder.Services.AddHttpClient("PayOS", c =>
{
    c.BaseAddress = new Uri("https://api-merchant.payos.vn");
    c.Timeout = TimeSpan.FromSeconds(60);
})
.AddPolicyHandler(HttpPolicyExtensions
    .HandleTransientHttpError()
    .WaitAndRetryAsync(3, retryAttempt => TimeSpan.FromSeconds(retryAttempt * 2)))
.AddPolicyHandler(HttpPolicyExtensions
    .HandleTransientHttpError()
    .CircuitBreakerAsync(3, TimeSpan.FromSeconds(60)));
```

### 5.4 Polly Policy Summary

| Policy              | Config                      | Applied To               |
| ------------------- | --------------------------- | ------------------------ |
| **Retry**           | 3x exponential (2s, 4s, 8s) | All HTTP clients         |
| **Circuit Breaker** | 5 failures → 30s open       | All HTTP clients         |
| **Timeout**         | 30s (60s for PayOS)         | All HTTP clients         |
| **Bulkhead**        | 10 concurrent, 25 queued    | High-traffic endpoints   |
| **Fallback**        | Return cached/default value | Product catalog queries  |
| **Cache**           | In-memory 5min TTL          | Product list, categories |

---

## 6. Health Checks Implementation

### 6.1 NuGet Packages

```xml
<!-- All API projects -->
<PackageReference Include="AspNetCore.HealthChecks.UI.Client" Version="8.0.*" />

<!-- Per database type -->
<PackageReference Include="AspNetCore.HealthChecks.MySql" Version="8.0.*" />        <!-- Product -->
<PackageReference Include="AspNetCore.HealthChecks.NpgSql" Version="8.0.*" />       <!-- Customer -->
<PackageReference Include="AspNetCore.HealthChecks.Redis" Version="8.0.*" />        <!-- Basket -->
<PackageReference Include="AspNetCore.HealthChecks.SqlServer" Version="8.0.*" />    <!-- Ordering, Identity -->
<PackageReference Include="AspNetCore.HealthChecks.MongoDb" Version="8.0.*" />      <!-- Inventory -->
<PackageReference Include="AspNetCore.HealthChecks.Rabbitmq" Version="8.0.*" />     <!-- Basket, Ordering -->
<PackageReference Include="AspNetCore.HealthChecks.Elasticsearch" Version="8.0.*" /><!-- All -->
```

### 6.2 Health Check Configuration Per Service

#### Product.API (MySQL)

```csharp
// Program.cs
builder.Services.AddHealthChecks()
    .AddMySql(
        connectionString: builder.Configuration.GetConnectionString("DefaultConnectionString")!,
        name: "MySQL-ProductDb",
        tags: new[] { "db", "mysql", "product" })
    .AddElasticsearch(
        elasticsearchUri: builder.Configuration["ElasticConfiguration:Uri"]!,
        name: "Elasticsearch",
        tags: new[] { "logging", "elasticsearch" });

// After app.Build()
app.MapHealthChecks("/health", new HealthCheckOptions
{
    Predicate = _ => true,
    ResponseWriter = UIResponseWriter.WriteHealthCheckUIResponse
});
app.MapHealthChecks("/health/ready", new HealthCheckOptions
{
    Predicate = check => check.Tags.Contains("db"),
    ResponseWriter = UIResponseWriter.WriteHealthCheckUIResponse
});
app.MapHealthChecks("/health/live", new HealthCheckOptions
{
    Predicate = _ => false  // just checks if app is running
});
```

#### Customer.API (PostgreSQL)

```csharp
builder.Services.AddHealthChecks()
    .AddNpgSql(
        connectionString: builder.Configuration.GetConnectionString("DefaultConnectionString")!,
        name: "PostgreSQL-CustomerDb",
        tags: new[] { "db", "postgresql", "customer" })
    .AddElasticsearch(...);
```

#### Basket.API (Redis + RabbitMQ)

```csharp
builder.Services.AddHealthChecks()
    .AddRedis(
        redisConnectionString: builder.Configuration["CacheSettings:ConnectionString"]!,
        name: "Redis-BasketCache",
        tags: new[] { "cache", "redis", "basket" })
    .AddRabbitMQ(
        rabbitConnectionString: "amqp://guest:guest@rabbitmq:5672",
        name: "RabbitMQ",
        tags: new[] { "messaging", "rabbitmq" })
    .AddElasticsearch(...);
```

#### Ordering.API (SQL Server + RabbitMQ)

```csharp
builder.Services.AddHealthChecks()
    .AddSqlServer(
        connectionString: builder.Configuration.GetConnectionString("DefaultConnectionString")!,
        name: "SQLServer-OrderDb",
        tags: new[] { "db", "sqlserver", "ordering" })
    .AddRabbitMQ(...)
    .AddElasticsearch(...);
```

#### Inventory.API (MongoDB)

```csharp
builder.Services.AddHealthChecks()
    .AddMongoDb(
        mongodbConnectionString: builder.Configuration["MongoDbSettings:ConnectionString"]!,
        name: "MongoDB-InventoryDb",
        tags: new[] { "db", "mongodb", "inventory" })
    .AddElasticsearch(...);
```

### 6.3 Health Check Endpoints Summary

| Service        | URL            | Checks                               |
| -------------- | -------------- | ------------------------------------ |
| Product.API    | `:6002/health` | MySQL, Elasticsearch                 |
| Customer.API   | `:6003/health` | PostgreSQL, Elasticsearch            |
| Basket.API     | `:6004/health` | Redis, RabbitMQ, Elasticsearch       |
| Ordering.API   | `:6005/health` | SQL Server, RabbitMQ, Elasticsearch  |
| Inventory.API  | `:6006/health` | MongoDB, Elasticsearch               |
| Payment.API    | `:6007/health` | SQL Server, PayOS API, Elasticsearch |
| Identity.API   | `:6009/health` | SQL Server, Elasticsearch            |
| Ocelot Gateway | `:5000/health` | Elasticsearch                        |

### 6.4 Health Check Response Format

```json
{
  "status": "Healthy",
  "totalDuration": "00:00:00.0456789",
  "entries": {
    "MySQL-ProductDb": {
      "data": {},
      "duration": "00:00:00.0123456",
      "status": "Healthy",
      "tags": ["db", "mysql", "product"]
    },
    "Elasticsearch": {
      "data": {},
      "duration": "00:00:00.0234567",
      "status": "Healthy",
      "tags": ["logging", "elasticsearch"]
    }
  }
}
```

---

## 7. WebHealthStatus Dashboard

### 7.1 Replace Current Scaffold

The current `WebHealthStatus` project is an empty MVC template. Replace with a proper health monitoring dashboard.

### 7.2 NuGet Packages

```xml
<PackageReference Include="AspNetCore.HealthChecks.UI" Version="8.0.*" />
<PackageReference Include="AspNetCore.HealthChecks.UI.InMemory.Storage" Version="8.0.*" />
```

### 7.3 Program.cs

```csharp
var builder = WebApplication.CreateBuilder(args);

// Health check UI
builder.Services.AddHealthChecksUI(setup =>
{
    setup.SetEvaluationTimeInSeconds(30);  // check every 30s
    setup.MaximumHistoryEntriesPerEndpoint(50);

    // Register all microservice health endpoints
    setup.AddHealthCheckEndpoint("Product.API", "http://product.api:80/health");
    setup.AddHealthCheckEndpoint("Customer.API", "http://customer.api:80/health");
    setup.AddHealthCheckEndpoint("Basket.API", "http://basket.api:80/health");
    setup.AddHealthCheckEndpoint("Ordering.API", "http://ordering.api:80/health");
    setup.AddHealthCheckEndpoint("Inventory.API", "http://inventory.api:80/health");
    setup.AddHealthCheckEndpoint("Payment.API", "http://payment.api:80/health");
    setup.AddHealthCheckEndpoint("Identity.API", "http://identity.api:80/health");
    setup.AddHealthCheckEndpoint("API Gateway", "http://ocelot.apigw:80/health");
})
.AddInMemoryStorage();

var app = builder.Build();

app.MapHealthChecksUI(config =>
{
    config.UIPath = "/health-ui";            // Dashboard UI
    config.ApiPath = "/health-api";          // API endpoint
    config.ResourcesPath = "/health-resources"; // Static resources
});

app.MapGet("/", () => Results.Redirect("/health-ui"));
app.Run();
```

### 7.4 appsettings.json

```json
{
  "HealthChecksUI": {
    "HealthChecks": [
      { "Name": "Product.API", "Uri": "http://product.api:80/health" },
      { "Name": "Customer.API", "Uri": "http://customer.api:80/health" },
      { "Name": "Basket.API", "Uri": "http://basket.api:80/health" },
      { "Name": "Ordering.API", "Uri": "http://ordering.api:80/health" },
      { "Name": "Inventory.API", "Uri": "http://inventory.api:80/health" },
      { "Name": "Payment.API", "Uri": "http://payment.api:80/health" },
      { "Name": "Identity.API", "Uri": "http://identity.api:80/health" },
      { "Name": "API Gateway", "Uri": "http://ocelot.apigw:80/health" }
    ],
    "EvaluationTimeInSeconds": 30,
    "MinimumSecondsBetweenFailureNotifications": 60
  }
}
```

### 7.5 Docker Compose Entry

```yaml
webhealthstatus:
  container_name: webhealthstatus
  image: ${DOCKER_REGISTRY-}webhealthstatus:${PLATFORM:-linux}-${TAG:-latest}
  build:
    context: .
    dockerfile: WebApps/WebHealthStatus/Dockerfile
  environment:
    - ASPNETCORE_ENVIRONMENT=Development
    - ASPNETCORE_URLS=http://+:80
  depends_on:
    - product.api
    - customer.api
    - basket.api
    - ordering.api
    - inventory.api
    - ocelot.apigw
  ports:
    - "6010:80"
  restart: always
```

### 7.6 Dashboard Features

| Feature            | Description                                      |
| ------------------ | ------------------------------------------------ |
| **Service list**   | All 8 services with status icons (✅/❌/⚠️)      |
| **History**        | Last 50 health check results per service         |
| **Details**        | Expandable view showing individual check results |
| **Auto-refresh**   | Updates every 30 seconds                         |
| **Failure alerts** | Visual alerts when a service goes down           |

Access at: `http://localhost:6010/health-ui`

---

## 8. Docker Compose Updates

### New Environment Variables for Elasticsearch

Add to each microservice in `docker-compose.override.yml`:

```yaml
product.api:
  environment:
    # ... existing vars
    - "ElasticConfiguration:Uri=http://elasticsearch:9200"

customer.api:
  environment:
    # ... existing vars
    - "ElasticConfiguration:Uri=http://elasticsearch:9200"

basket.api:
  environment:
    # ... existing vars
    - "ElasticConfiguration:Uri=http://elasticsearch:9200"

ordering.api:
  environment:
    # ... existing vars
    - "ElasticConfiguration:Uri=http://elasticsearch:9200"

inventory.api:
  environment:
    # ... existing vars
    - "ElasticConfiguration:Uri=http://elasticsearch:9200"
```

### Elasticsearch Memory Configuration

```yaml
elasticsearch:
  container_name: elasticsearch
  environment:
    - xpack.monitoring.enabled=true
    - xpack.watcher.enabled=false
    - "ES_JAVA_OPTS=-Xms512m -Xmx512m" # Limit memory to 512MB
    - discovery.type=single-node
  ports:
    - "9200:9200"
  volumes:
    - elasticsearch_data:/usr/share/elasticsearch/data
  mem_limit: 1g # Hard limit 1GB
  healthcheck:
    test: ["CMD", "curl", "-f", "http://localhost:9200"]
    interval: 30s
    timeout: 10s
    retries: 5
```

---

## 9. Implementation Tasks & Timeline

### Phase 1C Task Breakdown

| #   | Task                                                      | Effort | Priority | Dependencies |
| --- | --------------------------------------------------------- | ------ | -------- | ------------ |
| 1   | Update `Common.Logging/SeriLogger.cs` with ES sink        | 1h     | HIGH     | None         |
| 2   | Add `Serilog.Sinks.Elasticsearch` NuGet to all services   | 30m    | HIGH     | None         |
| 3   | Add ES configuration to all `appsettings.json`            | 1h     | HIGH     | #1, #2       |
| 4   | Update docker-compose with ES env vars                    | 30m    | HIGH     | #3           |
| 5   | Verify Kibana index patterns & create dashboards          | 2h     | MEDIUM   | #4           |
| 6   | Create `CorrelationIdDelegatingHandler` in BuildingBlocks | 1h     | HIGH     | None         |
| 7   | Register correlation handler in all services              | 1h     | HIGH     | #6           |
| 8   | Create `HttpClientPolicies.cs` in BuildingBlocks          | 2h     | HIGH     | None         |
| 9   | Apply Polly to Basket→Inventory HTTP client               | 1h     | HIGH     | #8           |
| 10  | Apply Polly to all inter-service HTTP clients             | 2h     | HIGH     | #8           |
| 11  | Add HealthCheck NuGet packages to all services            | 30m    | HIGH     | None         |
| 12  | Configure health checks per service                       | 3h     | HIGH     | #11          |
| 13  | Map `/health` endpoints in all services                   | 1h     | HIGH     | #12          |
| 14  | Update WebHealthStatus with HealthChecksUI                | 2h     | MEDIUM   | #13          |
| 15  | Create WebHealthStatus Dockerfile                         | 30m    | MEDIUM   | #14          |
| 16  | Add WebHealthStatus to docker-compose                     | 30m    | MEDIUM   | #15          |
| 17  | Create Outbox table migration                             | 1h     | HIGH     | None         |
| 18  | Implement OutboxProcessor background service              | 2h     | HIGH     | #17          |
| 19  | Implement compensation events                             | 2h     | HIGH     | #18          |
| 20  | Integration testing (all health checks, ELK, Polly)       | 3h     | CRITICAL | All          |

**Total estimated effort: ~25 hours (3-4 days)**

### Verification Checklist

- [ ] All services push logs to Elasticsearch
- [ ] Kibana shows logs from all services
- [ ] Correlation IDs propagate across service calls
- [ ] Polly retry fires on transient failures
- [ ] Circuit breaker opens after configured failures
- [ ] Health checks return correct status for each DB/cache/MQ
- [ ] WebHealthStatus dashboard shows all services
- [ ] Outbox pattern processes queued messages
- [ ] Compensation events fire on saga failures
- [ ] Docker Compose spins up clean with all changes
