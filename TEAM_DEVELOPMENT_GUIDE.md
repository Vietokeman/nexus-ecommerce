# 🏢 Hướng Dẫn Development Cho Team Lớn

## 📚 Mục Lục

1. [Best Practices Overview](#best-practices-overview)
2. [Development Strategies](#development-strategies)
3. [Docker Strategy](#docker-strategy)
4. [CI/CD Pipeline](#cicd-pipeline)
5. [Team Workflow](#team-workflow)

---

## 🎯 Best Practices Overview

### Nguyên Tắc Vàng

> **"Chỉ chạy những gì bạn đang develop, mock/stub phần còn lại"**

### Chiến Lược Theo Team Size

| Team Size | Strategy           | Docker Usage                           |
| --------- | ------------------ | -------------------------------------- |
| 1-3 devs  | Selective services | Infrastructure + Service đang develop  |
| 4-10 devs | Domain-based       | Infrastructure + Domain services       |
| 10+ devs  | Shared Dev Env     | Infrastructure local + Services remote |

---

## 🔧 Development Strategies

### Strategy 1: Minimal Local Setup (KHUYẾN NGHỊ cho 1 Developer)

**Chỉ chạy:**

- ✅ Infrastructure (Database, Redis, RabbitMQ, Elasticsearch)
- ✅ Service đang develop (VD: Gateway)
- ✅ Mock/Stub các services khác

**Setup:**

```powershell
# File: docker-compose.dev-minimal.yml
version: "3.8"

services:
  # Infrastructure Only
  nexusdb:
    image: postgis/postgis:16-3.4
    environment:
      - POSTGRES_USER=admin
      - POSTGRES_PASSWORD=admin1234
      - POSTGRES_DB=NexusDb
    ports:
      - "5433:5432"
    volumes:
      - nexusdb_data:/var/lib/postgresql/data

  basketdb:
    image: redis:alpine
    ports:
      - "6379:6379"

  rabbitmq:
    image: rabbitmq:3-management-alpine
    ports:
      - "5672:5672"
      - "15672:15672"

  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:7.17.2
    environment:
      - discovery.type=single-node
      - ES_JAVA_OPTS=-Xms512m -Xmx512m
    ports:
      - "9200:9200"

  kibana:
    image: docker.elastic.co/kibana/kibana:7.17.2
    environment:
      - ELASTICSEARCH_HOSTS=http://elasticsearch:9200
    depends_on:
      - elasticsearch
    ports:
      - "5601:5601"

volumes:
  nexusdb_data:
```

**Run:**

```powershell
# Chỉ chạy infrastructure
docker-compose -f docker-compose.dev-minimal.yml up -d

# Run Gateway từ Visual Studio hoặc CLI
cd src/APIGateWays/OcelotApiGw
dotnet run
```

**Ưu điểm:**

- ⚡ Khởi động nhanh (< 30s)
- 💻 Ít tốn RAM (~ 2-3GB)
- 🔧 Dễ debug
- 🚀 Build nhanh

**Nhược điểm:**

- ⚠️ Cần mock downstream services
- ⚠️ Không test integration đầy đủ

---

### Strategy 2: Domain-Based Setup (Team 4-10 người)

**Chia theo Domain:**

```
Team Product:
  - Product.API
  - Inventory.API

Team Order:
  - Ordering.API
  - Payment.API

Team Customer:
  - Customer.API
  - Identity.API

Team Flash Sale:
  - FlashSale.API
  - GroupBuy.API
```

**File: docker-compose.dev-product.yml**

```yaml
services:
  # Infrastructure (shared)
  nexusdb: ...
  basketdb: ...
  rabbitmq: ...
  elasticsearch: ...

  # Product Domain Services
  product.api:
    build:
      context: .
      dockerfile: Services/Product.API/Dockerfile
    ports:
      - "6002:80"

  inventory.api:
    build:
      context: .
      dockerfile: Services/Inventory.Product.API/Dockerfile
    ports:
      - "6006:80"
```

**Run:**

```powershell
# Team Product chỉ chạy Product domain
docker-compose -f docker-compose.dev-product.yml up -d

# Hoặc run service riêng từ VS
```

---

### Strategy 3: Shared Dev Environment (Team > 10 người)

**Mô hình:**

```
┌─────────────────────────────────────────┐
│   Developer Local Machine               │
│                                         │
│   - Infrastructure (Docker local)       │
│   - Gateway (Local debug)               │
│   - Service đang develop (Local)        │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│   Shared Dev Kubernetes Cluster         │
│   (dev.company.com)                     │
│                                         │
│   - All Microservices (latest)          │
│   - Shared Database                     │
│   - Message Queue                       │
└─────────────────────────────────────────┘
```

**File: appsettings.Development.Local.json**

```json
{
  "DownstreamServices": {
    "ProductAPI": "https://dev.company.com/product-api",
    "CustomerAPI": "https://dev.company.com/customer-api",
    "BasketAPI": "http://localhost:6004" // Service đang develop local
  }
}
```

**Ưu điểm:**

- ✅ Không cần build tất cả
- ✅ Luôn có services mới nhất
- ✅ Tiết kiệm tài nguyên local
- ✅ Giống production

**Nhược điểm:**

- ⚠️ Cần infrastructure team setup
- ⚠️ Cần VPN/networking
- ⚠️ Shared state có thể conflict

---

## 🐳 Docker Strategy

### Chiến Lược Build Image

#### Option 1: Pre-built Images (KHUYẾN NGHỊ)

**Setup Registry:**

```powershell
# Company Private Registry
docker login registry.company.com

# Pull pre-built images
docker pull registry.company.com/product-api:latest
docker pull registry.company.com/customer-api:latest
```

**docker-compose.dev-prebuilt.yml:**

```yaml
services:
  product.api:
    image: registry.company.com/product-api:latest
    # Không build, chỉ pull

  customer.api:
    image: registry.company.com/customer-api:latest
```

**Lợi ích:**

- ⚡ Không cần build (chỉ pull ~ 30s)
- 🎯 Luôn có version stable
- 💾 Tiết kiệm disk space

#### Option 2: Selective Build

**File: docker-compose.dev-selective.yml**

```yaml
services:
  # Services KHÔNG develop → dùng pre-built
  product.api:
    image: registry.company.com/product-api:latest

  # Service ĐANG develop → build local
  ocelot.apigw:
    build:
      context: .
      dockerfile: APIGateWays/OcelotApiGw/Dockerfile
    volumes:
      - ./APIGateWays/OcelotApiGw:/app # Hot reload
```

#### Option 3: Docker Compose Profiles

**docker-compose.yml with profiles:**

```yaml
services:
  nexusdb:
    profiles: ["infra", "full"]

  product.api:
    profiles: ["product", "full"]
    build: ...

  customer.api:
    profiles: ["customer", "full"]
    build: ...

  ocelot.apigw:
    profiles: ["gateway", "full"]
    build: ...
```

**Run:**

```powershell
# Chỉ infrastructure
docker-compose --profile infra up -d

# Infrastructure + Gateway
docker-compose --profile infra --profile gateway up -d

# Full stack
docker-compose --profile full up -d
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions / Azure DevOps

**Workflow cho Microservices:**

```yaml
# .github/workflows/gateway-ci.yml
name: Gateway CI/CD

on:
  push:
    paths:
      - "src/APIGateWays/OcelotApiGw/**"

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Build Docker Image
        run: |
          docker build -t registry.company.com/ocelot-gateway:${{ github.sha }} \
            -f src/APIGateWays/OcelotApiGw/Dockerfile .

      - name: Push to Registry
        run: |
          docker push registry.company.com/ocelot-gateway:${{ github.sha }}
          docker tag registry.company.com/ocelot-gateway:${{ github.sha }} \
            registry.company.com/ocelot-gateway:latest
          docker push registry.company.com/ocelot-gateway:latest

      - name: Deploy to Dev
        run: |
          kubectl set image deployment/gateway \
            gateway=registry.company.com/ocelot-gateway:${{ github.sha }} \
            -n development
```

**Benefits:**

- ✅ Mỗi service có CI/CD riêng
- ✅ Chỉ build service thay đổi
- ✅ Auto deploy to dev environment
- ✅ Developers pull latest images

---

## 👥 Team Workflow

### Quy Trình Làm Việc

#### 1. Developer Workflow

**Bước 1: Xác định scope**

```
Task: Fix bug ở Gateway routing
→ Chỉ cần: Infrastructure + Gateway
→ KHÔNG CẦN: Product, Customer, Order APIs (dùng mock/dev server)
```

**Bước 2: Setup minimal**

```powershell
# Start infrastructure
docker-compose --profile infra up -d

# Run Gateway local
cd src/APIGateWays/OcelotApiGw
dotnet watch run

# Point to shared dev services
# Edit ocelot.Development.json
{
  "DownstreamHostAndPorts": [
    {
      "Host": "dev.company.com/product-api",  // ← Shared dev server
      "Port": 443
    }
  ]
}
```

**Bước 3: Develop & Test**

```powershell
# Code changes...
# Auto reload với dotnet watch

# Test
curl http://localhost:5000/api/products
```

**Bước 4: Commit & Push**

```powershell
git add .
git commit -m "fix: gateway routing issue"
git push origin feature/fix-gateway-routing

# CI/CD tự động build và deploy to dev environment
```

#### 2. Integration Testing

**Người chịu trách nhiệm:**

- QA Team
- DevOps Team

**Environment:**

- Dedicated testing cluster với full services
- Automated E2E tests

**Developers KHÔNG CẦN chạy full stack locally**

---

## 📊 Environment Matrix

| Environment    | Purpose             | Who Uses       | Docker Strategy               |
| -------------- | ------------------- | -------------- | ----------------------------- |
| **Local**      | Feature development | Individual dev | Infrastructure + 1-2 services |
| **Dev**        | Integration testing | Team           | Full stack (auto-deploy)      |
| **Staging**    | Pre-production      | QA/Product     | Full stack (manual deploy)    |
| **Production** | Live                | End users      | Full stack (versioned deploy) |

---

## 💡 Recommendations for Your Scenario

### Nếu bạn đang develop GATEWAY:

**✅ KHUYẾN NGHỊ:**

```powershell
# 1. Tạo file docker-compose.dev-gateway.yml
version: "3.8"

services:
  nexusdb:
    image: postgis/postgis:16-3.4
    environment:
      - POSTGRES_USER=admin
      - POSTGRES_PASSWORD=admin1234
    ports:
      - "5433:5432"

  basketdb:
    image: redis:alpine
    ports:
      - "6379:6379"

  rabbitmq:
    image: rabbitmq:3-management-alpine
    ports:
      - "5672:5672"
      - "15672:15672"

  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:7.17.2
    environment:
      - discovery.type=single-node
      - ES_JAVA_OPTS=-Xms512m -Xmx512m
    ports:
      - "9200:9200"

# 2. Run infrastructure
docker-compose -f docker-compose.dev-gateway.yml up -d

# 3. Run Gateway từ Visual Studio
# File → Open → OcelotApiGw.csproj
# Press F5

# 4. Configure ocelot.Development.json to use mock services
# Hoặc point to localhost:600X nếu cần test specific service
```

**Tại sao:**

- ⚡ Khởi động trong 1-2 phút
- 💻 Tốn ~2GB RAM thay vì 10-15GB
- 🔧 Dễ debug Gateway code
- 🚀 Không phụ thuộc vào internet/Docker Hub
- ✅ Đủ để develop Gateway features

---

## 🎓 Lessons From Big Tech

### Google/Microsoft/Amazon Practice:

1. **Service Virtualization**: Mock downstream services
2. **Shared Dev Clusters**: Kubernetes clusters cho dev/test
3. **Fast Feedback Loop**: < 5 minutes from code to running
4. **Minimal Dependencies**: Chỉ run dependencies trực tiếp
5. **Contract Testing**: Thay vì integration, dùng contract tests

### Facebook Example:

```
Developer cần fix bug ở News Feed API:
→ Chỉ run News Feed API local
→ Auth service: point to dev cluster
→ User service: point to dev cluster
→ Database: local PostgreSQL container
→ Cache: local Redis container

Total startup: < 2 minutes
```

---

## 🚀 Quick Commands Reference

```powershell
# Infrastructure only
docker-compose -f docker-compose.dev-minimal.yml up -d

# Infrastructure + specific service
docker-compose up -d nexusdb basketdb rabbitmq elasticsearch product.api

# Stop all
docker-compose down

# Clean up
docker-compose down -v
docker system prune -a

# Check what's running
docker ps

# View logs
docker logs -f ocelot.apigw
```

---

## 📝 Summary

### ✅ DO:

- Run minimal infrastructure locally
- Run only services you're developing
- Use shared dev environment for integration
- Pre-built images from CI/CD

### ❌ DON'T:

- Build all services every time
- Run full stack locally
- Wait for all services to start
- Waste time on services you don't touch

### 🎯 Goal:

**From commit to running: < 5 minutes**

---

## 📞 Need Help?

**Setup Issues:**

- Check Docker memory: Docker Desktop → Settings → Resources (≥8GB)
- Check disk space: ≥50GB free
- Check internet: VPN/Firewall might block Docker Hub

**Architecture Questions:**

- Discuss with DevOps team about shared dev cluster
- Consider Kubernetes for team > 10
- Implement contract testing (Pact.io)

---

Generated: February 16, 2026
