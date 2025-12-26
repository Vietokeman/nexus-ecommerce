# Ocelot API Gateway - Configuration Guide

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Configuration Best Practices](#configuration-best-practices)
3. [Rate Limiting Strategy](#rate-limiting-strategy)
4. [Caching Strategy](#caching-strategy)
5. [Quality of Service](#quality-of-service)
6. [Logging & Monitoring](#logging--monitoring)
7. [Deployment](#deployment)
8. [Security Considerations](#security-considerations)

## Architecture Overview

```
Client Applications
        ↓
    [Ocelot API Gateway :5000]
        ↓
    ┌───┴────┬────────┬─────────┐
    ↓        ↓        ↓         ↓
Product  Customer  Basket   Ordering
  :6002    :6003    :6004     :6005
    ↓        ↓        ↓         ↓
   MySQL  PostgreSQL Redis   SQL Server
```

## Configuration Best Practices

### 1. Environment-Specific Configurations

**Development (ocelot.Development.json)**
- Points to localhost services
- Higher rate limits for testing
- Detailed logging
- Shorter cache TTL

**Production (ocelot.json)**
- Points to Docker service names
- Stricter rate limits
- Optimized logging
- Longer cache TTL for performance

### 2. Route Naming Convention

Follow consistent naming patterns:
```
Upstream: /api/{service}/{resource}/{id?}
Downstream: /api/{resource}/{id?}
```

Example:
```
Upstream:   /api/products/123
Downstream: /api/products/123
```

### 3. HTTP Methods per Route

Separate routes for different operations:
- GET operations: Read data (cacheable)
- POST/PUT: Write data (no cache)
- DELETE: Remove data (invalidate cache)

## Rate Limiting Strategy

### Configuration Philosophy

Different endpoints have different rate limits based on:
1. **Resource intensity**: Complex queries = lower limits
2. **Operation type**: Reads > Writes
3. **Business criticality**: Critical endpoints = higher limits

### Rate Limit Tiers

| Tier | Requests/Second | Use Case |
|------|----------------|----------|
| High | 20 req/s | Simple GET operations, frequently accessed |
| Medium | 10 req/s | Standard CRUD operations |
| Low | 5 req/s | Complex queries, write operations |
| Very Low | 3 req/s | Resource-intensive operations |

### Example Configuration

```json
{
  "RateLimitOptions": {
    "ClientWhitelist": [],
    "EnableRateLimiting": true,
    "Period": "1s",
    "PeriodTimespan": 1,
    "Limit": 10
  }
}
```

**Parameters Explained:**
- `Period`: Time window (1s, 1m, 1h, 1d)
- `PeriodTimespan`: Number of periods
- `Limit`: Max requests per period
- `ClientWhitelist`: IPs exempt from rate limiting

### Global Rate Limiting

```json
{
  "GlobalConfiguration": {
    "RateLimitOptions": {
      "DisableRateLimitHeaders": false,
      "QuotaExceededMessage": "Rate limit exceeded. Try again later.",
      "HttpStatusCode": 429,
      "ClientIdHeader": "ClientId"
    }
  }
}
```

## Caching Strategy

### When to Cache

✅ **Cache These:**
- Product catalogs (30-60s TTL)
- User profiles (30s TTL)
- Reference data (5m TTL)
- Search results (15s TTL)

❌ **Don't Cache These:**
- Shopping carts (real-time data)
- Order creation/updates
- Authentication tokens
- Real-time inventory

### Cache Configuration

```json
{
  "FileCacheOptions": {
    "TtlSeconds": 30,
    "Region": "products"
  }
}
```

**Parameters:**
- `TtlSeconds`: Time-to-live in seconds
- `Region`: Cache partition for organization

### Cache Regions

| Region | TTL | Purpose |
|--------|-----|---------|
| products | 30s | Product list |
| product-detail | 30s | Single product |
| customers | 15s | Customer list |
| customer-detail | 30s | Single customer |
| orders | 15s | Order list |
| orders-by-user | 30s | User's orders |

### Cache Invalidation

For cache invalidation on updates:
1. Use shorter TTL values
2. Implement event-driven invalidation (future enhancement)
3. Clear cache regions manually when needed

## Quality of Service

### Circuit Breaker Pattern

Prevents cascading failures when downstream services fail.

```json
{
  "QoSOptions": {
    "ExceptionsAllowedBeforeBreaking": 3,
    "DurationOfBreak": 1000,
    "TimeoutValue": 5000
  }
}
```

**How It Works:**
1. Monitor requests to downstream service
2. After 3 consecutive failures, "open" the circuit
3. For 1 second, reject all requests immediately
4. After break duration, try one request ("half-open")
5. If successful, "close" circuit; if fails, repeat

### Timeout Strategy

| Service | Timeout | Reason |
|---------|---------|--------|
| Product | 5s | Simple CRUD operations |
| Customer | 5s | Database queries |
| Basket | 3s | Redis is fast |
| Ordering | 10s | Complex business logic, integrations |

### Best Practices

1. **Set appropriate timeouts**: Balance user experience vs. service needs
2. **Monitor circuit state**: Log when circuits open/close
3. **Implement fallbacks**: Return cached data when available
4. **Alert on failures**: Track failure rates

## Logging & Monitoring

### Serilog Configuration

```csharp
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .Enrich.WithMachineName()
    .Enrich.WithProperty("Application", "OcelotApiGateway")
    .WriteTo.Console()
    .WriteTo.Elasticsearch(options)
    .CreateLogger();
```

### Log Levels

- **Verbose**: Detailed diagnostic information
- **Debug**: Internal system events
- **Information**: General flow of the application
- **Warning**: Abnormal events that don't stop the app
- **Error**: Errors and exceptions
- **Fatal**: Critical errors causing shutdown

### What to Log

✅ **Log These:**
- All incoming requests (URL, method, IP)
- Response times and status codes
- Rate limit violations
- Circuit breaker state changes
- Cache hits/misses
- Errors and exceptions
- Authentication attempts

❌ **Don't Log These:**
- Passwords or secrets
- Personal identification information (without hashing)
- Full request/response bodies (can be huge)
- Credit card numbers

### Elasticsearch Index Pattern

```
ocelot-gateway-logs-{0:yyyy.MM.dd}
```

Daily indices for:
- Easy data management
- Better query performance
- Simplified retention policies

### Kibana Dashboards

Create dashboards for:
1. **Request Volume**: Requests per second
2. **Response Times**: P50, P95, P99 percentiles
3. **Error Rates**: 4xx and 5xx responses
4. **Rate Limit Hits**: Track violations
5. **Circuit Breaker Events**: Track service health
6. **Cache Performance**: Hit rates per region

## Deployment

### Local Development

```bash
# Restore packages
cd src/APIGateWays/OcelotApiGw
dotnet restore

# Run the gateway
dotnet run --urls="http://localhost:5000"
```

### Docker Build

```bash
# Build image
docker build -f APIGateWays/OcelotApiGw/Dockerfile -t ocelot-apigw:latest .

# Run container
docker run -d -p 5000:80 --name ocelot-gateway ocelot-apigw:latest
```

### Docker Compose

```bash
# Start all services including gateway
cd src
docker-compose up -d

# View logs
docker-compose logs -f ocelot.apigw

# Stop services
docker-compose down
```

### Health Checks

Add health check endpoints:

```csharp
app.MapHealthChecks("/health", new HealthCheckOptions
{
    ResponseWriter = UIResponseWriter.WriteHealthCheckUIResponse
});
```

Check downstream services:
```bash
curl http://localhost:5000/health
```

## Security Considerations

### Current Implementation

✅ **Implemented:**
- CORS policy
- Rate limiting
- Request logging
- Circuit breaker

### Recommended Enhancements

#### 1. Authentication & Authorization

Add JWT Bearer authentication:

```csharp
// In Program.cs
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options => {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = configuration["Jwt:Issuer"],
            ValidAudience = configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(configuration["Jwt:Key"]))
        };
    });
```

Update ocelot.json:
```json
{
  "AuthenticationOptions": {
    "AuthenticationProviderKey": "Bearer",
    "AllowedScopes": []
  }
}
```

#### 2. HTTPS/TLS

Configure HTTPS:

```csharp
// In Program.cs
app.UseHttpsRedirection();

// Update DownstreamScheme
"DownstreamScheme": "https"
```

#### 3. API Key Authentication

For service-to-service communication:

```json
{
  "UpstreamHeaderTransform": {
    "X-API-Key": "your-api-key"
  }
}
```

#### 4. Request Size Limits

Prevent DoS attacks:

```csharp
builder.Services.Configure<FormOptions>(options =>
{
    options.MultipartBodyLengthLimit = 10_000_000; // 10 MB
});
```

#### 5. IP Whitelisting

Restrict access by IP:

```json
{
  "RouteClaimsRequirement": {
    "UserRole": "Admin"
  }
}
```

#### 6. Header Security

Add security headers:

```csharp
app.Use(async (context, next) =>
{
    context.Response.Headers.Add("X-Content-Type-Options", "nosniff");
    context.Response.Headers.Add("X-Frame-Options", "DENY");
    context.Response.Headers.Add("X-XSS-Protection", "1; mode=block");
    await next();
});
```

### CORS Configuration

**Development:**
```csharp
policy.AllowAnyOrigin()
      .AllowAnyMethod()
      .AllowAnyHeader();
```

**Production:**
```csharp
policy.WithOrigins("https://yourdomain.com")
      .AllowCredentials()
      .WithMethods("GET", "POST", "PUT", "DELETE")
      .WithHeaders("Content-Type", "Authorization");
```

## Performance Tuning

### 1. Connection Pooling

Ocelot uses HttpClient internally. Configure pooling:

```csharp
builder.Services.AddHttpClient();
```

### 2. Compression

Enable response compression:

```csharp
builder.Services.AddResponseCompression(options =>
{
    options.EnableForHttps = true;
});
```

### 3. Memory Cache

For high-traffic scenarios, use Redis:

```csharp
builder.Services.AddStackExchangeRedisCache(options =>
{
    options.Configuration = "localhost:6379";
});
```

Update ocelot.json:
```json
{
  "FileCacheOptions": {
    "TtlSeconds": 30,
    "Region": "products",
    "EnableContentHashing": true
  }
}
```

### 4. Load Balancing

For multiple instances:

```json
{
  "DownstreamHostAndPorts": [
    {"Host": "product.api.1", "Port": 80},
    {"Host": "product.api.2", "Port": 80}
  ],
  "LoadBalancerOptions": {
    "Type": "RoundRobin"
  }
}
```

Types: RoundRobin, LeastConnection, NoLoadBalancer

## Troubleshooting

### Common Issues

**1. Routes not working**
- Check UpstreamPathTemplate matches request
- Verify DownstreamHostAndPorts is correct
- Ensure service is running

**2. Rate limit too strict**
- Increase Limit value
- Change Period to longer duration
- Add IP to ClientWhitelist

**3. Cache not updating**
- Reduce TtlSeconds
- Clear cache manually
- Check cache region

**4. Circuit breaker always open**
- Increase ExceptionsAllowedBeforeBreaking
- Fix downstream service issues
- Check timeout values

**5. Logs not appearing in Elasticsearch**
- Verify Elasticsearch is running
- Check ElasticConfiguration:Uri
- Review Serilog configuration

### Debugging Commands

```bash
# Check gateway logs
docker logs ocelot.apigw

# Test route
curl -v http://localhost:5000/api/products

# Check rate limit headers
curl -I http://localhost:5000/api/products

# View Elasticsearch indices
curl http://localhost:9200/_cat/indices?v
```

## Conclusion

This Ocelot API Gateway configuration implements enterprise-grade best practices:

- ✅ Centralized entry point for all services
- ✅ Rate limiting to prevent abuse
- ✅ Caching for improved performance
- ✅ Circuit breaker for resilience
- ✅ Comprehensive logging for observability
- ✅ Environment-specific configurations
- ✅ Docker support for easy deployment

Continue enhancing with authentication, service discovery, and advanced monitoring as the system grows.
