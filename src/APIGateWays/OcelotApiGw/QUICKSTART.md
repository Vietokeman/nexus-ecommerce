# Ocelot API Gateway - Quick Start Guide

## Prerequisites

- .NET 8.0 SDK
- Docker & Docker Compose
- Visual Studio 2022 or VS Code

## Quick Start (5 minutes)

### Step 1: Start Infrastructure Services

```bash
cd d:\Github-Repo\Microservice\distributed-ecommerce-platform\src

# Start databases and infrastructure
docker-compose up -d orderdb productdb customerdb basketdb rabbitmq elasticsearch
```

Wait 30 seconds for services to initialize.

### Step 2: Start Microservices

```bash
# Start all microservices
docker-compose up -d product.api customer.api basket.api ordering.api
```

### Step 3: Start API Gateway

```bash
# Start the Ocelot Gateway
docker-compose up -d ocelot.apigw
```

### Step 4: Verify Setup

```bash
# Check all containers are running
docker ps

# Test the gateway
curl http://localhost:5000/api/products
```

## Testing the Gateway

### Using cURL

```bash
# Products
curl http://localhost:5000/api/products
curl http://localhost:5000/api/products/1

# Customers
curl http://localhost:5000/api/customers

# Baskets
curl http://localhost:5000/api/baskets/john.doe

# Orders
curl http://localhost:5000/api/v1/orders
```

### Using the .http File

1. Open `OcelotApiGw.http` in VS Code
2. Install REST Client extension
3. Click "Send Request" above any request

### Using Browser

Navigate to:
- Products: http://localhost:5000/api/products
- Customers: http://localhost:5000/api/customers
- Orders: http://localhost:5000/api/v1/orders

## Service Ports

| Service | Port | URL |
|---------|------|-----|
| API Gateway | 5000 | http://localhost:5000 |
| Product API | 6002 | http://localhost:6002 |
| Customer API | 6003 | http://localhost:6003 |
| Basket API | 6004 | http://localhost:6004 |
| Ordering API | 6005 | http://localhost:6005 |
| Elasticsearch | 9200 | http://localhost:9200 |
| Kibana | 5601 | http://localhost:5601 |

## Monitoring

### View Logs

```bash
# Gateway logs
docker logs -f ocelot.apigw

# All services
docker-compose logs -f
```

### Access Kibana

1. Open http://localhost:5601
2. Create index pattern: `ocelot-gateway-logs-*`
3. View gateway logs with structured data

## Development Mode

### Run Gateway Locally

```bash
cd src/APIGateWays/OcelotApiGw

# Restore packages
dotnet restore

# Run
dotnet run --urls="http://localhost:5000"
```

This uses `ocelot.Development.json` which points to localhost:6002, 6003, etc.

## Troubleshooting

### Gateway not starting?

```bash
# Check logs
docker logs ocelot.apigw

# Restart
docker-compose restart ocelot.apigw
```

### Can't reach services?

```bash
# Check if services are running
docker ps

# Check network
docker network inspect viet_microservices

# Verify service health
curl http://localhost:6002/api/products
```

### Rate limited?

Wait 1 second or adjust limits in `ocelot.json`

## Next Steps

1. ✅ Test all endpoints using `OcelotApiGw.http`
2. ✅ Review logs in Kibana
3. ✅ Check rate limiting by sending rapid requests
4. ✅ Monitor cache performance
5. ✅ Read `CONFIGURATION_GUIDE.md` for advanced configuration
6. ✅ Read `README.md` for detailed documentation

## Stop Everything

```bash
# Stop all services
docker-compose down

# Remove volumes (careful - deletes data!)
docker-compose down -v
```

## Useful Commands

```bash
# View running containers
docker ps

# View all containers (including stopped)
docker ps -a

# View logs for specific service
docker logs -f <container-name>

# Restart specific service
docker-compose restart <service-name>

# Rebuild and restart
docker-compose up -d --build <service-name>

# Check service health
curl -I http://localhost:5000/api/products
```

## Support

For detailed documentation, see:
- [README.md](README.md) - Complete feature documentation
- [CONFIGURATION_GUIDE.md](CONFIGURATION_GUIDE.md) - Advanced configuration
- [Ocelot Documentation](https://ocelot.readthedocs.io/)
