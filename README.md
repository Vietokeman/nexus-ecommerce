## Aspnetcore Microservices

<h1 align="center">🚀 Nexus Commerce</h1>
<h3 align="center">Microservices Infrastructure using Docker Compose</h3>

<p align="center">
  <img src="https://img.shields.io/badge/architecture-microservices-blue.svg" />
  <img src="https://img.shields.io/badge/backend-.NET%208-green" />
  <img src="https://img.shields.io/badge/frontend-React%2BVite%20%2B%20Angular18-cyan" />
  <img src="https://img.shields.io/badge/orchestration-Docker--Compose-orange" />
  <img src="https://img.shields.io/badge/database-PostgreSQL%2FRedis-informational" />
  <img src="https://img.shields.io/badge/gateway-Ocelot-purple" />
</p>

---

## ⚡ Quick Start

### One Command Deployment

```powershell
# Windows PowerShell - Khởi động tất cả services
.\start.ps1

# Hoặc thủ công
cd src
docker-compose up -d
```

**✅ Đã xong!** Tất cả microservices chạy qua API Gateway duy nhất:

- **Frontend**: http://localhost:3000
- **Admin Client**: http://localhost:4201
- **API Gateway**: http://localhost:5000 ⭐
- **Swagger**: http://localhost:5000/swagger

### Available Scripts

- `.\start.ps1` - Khởi động toàn bộ hệ thống
- `.\stop.ps1` - Dừng services (với options)
- `.\logs.ps1` - Xem logs real-time

📚 **Chi tiết**: [QUICK_START.md](./docs/QUICK_START.md) | [DEPLOYMENT_GUIDE_VI.md](./docs/DEPLOYMENT_GUIDE_VI.md)

---

## 🧭 Overview

This repository provides a **complete e-commerce platform** built using **Microservices Architecture**, powered by **Docker Compose**, and accessible through **Ocelot API Gateway**.

**Key Features:**

- ✅ **Single Entry Point**: All services accessible via Gateway (port 5000)
- ✅ **Auto Seed Data**: 30+ products với đầy đủ categories
- ✅ **Event-Driven**: RabbitMQ for inter-service communication
- ✅ **Monitoring**: Elasticsearch + Kibana + Health Checks
- ✅ **Modern Frontend**: React + Vite + Zustand + Tailwind CSS
- ✅ **Dedicated Admin App**: Angular + CoreUI back-office separated from customer web app
- ✅ **Admin Service**: `Admin.API` for admin routes under `/api/admin/*`

---

## 🚀 Tech Stack

| Category            | Technology                                              |
| ------------------- | ------------------------------------------------------- |
| 💻 Backend          | `.NET 8`, `ASP.NET Core`, `REST APIs`                   |
| 🛢 Databases        | `SQL Server`, `MySQL`, `PostgreSQL`, `MongoDB`, `Redis` |
| 📩 Message Broker   | `RabbitMQ`                                              |
| 🔎 Logging & Search | `Elasticsearch`, `Kibana`                               |
| 🔧 Dev Tools        | `pgAdmin`, `Portainer`, `Docker`, `Docker Compose`      |
| 🧠 Architecture     | `Microservices`, `Ocelot Gateway`, `EF Core`, `DDD`     |

---

## 🧪 Prerequisites

- Docker Desktop (Windows/macOS/Linux)
- Docker Compose (`v1.29+` or `v2.x`)
- Optional: `JetBrains Rider` or `Visual Studio 2022+` for service development

---

## 📦 Services Overview

### Infrastructure Services

```yaml
version: "3.8"
services:
  orderdb: # SQL Server
  productdb: # MySQL
  customerdb: # PostgreSQL
  basketdb: # Redis
  inventorydb: # MongoDB
  rabbitmq: # Message Broker
  pgadmin: # PostgreSQL UI
  portainer: # Docker Management UI
  elasticsearch: # Logging & Search
  kibana: # Log Dashboard
```

### Microservices

```yaml
product.api: # Product Catalog Service
customer.api: # Customer Management Service
basket.api: # Shopping Cart Service
ordering.api: # Order Processing Service
admin.api: # Admin service for users, roles, posts, categories, series, media
nexus.ai.service: # AI assistant and vector search service
```

### Web Apps

```yaml
react.client: # Customer-facing React + Vite app
angular.admin.client: # Dedicated Angular + CoreUI admin web app
```

### API Gateway

```yaml
ocelot.apigw: # API Gateway (Port 5000)
  - Routing & Load Balancing
  - Rate Limiting
  - Response Caching
  - Circuit Breaker
  - Request Logging
```

---

## 🏗️ Architecture Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                  Client Applications                          │
│         (Web Browser, Mobile, Desktop, etc.)                 │
└───────────────────────┬──────────────────────────────────────┘
                        │
                        │ HTTP/HTTPS
                        ↓
       ┌────────────────────────────────────────────┐
       │   🌐 Ocelot API Gateway :5000 ⭐          │
       │   • Single Entry Point                     │
       │   • Routing & Load Balancing               │
       │   • Rate Limiting (3-20 req/s)            │
       │   • Response Caching (15-60s TTL)         │
       │   • Circuit Breaker (QoS)                  │
       │   • Request/Response Logging               │
       │   • CORS Support                           │
       └───┬────┬────┬────┬────┬────┬────┬────┬────┘
           │    │    │    │    │    │    │    │
     ──────┴────┴────┴────┴────┴────┴────┴────┴──────
     Internal Docker Network (No External Ports)
     ──────┬────┬────┬────┬────┬────┬────┬────┬──────
           │    │    │    │    │    │    │    │
      ┌────▽──┐ │    │    │    │    │    │    │
      │Product│ │    │    │    │    │    │    │
      │  API  │ │    │    │    │    │    │    │
      └───┬───┘ │    │    │    │    │    │    │
          │  ┌──▽────┐   │    │    │    │    │
          │  │Customer   │    │    │    │    │
          │  │  API  │   │    │    │    │    │
          │  └───┬───┘   │    │    │    │    │
          │      │  ┌────▽───┐│    │    │    │
          │      │  │Basket  ││    │    │    │
          │      │  │  API   ││    │    │    │
          │      │  └───┬────┘│    │    │    │
          │      │      │  ┌──▽─────┐   │    │
          │      │      │  │Ordering│   │    │
          │      │      │  │  API   │   │    │
          │      │      │  └───┬────┘   │    │
          │      │      │      │  ┌─────▽──┐ │
          │      │      │      │  │Inventory  │
          │      │      │      │  │   API  │ │
          │      │      │      │  └────┬───┘ │
          │      │      │      │       │  ┌──▽────┐
          │      │      │      │       │  │Payment│
          │      │      │      │       │  │  API  │
          │      │      │      │       │  └───┬───┘
          │      │      │      │       │      │
          ↓      ↓      ↓      ↓       ↓      ↓
    ┌──────────────────────────────────────────────┐
    │         Infrastructure Layer                  │
    │  ┌──────────┐ ┌────────┐ ┌─────────┐        │
    │  │PostgreSQL│ │ Redis  │ │RabbitMQ │        │
    │  │ (nexusdb)│ │:6379   │ │:5672    │        │
    │  │  :5433   │ └────────┘ └─────────┘        │
    │  └──────────┘                                 │
    │  ┌──────────┐ ┌────────┐                     │
    │  │Elastic-  │ │Kibana  │                     │
    │  │ search   │ │:5601   │                     │
    │  │  :9200   │ └────────┘                     │
    │  └──────────┘                                 │
    └──────────────────────────────────────────────┘

📌 Key Points:
- ⭐ ONLY port 5000 (Gateway) is exposed for API access
- All microservices run on internal Docker network
- Frontend (React) runs on port 3000
- Admin client (Angular) runs on port 4201
- Management tools: pgAdmin :5050, RabbitMQ UI :15672, Portainer :9000, Kibana :5601
- Database: PostgreSQL :5433 (nexusdb) for all microservices
```

---

## 💡 How to Run

# 1. Clone project từ GitHub

git clone https://github.com/Vietokeman/nexus-commerce.git
cd nexus-commerce

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

# 🌐 Frontend: http://localhost:3000 (React App)

# 🌐 API Gateway: http://localhost:5000 ⭐ (Tất cả APIs)

# 🌐 Swagger: http://localhost:5000/swagger

#

# 🛠 Management Tools:

# RabbitMQ UI: http://localhost:15672 (guest/guest)

# pgAdmin: http://localhost:5050

# Portainer: http://localhost:9000

# Kibana: http://localhost:5601

#

# 📊 Databases (chỉ dùng cho dev tools):

# PostgreSQL: localhost:5433 (nexusdb - all microservices)

# Redis: localhost:6379 (Basket cache)

#

# ⚠️ LƯU Ý: Các microservices KHÔNG expose port trực tiếp

# Tất cả API calls phải qua Gateway: http://localhost:5000

---

## 🌐 API Gateway Usage

### Quick Test via Gateway

```bash
# Get all products through gateway
curl http://localhost:5000/api/v1/products

# Get all customers
curl http://localhost:5000/api/v1/customers

# Get user's basket
curl http://localhost:5000/api/v1/baskets/john.doe

# Get all orders
curl http://localhost:5000/api/v1/orders

# Get inventory for product
curl http://localhost:5000/api/v1/inventory/{productId}

# Health check
curl http://localhost:5000/health
```

### Gateway Routes (All via port 5000)

| Microservice  | Gateway Route        | Description                    |
| ------------- | -------------------- | ------------------------------ |
| Product API   | `/api/v1/products`   | Product catalog & search       |
| Customer API  | `/api/v1/customers`  | Customer management            |
| Basket API    | `/api/v1/baskets`    | Shopping cart operations       |
| Ordering API  | `/api/v1/orders`     | Order processing               |
| Inventory API | `/api/v1/inventory`  | Stock management               |
| Payment API   | `/api/v1/payments`   | Payment processing             |
| Identity API  | `/api/v1/identity`   | Authentication & authorization |
| FlashSale API | `/api/v1/flashsales` | Flash sale events              |
| GroupBuy API  | `/api/v1/groupbuys`  | Group buying campaigns         |

### Gateway Features

- **Routing**: Single entry point for all microservices
- **Rate Limiting**: 3-20 requests/second (varies by endpoint)
- **Caching**: 15-60 seconds TTL (reduces database load)
- **Circuit Breaker**: Prevents cascading failures
- **Load Balancing**: Round-robin across instances
- **Logging**: Centralized logs in Elasticsearch

📚 **Full Gateway Documentation**: [src/APIGateWays/OcelotApiGw/README.md](src/APIGateWays/OcelotApiGw/README.md)
