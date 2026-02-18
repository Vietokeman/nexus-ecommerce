---
name: microservices-architecture
description: ASP.NET Core Microservices Architecture with Docker, RabbitMQ, Ocelot API Gateway. Use this skill when working with distributed systems, service communication, event-driven architecture, or Docker orchestration.
license: MIT
metadata:
  author: Nexus Commerce Team
  version: "1.0.0"
---

# Microservices Architecture Skills

Comprehensive guide for building distributed microservices using ASP.NET Core 8.0, Docker, API Gateway (Ocelot), RabbitMQ, PostgreSQL, Redis, and Elasticsearch. Contains rules across 7 categories, prioritized by architectural importance.

## When to Apply

Reference these guidelines when:
- Designing new microservices or splitting monoliths
- Implementing service-to-service communication
- Configuring API Gateway routes and policies
- Publishing or consuming domain events
- Setting up Docker containers and orchestration
- Implementing resilience patterns (circuit breaker, retry, timeout)
- Configuring observability (logging, health checks, monitoring)
- Securing inter-service communication

## Technology Stack

| Technology | Purpose | Version |
|------------|---------|---------|
| ASP.NET Core | Web Framework | 8.0 |
| Docker | Containerization | Latest |
| Ocelot | API Gateway | 23.0.0 |
| RabbitMQ | Message Broker | 3-management-alpine |
| PostgreSQL (PostGIS) | Database | 16-3.4 |
| Redis | Caching | alpine |
| Elasticsearch | Logging & Search | 7.17.2 |
| Kibana | Log Visualization | 7.17.2 |

## Project Structure

```
distributed-ecommerce-platform/
├── src/
│   ├── APIGateWays/
│   │   └── OcelotApiGw/           # API Gateway (Ocelot)
│   │
│   ├── Services/                   # Microservices
│   │   ├── Product.API/           # Product catalog
│   │   ├── Customer.API/          # Customer management
│   │   ├── Basket.API/            # Shopping cart
│   │   ├── Ordering.API/          # Order processing
│   │   ├── Payment.API/           # Payment processing
│   │   ├── Inventory.API/         # Stock management
│   │   ├── Identity.API/          # Authentication
│   │   ├── FlashSale.API/         # Flash sale campaigns
│   │   ├── GroupBuy.API/          # Group buying
│   │   └── Hangfire.API/          # Background jobs
│   │
│   ├── BuildingBlocks/            # Shared libraries
│   │   ├── Common.Logging/        # Serilog configuration
│   │   ├── Contracts/             # Shared contracts
│   │   ├── Infrastructure/        # Common infrastructure
│   │   └── Shared/                # Shared DTOs, models
│   │
│   ├── WebApps/
│   │   ├── React.Client/          # Customer-facing SPA
│   │   └── WebHealthStatus/       # Health check dashboard
│   │
│   ├── docker-compose.yml         # Base service definitions
│   └── docker-compose.override.yml # Development overrides
│
└── docs/
    ├── MASTER_PLAN.md
    └── DEPLOYMENT_GUIDE_VI.md
```

## Rule Categories by Priority

| Priority | Category | Impact | Prefix |
|----------|----------|--------|--------|
| 1 | Service Design | CRITICAL | `service-` |
| 2 | API Gateway | CRITICAL | `gateway-` |
| 3 | Event Communication | HIGH | `event-` |
| 4 | Data Management | HIGH | `data-` |
| 5 | Resilience | MEDIUM-HIGH | `resilience-` |
| 6 | Observability | MEDIUM | `observability-` |
| 7 | Security | MEDIUM | `security-` |

## Quick Reference

### 1. Service Design (CRITICAL)

- `service-boundary` - Organize services by business domain, not technical layers
- `service-autonomy` - Each service must be independently deployable
- `service-database` - One database per service (database-per-service pattern)
- `service-communication` - HTTP for queries, events for commands
- `service-api-client` - Never access another service's database directly

### 2. API Gateway (CRITICAL)

- `gateway-single-entry` - All external traffic goes through Ocelot Gateway
- `gateway-routing` - Configure routes in ocelot.json with UpstreamPathTemplate
- `gateway-qos` - Use QoSOptions for circuit breaker (requires Ocelot.Provider.Polly)
- `gateway-rate-limit` - Enable RateLimitOptions to protect downstream services
- `gateway-caching` - Use FileCacheOptions for cacheable GET requests
- `gateway-aggregation` - Aggregate multiple service calls into single response

### 3. Event Communication (HIGH)

- `event-naming` - Events are past tense: OrderCreatedEvent, InventoryUpdatedEvent
- `event-idempotency` - Event handlers must be idempotent (handle duplicates)
- `event-publish` - Publish events after successful DB transaction
- `event-routing-key` - Use hierarchical routing keys: orders.created, inventory.updated
- `event-versioning` - Include event version for backward compatibility

### 4. Data Management (HIGH)

- `data-isolation` - No shared databases between services
- `data-consistency` - Accept eventual consistency for cross-service data
- `data-replication` - Replicate read-only data for query performance
- `data-migration` - Use EF Core migrations per service database
- `data-connection-string` - Environment-specific connection strings

### 5. Resilience (MEDIUM-HIGH)

- `resilience-circuit-breaker` - Use Polly circuit breaker for external calls
- `resilience-retry` - Retry with exponential backoff for transient failures
- `resilience-timeout` - Always set timeouts for HTTP calls (default: 10s)
- `resilience-bulkhead` - Isolate resources to prevent cascading failures
- `resilience-fallback` - Provide fallback behavior when service unavailable

### 6. Observability (MEDIUM)

- `observability-logging` - Use Serilog with Elasticsearch sink
- `observability-structured-logs` - Log structured data with context properties
- `observability-health-checks` - Implement /health endpoint for all services
- `observability-correlation-id` - Pass correlation ID across service calls
- `observability-metrics` - Track performance metrics (response time, error rate)

### 7. Security (MEDIUM)

- `security-jwt` - Use JWT tokens issued by Identity.API
- `security-https` - Use HTTPS in production
- `security-secrets` - Never hardcode secrets (use environment variables)
- `security-cors` - Configure CORS policies in API Gateway
- `security-api-key` - Use API keys for service-to-service communication

## Docker Optimization Rules

### Container Naming

```yaml
# ✅ Use consistent naming with src- prefix
container_name: src-product-api
container_name: src-ocelot-apigw
container_name: src-nexusdb
```

### Image Naming

```yaml
# ✅ Organize images under src/ folder
image: ${DOCKER_REGISTRY-}src/product-api:${TAG:-latest}
image: ${DOCKER_REGISTRY-}src/customer-api:${TAG:-latest}
```

### Multi-Stage Dockerfile

```dockerfile
# ✅ Use multi-stage builds to reduce image size
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
# ... build steps ...

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
# ... runtime only ...
```

### Development vs Production

```yaml
# Development: docker-compose.override.yml
# - Uses SDK images
# - Mounts source code volumes
# - Runs dotnet watch for hot-reload

# Production: docker-compose.yml
# - Uses multi-stage Dockerfile
# - Publishes optimized build
# - Smaller runtime images
```

## Common Patterns

### 1. Create New Microservice

```bash
# 1. Create service project
dotnet new webapi -n [ServiceName].API -o Services/[ServiceName].API

# 2. Add to solution
dotnet sln add Services/[ServiceName].API/[ServiceName].API.csproj

# 3. Add Dockerfile
# 4. Add docker-compose service definition
# 5. Add Ocelot routes in ocelot.json
# 6. Configure health checks
```

### 2. Add Event-Driven Communication

```csharp
// Publisher (Payment.API)
await _eventBus.PublishAsync(new PaymentCompletedEvent
{
    OrderId = orderId,
    Amount = amount,
    PaymentMethod = method
}, "payments.completed");

// Subscriber (Ordering.API)
public class PaymentCompletedEventHandler : IEventHandler<PaymentCompletedEvent>
{
    public async Task HandleAsync(PaymentCompletedEvent @event)
    {
        // Update order status
        // Send confirmation email
    }
}
```

### 3. Configure API Gateway Route

```json
{
  "Routes": [
    {
      "DownstreamPathTemplate": "/api/v1/{everything}",
      "DownstreamScheme": "http",
      "DownstreamHostAndPorts": [
        { "Host": "product.api", "Port": 80 }
      ],
      "UpstreamPathTemplate": "/products/{everything}",
      "UpstreamHttpMethod": [ "GET", "POST", "PUT", "DELETE" ]
    }
  ]
}
```

## Anti-Patterns to Avoid

| ❌ Anti-Pattern | ✅ Correct Pattern |
|----------------|-------------------|
| Shared database between services | Database per service |
| Synchronous calls for long operations | Async messaging with events |
| No retry logic for HTTP calls | Polly retry with exponential backoff |
| Hardcoded service URLs | Service discovery or configuration |
| No health checks | /health endpoints for all services |
| Large Docker images (1GB+) | Multi-stage builds (<200MB) |
| Running all services locally | Selective services + infrastructure |

## Performance Optimization

1. **API Gateway Caching**: Cache GET requests at gateway level (30-60s TTL)
2. **Database Connection Pooling**: Reuse database connections
3. **Redis Caching**: Cache frequently accessed data (products, categories)
4. **Async Processing**: Use background jobs (Hangfire) for heavy operations
5. **Event Batching**: Batch events to reduce message broker overhead

## Deployment Checklist

- [ ] All services have health checks configured
- [ ] Connection strings use environment variables
- [ ] Ocelot routes are configured for all services
- [ ] JWT authentication is enabled
- [ ] Rate limiting is configured in API Gateway
- [ ] Circuit breakers are configured for external calls
- [ ] Structured logging with Elasticsearch is enabled
- [ ] Docker images use multi-stage builds
- [ ] Secrets are managed via environment variables or secrets manager
- [ ] CORS policies are configured

## Resources

- [Ocelot Documentation](https://ocelot.readthedocs.io/)
- [.NET Microservices Architecture Guide](https://learn.microsoft.com/en-us/dotnet/architecture/microservices/)
- [RabbitMQ Tutorials](https://www.rabbitmq.com/tutorials)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Polly Documentation](https://github.com/App-vNext/Polly)

---

**Last Updated:** February 2026  
**Maintainer:** Nexus Commerce Team
