## Aspnetcore Microservices

<h1 align="center">🧱 Distributed Ecommerce Platform</h1>
<h3 align="center">Microservices Infrastructure using Docker Compose</h3>

<p align="center">
  <img src="https://img.shields.io/badge/architecture-microservices-blue.svg" />
  <img src="https://img.shields.io/badge/backend-.NET%208-green" />
  <img src="https://img.shields.io/badge/orchestration-Docker--Compose-orange" />
  <img src="https://img.shields.io/badge/database-SQL%2FNoSQL-informational" />
</p>

---

## 🧭 Overview

This repository provides the **infrastructure layer** for a distributed e-commerce platform, built using **Microservices Architecture** and powered by **Docker Compose**.

Each microservice is expected to run in its own containerized environment, and this setup provides the supporting services (databases, message brokers, monitoring tools) to facilitate development and testing.

---

## 🚀 Tech Stack

| Category            | Technology                                      |
|---------------------|--------------------------------------------------|
| 💻 Backend           | `.NET 8`, `ASP.NET Core`, `REST APIs`           |
| 🛢 Databases         | `SQL Server`, `MySQL`, `PostgreSQL`, `MongoDB`, `Redis` |
| 📩 Message Broker    | `RabbitMQ`                                      |
| 🔎 Logging & Search  | `Elasticsearch`, `Kibana`                       |
| 🔧 Dev Tools         | `pgAdmin`, `Portainer`, `Docker`, `Docker Compose` |
| 🧠 Architecture      | `Microservices`, `Ocelot Gateway`, `EF Core`, `DDD` |

---

## 🧪 Prerequisites

- Docker Desktop (Windows/macOS/Linux)
- Docker Compose (`v1.29+` or `v2.x`)
- Optional: `JetBrains Rider` or `Visual Studio 2022+` for service development

---

## 📦 Services Overview

### Infrastructure Services
```yaml
version: '3.8'
services:
  orderdb:       # SQL Server
  productdb:     # MySQL
  customerdb:    # PostgreSQL
  basketdb:      # Redis
  inventorydb:   # MongoDB
  rabbitmq:      # Message Broker
  pgadmin:       # PostgreSQL UI
  portainer:     # Docker Management UI
  elasticsearch: # Logging & Search
  kibana:        # Log Dashboard
```

### Microservices
```yaml
  product.api:   # Product Catalog Service
  customer.api:  # Customer Management Service
  basket.api:    # Shopping Cart Service
  ordering.api:  # Order Processing Service
```

### API Gateway
```yaml
  ocelot.apigw:  # API Gateway (Port 5000)
    - Routing & Load Balancing
    - Rate Limiting
    - Response Caching
    - Circuit Breaker
    - Request Logging
```

---

## 🏗️ Architecture Diagram

```
┌─────────────────────────────────────────────┐
│         Client Applications                  │
│     (Web, Mobile, Desktop, etc.)            │
└────────────────┬────────────────────────────┘
                 │
                 ↓
┌────────────────────────────────────────────┐
│      Ocelot API Gateway :5000              │
│  • Routing & Load Balancing                 │
│  • Rate Limiting (3-20 req/s)              │
│  • Response Caching (15-60s TTL)           │
│  • Circuit Breaker (QoS)                    │
│  • Request/Response Logging                 │
│  • CORS Support                             │
└────┬──────────┬──────────┬─────────┬───────┘
     │          │          │         │
     ↓          ↓          ↓         ↓
┌─────────┐ ┌─────────┐ ┌───────┐ ┌──────────┐
│Product  │ │Customer │ │Basket │ │Ordering  │
│API      │ │API      │ │API    │ │API       │
│:6002    │ │:6003    │ │:6004  │ │:6005     │
└────┬────┘ └────┬────┘ └───┬───┘ └────┬─────┘
     │           │           │          │
     ↓           ↓           ↓          ↓
┌─────────┐ ┌─────────┐ ┌───────┐ ┌──────────┐
│ MySQL   │ │Postgres │ │ Redis │ │SQL Server│
│:3306    │ │:5432    │ │:6379  │ │:1432     │
└─────────┘ └─────────┘ └───────┘ └──────────┘
     │           │           │          │
     └───────────┴───────────┴──────────┘
                 │
                 ↓
┌────────────────────────────────────────────┐
│         Supporting Services                 │
│  • RabbitMQ :5672, :15672                  │
│  • Elasticsearch :9200                      │
│  • Kibana :5601                             │
│  • Portainer :9000                          │
│  • pgAdmin :5050                            │
└────────────────────────────────────────────┘
```

---

## 💡 How to Run
# 1. Clone project từ GitHub
git clone https://github.com/Vietokeman/distributed-ecommerce-platform.git
cd distributed-ecommerce-platform

# 2. Start toàn bộ services trong Docker Compose
docker compose up -d

# 3. Kiểm tra các container đang chạy
docker ps

# 4. Kiểm tra volumes đã được tạo
docker volume ls

# 5. Kiểm tra log của một service cụ thể (VD: elasticsearch)
docker logs elasticsearch

# 6. Nếu cần stop toàn bộ services
docker compose down

# 7. Nếu muốn xóa luôn volumes khi stop (mất data)
docker compose down -v

# 8. Reset lại nếu gặp lỗi port/volume (cẩn thận mất dữ liệu)
docker system prune -a --volumes

# 9. Truy cập các dịch vụ qua trình duyệt:
# API Gateway:       http://localhost:5000 ⭐
# Product API:       http://localhost:6002
# Customer API:      http://localhost:6003
# Basket API:        http://localhost:6004
# Ordering API:      http://localhost:6005
# SQL Server:        localhost:1432 (qua SSMS hoặc Azure Data Studio)
# MySQL:             localhost:3306
# PostgreSQL:        localhost:5432
# Redis:             localhost:6379
# MongoDB:           localhost:27017
# RabbitMQ UI:       http://localhost:15672
# pgAdmin:           http://localhost:5050
# Portainer:         http://localhost:9000
# Elasticsearch:     http://localhost:9200
# Kibana:            http://localhost:5601

---

## 🌐 API Gateway Usage

### Quick Test via Gateway
```bash
# Get all products through gateway
curl http://localhost:5000/api/products

# Get all customers
curl http://localhost:5000/api/customers

# Get user's basket
curl http://localhost:5000/api/baskets/john.doe

# Get all orders
curl http://localhost:5000/api/v1/orders
```

### Gateway Features
- **Routing**: Single entry point for all microservices
- **Rate Limiting**: 3-20 requests/second (varies by endpoint)
- **Caching**: 15-60 seconds TTL (reduces database load)
- **Circuit Breaker**: Prevents cascading failures
- **Load Balancing**: Round-robin across instances
- **Logging**: Centralized logs in Elasticsearch

📚 **Full Gateway Documentation**: [src/APIGateWays/OcelotApiGw/README.md](src/APIGateWays/OcelotApiGw/README.md)
