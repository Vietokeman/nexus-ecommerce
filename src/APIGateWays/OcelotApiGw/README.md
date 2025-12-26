# Ocelot API Gateway

## Overview
This is the API Gateway for the Distributed E-Commerce Platform, built using Ocelot. It serves as a single entry point for all client requests and routes them to the appropriate microservices.

## Features Implemented

### 1. **Routing & Load Balancing**
- Configured routes for all microservices:
  - Product API (port 6002)
  - Customer API (port 6003)
  - Basket API (port 6004)
  - Ordering API (port 6005)
- Round-robin load balancing strategy

### 2. **Rate Limiting**
- Prevents API abuse and ensures fair usage
- Different rate limits per endpoint:
  - GET operations: 10-20 requests/second
  - POST/PUT/DELETE operations: 3-10 requests/second
- Returns HTTP 429 when limit exceeded

### 3. **Caching**
- Response caching using CacheManager
- Different cache TTL based on data volatility:
  - Product details: 30 seconds
  - Customer data: 15-30 seconds
  - Orders: 15-30 seconds
- Cache regions for better organization

### 4. **Quality of Service (QoS)**
- Circuit Breaker pattern:
  - Opens after 3 consecutive failures
  - Stays open for 1 second
  - Prevents cascading failures
- Request timeout: 3-10 seconds (varies by endpoint)

### 5. **Logging**
- Structured logging using Serilog
- Multiple sinks:
  - Console (for development)
  - Debug output
  - Elasticsearch (for centralized logging)
- Request/Response logging
- Performance metrics

### 6. **CORS**
- Configured to allow cross-origin requests
- Can be customized for specific origins in production

### 7. **Environment-Specific Configuration**
- `ocelot.json`: Production configuration (Docker)
- `ocelot.Development.json`: Development configuration (localhost)

## Configuration Structure

### Route Configuration
Each route includes:
```json
{
  "DownstreamPathTemplate": "/api/products",
  "DownstreamScheme": "http",
  "DownstreamHostAndPorts": [{"Host": "product.api", "Port": 80}],
  "UpstreamPathTemplate": "/api/products",
  "UpstreamHttpMethod": ["GET", "POST"],
  "RateLimitOptions": {...},
  "FileCacheOptions": {...},
  "QoSOptions": {...}
}
```

### Global Configuration
```json
{
  "BaseUrl": "http://localhost:5000",
  "RateLimitOptions": {...},
  "QoSOptions": {...},
  "LoadBalancerOptions": {"Type": "RoundRobin"}
}
```

## Available Routes

### Product Service
- `GET /api/products` - Get all products
- `GET /api/products/{id}` - Get product by ID
- `POST /api/products` - Create product
- `PUT /api/products/{id}` - Update product
- `DELETE /api/products/{id}` - Delete product
- `GET /api/products/get-product-by-no/{productNo}` - Get by product number

### Customer Service
- `GET /api/customers` - Get all customers
- `GET /api/customer/{username}` - Get customer by username
- `POST /api/customer` - Create customer
- `DELETE /api/customer` - Delete customer

### Basket Service
- `GET /api/baskets/{username}` - Get basket
- `POST /api/baskets` - Update basket
- `DELETE /api/baskets/{username}` - Delete basket

### Ordering Service
- `GET /api/v1/orders` - Get orders with pagination
- `GET /api/v1/orders/{id}` - Get order by ID
- `GET /api/v1/orders/{username}` - Get orders by username
- `POST /api/v1/orders` - Create order
- `PUT /api/v1/orders/{id}` - Update order
- `DELETE /api/v1/orders/{id}` - Delete order

## Running the Gateway

### Development (Standalone)
```bash
cd src/APIGateWays/OcelotApiGw
dotnet restore
dotnet run
```
Gateway will be available at `http://localhost:5000`

### Production (Docker Compose)
```bash
cd src
docker-compose up -d ocelot.apigw
```
Gateway will be available at `http://localhost:5000`

## Testing the Gateway

### Test Product API
```bash
# Get all products
curl http://localhost:5000/api/products

# Get product by ID
curl http://localhost:5000/api/products/1
```

### Test Customer API
```bash
# Get all customers
curl http://localhost:5000/api/customers

# Get customer by username
curl http://localhost:5000/api/customer/john.doe
```

### Test Basket API
```bash
# Get basket
curl http://localhost:5000/api/baskets/john.doe

# Update basket
curl -X POST http://localhost:5000/api/baskets \
  -H "Content-Type: application/json" \
  -d '{"username":"john.doe","items":[]}'
```

### Test Ordering API
```bash
# Get orders
curl http://localhost:5000/api/v1/orders

# Get orders by username
curl http://localhost:5000/api/v1/orders/john.doe
```

## Monitoring

### Elasticsearch Logs
Access Kibana at `http://localhost:5601` to view logs:
1. Create index pattern: `ocelot-gateway-logs-*`
2. View logs with structured data
3. Create dashboards for monitoring

### Rate Limiting Headers
Response headers include:
- `X-Rate-Limit-Limit`: Maximum requests allowed
- `X-Rate-Limit-Remaining`: Remaining requests
- `X-Rate-Limit-Reset`: When the limit resets

## Best Practices Implemented

1. **Separation of Concerns**: Each microservice accessible through well-defined routes
2. **Resilience**: Circuit breaker and retry policies prevent cascading failures
3. **Performance**: Response caching reduces load on downstream services
4. **Security**: Rate limiting prevents abuse
5. **Observability**: Comprehensive logging for debugging and monitoring
6. **Scalability**: Load balancing enables horizontal scaling
7. **Configuration Management**: Environment-specific configs for flexibility

## Future Enhancements

1. **Authentication & Authorization**
   - Add JWT Bearer authentication
   - Integrate with IdentityServer
   - Role-based access control

2. **Service Discovery**
   - Integrate with Consul or Eureka
   - Dynamic service registration

3. **Advanced Caching**
   - Redis distributed cache
   - Cache invalidation strategies

4. **API Versioning**
   - Support multiple API versions
   - Graceful deprecation

5. **Request Aggregation**
   - Combine multiple service calls
   - Reduce client-side complexity

6. **WebSocket Support**
   - Real-time communication
   - SignalR integration

7. **GraphQL Gateway**
   - Alternative to REST
   - Client-driven queries

## Troubleshooting

### Gateway not starting
- Check if all required services are running
- Verify ocelot.json configuration is valid
- Check logs in console or Elasticsearch

### Routes not working
- Verify downstream service is accessible
- Check DownstreamHostAndPorts configuration
- Ensure network connectivity in Docker

### Rate limiting too restrictive
- Adjust Period and Limit in RateLimitOptions
- Add client to ClientWhitelist for exemption

### Cache not working
- Verify FileCacheOptions are configured
- Check cache TTL values
- Ensure CacheManager is registered in DI

## Configuration Files

- `Program.cs` - Application startup and middleware configuration
- `ocelot.json` - Production routes (Docker environment)
- `ocelot.Development.json` - Development routes (localhost)
- `appsettings.json` - Application settings
- `appsettings.Development.json` - Development-specific settings
- `Dockerfile` - Container image definition

## Dependencies

- Ocelot 23.0.0 - API Gateway framework
- Ocelot.Cache.CacheManager 23.0.0 - Caching support
- Serilog.AspNetCore 8.0.0 - Structured logging
- Serilog.Sinks.Elasticsearch 10.0.0 - Elasticsearch integration

## Support

For issues or questions:
1. Check the logs in Elasticsearch/Kibana
2. Review the configuration files
3. Verify all downstream services are healthy
4. Consult Ocelot documentation: https://ocelot.readthedocs.io/
