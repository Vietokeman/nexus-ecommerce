# 📘 SECTION 8 — API Gateway Microservices: Detailed Implementation Guide

**Services:** OcelotApiGw  
**Technologies:** Ocelot, JWT Authentication, Rate Limiting, QoS, Response Caching, Load Balancing  
**Port:** 5000  
**Date:** February 15, 2026

---

## 📋 Table of Contents

1. [Current State Analysis](#1-current-state-analysis)
2. [Gateway Routing Pattern Deep Dive](#2-gateway-routing-pattern-deep-dive)
3. [JWT Authentication Configuration](#3-jwt-authentication-configuration)
4. [Rate Limiting Configuration](#4-rate-limiting-configuration)
5. [Quality of Service (QoS)](#5-quality-of-service-qos)
6. [Response Caching](#6-response-caching)
7. [Load Balancing](#7-load-balancing)
8. [Adding New Routes (Payment, Identity, Inventory)](#8-adding-new-routes)
9. [Request Logging & Correlation](#9-request-logging--correlation)
10. [Containerization](#10-containerization)
11. [Testing Checklist](#11-testing-checklist)
12. [Implementation Tasks](#12-implementation-tasks)

---

## 1. Current State Analysis

### ✅ Already Implemented
The Ocelot API Gateway is **fully functional** with the following features:

| Feature | Status | Configuration |
|---------|--------|--------------|
| Routing | ✅ 11 routes | 5 services mapped |
| Rate Limiting | ✅ Per-route | 3-10 req/s per endpoint |
| Response Caching | ✅ CacheManager | 15-60s TTL by region |
| Circuit Breaker (QoS) | ✅ | 3 failures → 1s break |
| Load Balancing | ✅ | Round-robin (global config) |
| CORS | ✅ | AllowAny (development) |
| Serilog → Elasticsearch | ✅ | `ocelot-gateway-logs-*` index |
| Environment Configs | ✅ | Docker + Development JSON files |

### 🔲 To Implement
| Feature | Priority | Section |
|---------|----------|---------|
| JWT Authentication | CRITICAL | Required for Section 12 integration |
| New Routes (Payment, Identity) | HIGH | Needed for new services |
| Request Correlation IDs | HIGH | Cross-service tracing |
| Aggregation (optional) | LOW | Multi-route request aggregation |

---

## 2. Gateway Routing Pattern Deep Dive

### Current Route Map (11 routes across 5 services)

```
Ocelot Gateway (:5000)
├── Product.API (product.api:80 → :6002)
│   ├── GET/POST    /api/products
│   ├── GET/PUT/DEL /api/products/{id}
│   └── GET         /api/products/get-product-by-no/{productNo}
│
├── Customer.API (customer.api:80 → :6003)
│   ├── GET/POST    /api/customers
│   ├── GET         /api/customer/{username}
│   └── POST/DELETE /api/customer
│
├── Basket.API (basket.api:80 → :6004)
│   ├── GET/DELETE  /api/baskets/{username}
│   └── POST        /api/baskets
│
└── Ordering.API (ordering.api:80 → :6005)
    ├── GET/POST    /api/v1/orders
    ├── GET/PUT/DEL /api/v1/orders/{id}
    └── GET         /api/v1/orders/{username}
```

### How Ocelot Routing Works

```
Client Request → Ocelot Gateway → Rate Limit Check → Authentication Check
                                → Cache Check (if GET) → Downstream Service
                                                       → Response Cache → Client
```

Each route in `ocelot.json` defines:
```json
{
  "DownstreamPathTemplate": "/api/products",          // internal service path
  "DownstreamScheme": "http",                          // http (Docker internal)
  "DownstreamHostAndPorts": [{ "Host": "product.api", "Port": 80 }],  // Docker service name
  "UpstreamPathTemplate": "/api/products",            // external path clients use
  "UpstreamHttpMethod": ["GET", "POST"],              // allowed HTTP methods
  "Key": "products",                                   // unique key for aggregation
  "RateLimitOptions": { ... },                        // per-route rate limiting
  "FileCacheOptions": { ... },                        // per-route caching
  "QoSOptions": { ... }                               // per-route circuit breaker
}
```

---

## 3. JWT Authentication Configuration

### 3.1 Install Required NuGet Package

```xml
<!-- OcelotApiGw.csproj -->
<PackageReference Include="Microsoft.AspNetCore.Authentication.JwtBearer" Version="8.0.*" />
```

### 3.2 Update Program.cs

```csharp
using Ocelot.DependencyInjection;
using Ocelot.Middleware;
using Ocelot.Cache.CacheManager;
using Serilog;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Configure Serilog (existing)
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .Enrich.WithMachineName()
    .Enrich.WithProperty("Application", "OcelotApiGateway")
    .WriteTo.Debug()
    .WriteTo.Console()
    .WriteTo.Elasticsearch(new Serilog.Sinks.Elasticsearch.ElasticsearchSinkOptions(
        new Uri(builder.Configuration["ElasticConfiguration:Uri"] ?? "http://localhost:9200"))
    {
        AutoRegisterTemplate = true,
        IndexFormat = "ocelot-gateway-logs-{0:yyyy.MM.dd}",
        NumberOfReplicas = 1,
        NumberOfShards = 2
    })
    .CreateLogger();

builder.Host.UseSerilog();

// Add Ocelot configuration
builder.Configuration.AddJsonFile("ocelot.json", optional: false, reloadOnChange: true);

// ============================================
// JWT Authentication Configuration (NEW)
// ============================================
var jwtSettings = builder.Configuration.GetSection("JwtTokenSettings");
var secretKey = jwtSettings["Key"] ?? "your-secret-key-here";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer("Bearer", options =>
{
    options.Authority = builder.Configuration["IdentityServer:Authority"];
    options.RequireHttpsMetadata = false;  // Development only
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),
        ValidateIssuer = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidateAudience = false,
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };
});

// Add services to the container
builder.Services.AddOcelot(builder.Configuration)
    .AddCacheManager(x => x.WithDictionaryHandle());

// Add CORS policy
builder.Services.AddCors(options =>
{
    options.AddPolicy("CorsPolicy", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline
app.UseCors("CorsPolicy");
app.UseAuthentication();   // NEW — must come before Ocelot
app.UseAuthorization();    // NEW
app.UseSerilogRequestLogging();

await app.UseOcelot();

app.Run();
```

### 3.3 Add Authentication to Route Configuration

Add `AuthenticationOptions` to protected routes in `ocelot.json`:

```json
{
  "DownstreamPathTemplate": "/api/products",
  "DownstreamScheme": "http",
  "DownstreamHostAndPorts": [{ "Host": "product.api", "Port": 80 }],
  "UpstreamPathTemplate": "/api/products",
  "UpstreamHttpMethod": ["POST"],
  "AuthenticationOptions": {
    "AuthenticationProviderKey": "Bearer",
    "AllowedScopes": []
  },
  "RateLimitOptions": { ... }
}
```

**Authentication Strategy:**
| Endpoint | Auth Required | Reason |
|----------|:------------:|--------|
| `GET /api/products` | ❌ | Public product listing |
| `POST /api/products` | ✅ | Admin-only product creation |
| `PUT/DELETE /api/products/{id}` | ✅ | Admin-only modification |
| `GET /api/customers` | ✅ | Authenticated users only |
| `GET /api/baskets/{username}` | ✅ | Owner's basket only |
| `POST /api/baskets/checkout` | ✅ | Must be logged in |
| `GET /api/v1/orders` | ✅ | Authenticated |
| `POST /api/payment/create` | ✅ | Must be logged in |
| Identity routes (login, register) | ❌ | Public access |

### 3.4 Update appsettings.json

```json
{
  "JwtTokenSettings": {
    "Key": "bXlfc2VjdXJlX2p3dF9rZXlfMTI4IQ==",
    "Issuer": "distributed-ecommerce-platform",
    "ExpireInHours": 24
  },
  "IdentityServer": {
    "Authority": "http://identity.api:80"
  }
}
```

---

## 4. Rate Limiting Configuration

### Current Rate Limits

| Route | Limit | Period | HTTP 429 Message |
|-------|-------|--------|-----------------|
| Products (list) | 10/s | 1s | "Rate limit exceeded..." |
| Customers (list) | 5/s | 1s | "Rate limit exceeded..." |
| Customer (CUD) | 3/s | 1s | "Rate limit exceeded..." |
| Baskets | 5-10/s | 1s | "Rate limit exceeded..." |
| Orders | 5/s | 1s | "Rate limit exceeded..." |

### Recommended New Route Limits

| Route | Limit | Period | Rationale |
|-------|-------|--------|-----------|
| Payment Create | 3/s | 1s | Prevent payment abuse |
| Payment Callback | 20/s | 1s | PayOS webhooks |
| Identity Login | 5/s | 5s | Brute-force protection |
| Identity Register | 2/s | 10s | Registration spam |
| Inventory Stock | 20/s | 1s | Allow batch stock checks |

### Global Rate Limit Configuration
```json
"GlobalConfiguration": {
  "RateLimitOptions": {
    "DisableRateLimitHeaders": false,
    "QuotaExceededMessage": "Rate limit exceeded. Please try again later.",
    "HttpStatusCode": 429,
    "ClientIdHeader": "ClientId"
  }
}
```

---

## 5. Quality of Service (QoS)

### Circuit Breaker Pattern (via Polly in Ocelot)

```
Normal → [3 failures] → OPEN (reject all for 1s) → HALF-OPEN (allow 1 test) → Normal
```

### Current QoS Settings
```json
"QoSOptions": {
  "ExceptionsAllowedBeforeBreaking": 3,  // failures before opening circuit
  "DurationOfBreak": 1000,               // ms to stay open (1s)
  "TimeoutValue": 5000                   // ms timeout per request (5s)
}
```

### Recommended Adjustments for New Services

| Service | Timeout | Failures Before Break | Break Duration |
|---------|---------|----------------------|----------------|
| Payment.API | 30s | 2 | 5s |
| Identity.API | 10s | 3 | 2s |
| Inventory (gRPC passthrough) | 5s | 3 | 1s |

Payment needs longer timeout because PayOS API calls are external and may be slower.

---

## 6. Response Caching

### Current Cache Configuration

| Region | TTL | Route |
|--------|-----|-------|
| `products` | 30s | Product list |
| `product-detail` | 30s | Product by ID |
| `product-by-no` | 60s | Product by number |
| `customers` | 15s | Customer list |
| `customer-detail` | 30s | Customer by username |
| `orders` | 15s | Order list |
| `orders-by-user` | 30s | Orders by user |

### Routes That Should NOT Be Cached

| Route | Reason |
|-------|--------|
| `POST/PUT/DELETE` (all) | Mutation operations |
| Basket operations | Real-time cart state |
| Payment status | Must be live |
| Identity tokens | Security risk |

### Cache Invalidation Strategy
- CacheManager uses in-memory dictionary handle
- Cache auto-expires via TTL
- For production: Consider Redis distributed cache (`Ocelot.Provider.Redis`)

---

## 7. Load Balancing

### Current Configuration
```json
"GlobalConfiguration": {
  "LoadBalancerOptions": {
    "Type": "RoundRobin"
  }
}
```

### Supported Strategies
| Strategy | Use Case |
|----------|----------|
| `RoundRobin` | Equal distribution (current) |
| `LeastConnection` | Route to least busy server |
| `NoLoadBalancer` | Single instance (default) |
| `CookieStickySessions` | Session affinity |

### Multi-Instance Configuration (for scaling)
```json
{
  "DownstreamPathTemplate": "/api/products",
  "DownstreamScheme": "http",
  "DownstreamHostAndPorts": [
    { "Host": "product.api.1", "Port": 80 },
    { "Host": "product.api.2", "Port": 80 }
  ],
  "LoadBalancerOptions": {
    "Type": "LeastConnection"
  }
}
```

---

## 8. Adding New Routes

### 8.1 Payment.API Routes (Section 13)

```json
{
  "DownstreamPathTemplate": "/api/payment/create",
  "DownstreamScheme": "http",
  "DownstreamHostAndPorts": [{ "Host": "payment.api", "Port": 80 }],
  "UpstreamPathTemplate": "/api/payment/create",
  "UpstreamHttpMethod": ["POST"],
  "AuthenticationOptions": {
    "AuthenticationProviderKey": "Bearer",
    "AllowedScopes": []
  },
  "RateLimitOptions": {
    "EnableRateLimiting": true,
    "Period": "1s",
    "PeriodTimespan": 1,
    "Limit": 3
  },
  "QoSOptions": {
    "ExceptionsAllowedBeforeBreaking": 2,
    "DurationOfBreak": 5000,
    "TimeoutValue": 30000
  }
},
{
  "DownstreamPathTemplate": "/api/payment/{orderId}/status",
  "DownstreamScheme": "http",
  "DownstreamHostAndPorts": [{ "Host": "payment.api", "Port": 80 }],
  "UpstreamPathTemplate": "/api/payment/{orderId}/status",
  "UpstreamHttpMethod": ["GET"],
  "AuthenticationOptions": {
    "AuthenticationProviderKey": "Bearer"
  }
},
{
  "DownstreamPathTemplate": "/api/payment/payos-callback",
  "DownstreamScheme": "http",
  "DownstreamHostAndPorts": [{ "Host": "payment.api", "Port": 80 }],
  "UpstreamPathTemplate": "/api/payment/payos-callback",
  "UpstreamHttpMethod": ["POST"],
  "RateLimitOptions": {
    "EnableRateLimiting": true,
    "Period": "1s",
    "Limit": 20
  }
}
```

### 8.2 Identity.API Routes (Section 11-12)

```json
{
  "DownstreamPathTemplate": "/api/auth/login",
  "DownstreamScheme": "http",
  "DownstreamHostAndPorts": [{ "Host": "identity.api", "Port": 80 }],
  "UpstreamPathTemplate": "/api/auth/login",
  "UpstreamHttpMethod": ["POST"],
  "RateLimitOptions": {
    "EnableRateLimiting": true,
    "Period": "5s",
    "Limit": 5
  }
},
{
  "DownstreamPathTemplate": "/api/auth/register",
  "DownstreamScheme": "http",
  "DownstreamHostAndPorts": [{ "Host": "identity.api", "Port": 80 }],
  "UpstreamPathTemplate": "/api/auth/register",
  "UpstreamHttpMethod": ["POST"],
  "RateLimitOptions": {
    "EnableRateLimiting": true,
    "Period": "10s",
    "Limit": 2
  }
},
{
  "DownstreamPathTemplate": "/api/auth/{everything}",
  "DownstreamScheme": "http",
  "DownstreamHostAndPorts": [{ "Host": "identity.api", "Port": 80 }],
  "UpstreamPathTemplate": "/api/auth/{everything}",
  "UpstreamHttpMethod": ["GET", "POST", "PUT"]
},
{
  "DownstreamPathTemplate": "/api/permissions/{everything}",
  "DownstreamScheme": "http",
  "DownstreamHostAndPorts": [{ "Host": "identity.api", "Port": 80 }],
  "UpstreamPathTemplate": "/api/permissions/{everything}",
  "UpstreamHttpMethod": ["GET", "POST", "PUT", "DELETE"],
  "AuthenticationOptions": {
    "AuthenticationProviderKey": "Bearer"
  }
}
```

### 8.3 Inventory Routes (missing from current config)

```json
{
  "DownstreamPathTemplate": "/api/inventory/{everything}",
  "DownstreamScheme": "http",
  "DownstreamHostAndPorts": [{ "Host": "inventory.api", "Port": 80 }],
  "UpstreamPathTemplate": "/api/inventory/{everything}",
  "UpstreamHttpMethod": ["GET", "POST", "PUT", "DELETE"],
  "RateLimitOptions": {
    "EnableRateLimiting": true,
    "Period": "1s",
    "Limit": 20
  },
  "FileCacheOptions": {
    "TtlSeconds": 10,
    "Region": "inventory"
  }
}
```

---

## 9. Request Logging & Correlation

### 9.1 Correlation ID Middleware

Create a delegating handler to propagate correlation IDs:

```csharp
// Middleware/CorrelationIdMiddleware.cs
public class CorrelationIdMiddleware
{
    private readonly RequestDelegate _next;
    private const string CorrelationIdHeader = "X-Correlation-ID";

    public CorrelationIdMiddleware(RequestDelegate next) => _next = next;

    public async Task InvokeAsync(HttpContext context)
    {
        if (!context.Request.Headers.ContainsKey(CorrelationIdHeader))
        {
            context.Request.Headers.Add(CorrelationIdHeader, Guid.NewGuid().ToString());
        }

        var correlationId = context.Request.Headers[CorrelationIdHeader].ToString();
        context.Response.Headers.Add(CorrelationIdHeader, correlationId);

        using (Serilog.Context.LogContext.PushProperty("CorrelationId", correlationId))
        {
            await _next(context);
        }
    }
}
```

### 9.2 Request/Response Logging

Serilog request logging is already configured via `app.UseSerilogRequestLogging()`. The logs flow to:
1. Console (development)
2. Debug output
3. **Elasticsearch** (`ocelot-gateway-logs-{date}` index)

### 9.3 Kibana Dashboard
- Access at `http://localhost:5601`
- Create index pattern: `ocelot-gateway-logs-*`
- Visualize: request counts by route, response times, error rates, correlation ID tracing

---

## 10. Containerization

### Current Dockerfile

```dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["APIGateWays/OcelotApiGw/OcelotApiGw.csproj", "APIGateWays/OcelotApiGw/"]
RUN dotnet restore "APIGateWays/OcelotApiGw/OcelotApiGw.csproj"
COPY . .
WORKDIR "/src/APIGateWays/OcelotApiGw"
RUN dotnet build "OcelotApiGw.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "OcelotApiGw.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "OcelotApiGw.dll"]
```

### Docker Compose Entry (existing)
```yaml
ocelot.apigw:
  container_name: ocelot.apigw
  environment:
    - ASPNETCORE_ENVIRONMENT=Development
    - AspNetCore_Urls=http://+:80
    - "ElasticConfiguration:Uri=http://elasticsearch:9200"
  depends_on:
    - product.api
    - customer.api
    - basket.api
    - ordering.api
    - inventory.api
    - elasticsearch
  ports:
    - "5000:80"
  restart: always
```

### Updated depends_on (after all sections)
```yaml
ocelot.apigw:
  depends_on:
    - product.api
    - customer.api
    - basket.api
    - ordering.api
    - inventory.api
    - payment.api       # NEW
    - identity.api      # NEW
    - elasticsearch
```

---

## 11. Testing Checklist

### Route Testing
| # | Test | Method | Expected |
|---|------|--------|----------|
| 1 | Gateway health | `GET :5000/health` | 200 OK |
| 2 | Product list via GW | `GET :5000/api/products` | Product JSON array |
| 3 | Product by ID via GW | `GET :5000/api/products/1` | Product JSON |
| 4 | Customer list via GW | `GET :5000/api/customers` | Customer JSON array |
| 5 | Basket get via GW | `GET :5000/api/baskets/testuser` | Basket JSON |
| 6 | Orders via GW | `GET :5000/api/v1/orders` | Orders JSON |
| 7 | Rate limit test | 11x `GET :5000/api/products` in 1s | 429 on 11th |
| 8 | Cache test | 2x `GET :5000/api/products` | 2nd hits cache |
| 9 | Auth required | `POST :5000/api/products` (no token) | 401 Unauthorized |
| 10 | Auth valid | `POST :5000/api/products` (with token) | 201 Created |
| 11 | Payment create | `POST :5000/api/payment/create` | Payment link |
| 12 | Identity login | `POST :5000/api/auth/login` | JWT token |

### Performance Testing
| Metric | Target |
|--------|--------|
| Response time (cached) | < 10ms |
| Response time (proxy) | < 200ms |
| Throughput | > 1000 req/s |
| Circuit breaker recovery | < 2s |

---

## 12. Implementation Tasks

### Priority Order

| # | Task | Effort | Depends On |
|---|------|--------|------------|
| 1 | Verify current routing works in Docker | 1h | None |
| 2 | Add Inventory routes to `ocelot.json` | 30m | None |
| 3 | Add Correlation ID middleware | 1h | None |
| 4 | Install JWT NuGet & update `Program.cs` | 1h | None |
| 5 | Configure JWT settings in `appsettings.json` | 30m | #4 |
| 6 | Add Payment.API routes (after S13 created) | 1h | Section 13 |
| 7 | Add Identity.API routes (after S11 created) | 1h | Section 11 |
| 8 | Add `AuthenticationOptions` to protected routes | 2h | #4, #7 |
| 9 | Update `docker-compose.yml` dependencies | 30m | #6, #7 |
| 10 | Full route testing | 2h | All above |
| 11 | Performance testing | 1h | #10 |
| 12 | Document all routes and auth requirements | 1h | All |

**Total estimated effort: ~12 hours**
