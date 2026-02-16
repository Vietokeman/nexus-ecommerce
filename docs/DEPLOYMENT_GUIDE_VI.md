# 🚀 HƯỚNG DẪN TRIỂN KHAI - Nexus Commerce

**Phiên bản:** 1.0  
**Ngày cập nhật:** 16/02/2026  
**Tác giả:** Senior Full-Stack .NET & React Engineer

---

## 📋 Mục Lục

1. [Yêu Cầu Hệ Thống](#1-yêu-cầu-hệ-thống)
2. [Triển Khai Backend (.NET) Từ VS Code](#2-triển-khai-backend-net-từ-vs-code)
3. [Triển Khai Backend (.NET) Từ Visual Studio](#3-triển-khai-backend-net-từ-visual-studio)
4. [Triển Khai Frontend (React) Từ VS Code](#4-triển-khai-frontend-react-từ-vs-code)
5. [Triển Khai Với Docker Compose](#5-triển-khai-với-docker-compose)
6. [Cơ Chế Event Transmission Với RabbitMQ](#6-cơ-chế-event-transmission-với-rabbitmq)
7. [Kiểm Tra Và Debug](#7-kiểm-tra-và-debug)
8. [Troubleshooting](#8-troubleshooting)

---

## 1. Yêu Cầu Hệ Thống

### 1.1. Phần Mềm Cần Thiết

| Công Cụ                | Phiên Bản                | Download Link                                  |
| ---------------------- | ------------------------ | ---------------------------------------------- |
| **.NET SDK**           | 8.0+                     | https://dotnet.microsoft.com/download          |
| **Node.js**            | 20.x+                    | https://nodejs.org/                            |
| **Docker Desktop**     | Latest                   | https://www.docker.com/products/docker-desktop |
| **Visual Studio 2022** | Community/Pro/Enterprise | https://visualstudio.microsoft.com/            |
| **VS Code**            | Latest                   | https://code.visualstudio.com/                 |
| **Git**                | Latest                   | https://git-scm.com/                           |

### 1.2. Extensions Cho VS Code

Mở VS Code và cài đặt các extensions sau:

```bash
# C# Dev Kit
code --install-extension ms-dotnettools.csdevkit

# C# Extensions
code --install-extension ms-dotnettools.csharp

# Docker
code --install-extension ms-azuretools.vscode-docker

# ESLint
code --install-extension dbaeumer.vscode-eslint

# Prettier
code --install-extension esbenp.prettier-vscode

# GitLens
code --install-extension eamodio.gitlens
```

### 1.3. Kiểm Tra Cài Đặt

```powershell
# Kiểm tra .NET SDK
dotnet --version
# Expected: 8.0.x hoặc cao hơn

# Kiểm tra Node.js
node --version
# Expected: v20.x.x hoặc cao hơn

# Kiểm tra npm
npm --version
# Expected: 10.x.x hoặc cao hơn

# Kiểm tra Docker
docker --version
# Expected: Docker version 24.x.x hoặc cao hơn

docker-compose --version
# Expected: Docker Compose version v2.x.x hoặc cao hơn
```

---

## 2. Triển Khai Backend (.NET) Từ VS Code

### 2.1. Mở Project Trong VS Code

```powershell
# Di chuyển đến thư mục project
cd d:\Git-Repo\Microservice\distributed-ecommerce-platform

# Mở VS Code
code .
```

### 2.2. Restore Dependencies

```powershell
# Restore tất cả NuGet packages
dotnet restore Distributed.Ecommerce.Platform.sln
```

### 2.3. Build Solution

```powershell
# Build toàn bộ solution
dotnet build Distributed.Ecommerce.Platform.sln --configuration Debug

# Hoặc build từng microservice riêng lẻ
dotnet build src/Services/Product.API/Product.API.csproj
dotnet build src/Services/Customer.API/Customer.API.csproj
dotnet build src/Services/Basket.API/Basket.API.csproj
dotnet build src/Services/Ordering/Ordering.API/Ordering.API.csproj
```

### 2.4. Chạy Một Microservice Riêng Lẻ

#### 2.4.1. Sử dụng Terminal Tích Hợp

```powershell
# Product API (Port 6002)
cd src/Services/Product.API
dotnet run --project Product.API.csproj

# Customer API (Port 6003)
cd src/Services/Customer.API
dotnet run --project Customer.API.csproj

# Basket API (Port 6004)
cd src/Services/Basket.API
dotnet run --project Basket.API.csproj

# Ordering API (Port 6005)
cd src/Services/Ordering/Ordering.API
dotnet run --project Ordering.API.csproj
```

#### 2.4.2. Sử dụng Launch Configuration

Tạo file `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Product.API",
      "type": "coreclr",
      "request": "launch",
      "preLaunchTask": "build-product-api",
      "program": "${workspaceFolder}/src/Services/Product.API/bin/Debug/net8.0/Product.API.dll",
      "args": [],
      "cwd": "${workspaceFolder}/src/Services/Product.API",
      "stopAtEntry": false,
      "env": {
        "ASPNETCORE_ENVIRONMENT": "Development",
        "ASPNETCORE_URLS": "http://localhost:6002"
      },
      "sourceFileMap": {
        "/Views": "${workspaceFolder}/Views"
      }
    },
    {
      "name": "Customer.API",
      "type": "coreclr",
      "request": "launch",
      "preLaunchTask": "build-customer-api",
      "program": "${workspaceFolder}/src/Services/Customer.API/bin/Debug/net8.0/Customer.API.dll",
      "args": [],
      "cwd": "${workspaceFolder}/src/Services/Customer.API",
      "stopAtEntry": false,
      "env": {
        "ASPNETCORE_ENVIRONMENT": "Development",
        "ASPNETCORE_URLS": "http://localhost:6003"
      }
    },
    {
      "name": "Ocelot.ApiGw",
      "type": "coreclr",
      "request": "launch",
      "preLaunchTask": "build-ocelot",
      "program": "${workspaceFolder}/src/APIGateWays/OcelotApiGw/bin/Debug/net8.0/OcelotApiGw.dll",
      "args": [],
      "cwd": "${workspaceFolder}/src/APIGateWays/OcelotApiGw",
      "stopAtEntry": false,
      "env": {
        "ASPNETCORE_ENVIRONMENT": "Development",
        "ASPNETCORE_URLS": "http://localhost:5000"
      }
    }
  ],
  "compounds": [
    {
      "name": "All Services",
      "configurations": ["Product.API", "Customer.API", "Ocelot.ApiGw"]
    }
  ]
}
```

Tạo file `.vscode/tasks.json`:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "build-product-api",
      "command": "dotnet",
      "type": "process",
      "args": [
        "build",
        "${workspaceFolder}/src/Services/Product.API/Product.API.csproj",
        "/property:GenerateFullPaths=true",
        "/consoleloggerparameters:NoSummary"
      ],
      "problemMatcher": "$msCompile"
    },
    {
      "label": "build-customer-api",
      "command": "dotnet",
      "type": "process",
      "args": [
        "build",
        "${workspaceFolder}/src/Services/Customer.API/Customer.API.csproj",
        "/property:GenerateFullPaths=true",
        "/consoleloggerparameters:NoSummary"
      ],
      "problemMatcher": "$msCompile"
    },
    {
      "label": "build-ocelot",
      "command": "dotnet",
      "type": "process",
      "args": [
        "build",
        "${workspaceFolder}/src/APIGateWays/OcelotApiGw/OcelotApiGw.csproj",
        "/property:GenerateFullPaths=true",
        "/consoleloggerparameters:NoSummary"
      ],
      "problemMatcher": "$msCompile"
    }
  ]
}
```

### 2.5. Watch Mode (Hot Reload)

```powershell
# Chạy với watch mode để tự động reload khi code thay đổi
cd src/Services/Product.API
dotnet watch run

# Hoặc với cấu hình cụ thể
dotnet watch run --project Product.API.csproj --urls "http://localhost:6002"
```

### 2.6. Cấu Hình Environment Variables

Tạo file `appsettings.Development.json` trong mỗi microservice:

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "ConnectionStrings": {
    "DefaultConnectionString": "Host=localhost;Port=5433;Database=ProductDb;Username=admin;Password=admin1234;"
  },
  "ElasticConfiguration": {
    "Uri": "http://localhost:9200"
  }
}
```

---

## 3. Triển Khai Backend (.NET) Từ Visual Studio

### 3.1. Mở Solution

1. Mở **Visual Studio 2022**
2. File → Open → Project/Solution
3. Chọn file `Distributed.Ecommerce.Platform.sln`

### 3.2. Restore NuGet Packages

```
Tools → NuGet Package Manager → Manage NuGet Packages for Solution...
→ Click "Restore" button
```

Hoặc sử dụng Package Manager Console:

```powershell
# Tools → NuGet Package Manager → Package Manager Console
Update-Package -Reinstall
```

### 3.3. Build Solution

```
Build → Build Solution (Ctrl + Shift + B)
```

Hoặc sử dụng Package Manager Console:

```powershell
dotnet build
```

### 3.4. Configure Startup Projects

#### 3.4.1. Single Startup Project

1. Right-click vào project muốn chạy (ví dụ: `Product.API`)
2. Chọn **"Set as Startup Project"**
3. Nhấn **F5** để debug hoặc **Ctrl+F5** để chạy không debug

#### 3.4.2. Multiple Startup Projects

1. Right-click vào **Solution** trong Solution Explorer
2. Chọn **"Configure Startup Projects..."**
3. Chọn **"Multiple startup projects"**
4. Đặt **Action = Start** cho các projects:
   - OcelotApiGw
   - Product.API
   - Customer.API
   - Basket.API
   - Ordering.API
   - Identity.API
   - Payment.API

5. Nhấn **OK** và chạy **F5**

### 3.5. Debug Multiple Services

1. Đặt breakpoints trong code
2. Press **F5** để start debugging
3. Visual Studio sẽ mở nhiều console windows cho mỗi service
4. Kiểm tra output trong **Output Window** (View → Output)

### 3.6. Launchsettings.json Configuration

File `Properties/launchSettings.json` trong mỗi project:

```json
{
  "$schema": "http://json.schemastore.org/launchsettings.json",
  "profiles": {
    "http": {
      "commandName": "Project",
      "dotnetRunMessages": true,
      "launchBrowser": true,
      "launchUrl": "swagger",
      "applicationUrl": "http://localhost:6002",
      "environmentVariables": {
        "ASPNETCORE_ENVIRONMENT": "Development"
      }
    },
    "Docker": {
      "commandName": "Docker",
      "launchBrowser": true,
      "launchUrl": "{Scheme}://{ServiceHost}:{ServicePort}/swagger",
      "environmentVariables": {
        "ASPNETCORE_URLS": "http://+:80"
      },
      "publishAllPorts": true
    }
  }
}
```

---

## 4. Triển Khai Frontend (React) Từ VS Code

### 4.1. Mở React Project

```powershell
# Di chuyển vào thư mục React client
cd d:\Git-Repo\Microservice\distributed-ecommerce-platform\src\WebApps\React.Client

# Mở trong VS Code
code .
```

### 4.2. Cài Đặt Dependencies

```powershell
# Sử dụng npm
npm install

# Hoặc sử dụng yarn (nếu đã cài)
yarn install

# Hoặc sử dụng pnpm (nhanh hơn)
pnpm install
```

### 4.3. Chạy Development Server

```powershell
# Start dev server (port 3000 mặc định)
npm run dev

# Server sẽ chạy tại: http://localhost:3000
```

### 4.4. Build Production

```powershell
# Build cho production
npm run build

# Output sẽ được tạo trong thư mục dist/
```

### 4.5. Preview Production Build

```powershell
# Preview production build locally
npm run preview
```

### 4.6. Lint và Format Code

```powershell
# Chạy ESLint
npm run lint

# Fix ESLint errors tự động
npm run lint:fix

# Format code với Prettier
npm run format
```

### 4.7. Environment Configuration

Tạo file `.env.local` trong thư mục React.Client:

```env
# API Gateway URL
VITE_API_GATEWAY_URL=http://localhost:5000

# API Endpoints
VITE_PRODUCT_API_URL=http://localhost:5000/api/v1/products
VITE_BASKET_API_URL=http://localhost:5000/api/v1/baskets
VITE_ORDER_API_URL=http://localhost:5000/api/v1/orders
VITE_CUSTOMER_API_URL=http://localhost:5000/api/v1/customers
VITE_IDENTITY_API_URL=http://localhost:5000/api/v1/identity
VITE_PAYMENT_API_URL=http://localhost:5000/api/v1/payments

# App Config
VITE_APP_NAME=E-Commerce Platform
VITE_APP_VERSION=1.0.0
```

Sử dụng trong code:

```typescript
// src/lib/api.ts
const API_GATEWAY_URL =
  import.meta.env.VITE_API_GATEWAY_URL || "http://localhost:5000";

export const apiClient = axios.create({
  baseURL: API_GATEWAY_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});
```

### 4.8. VS Code Debug Configuration

Tạo file `.vscode/launch.json` trong thư mục React.Client:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Launch Chrome against localhost",
      "url": "http://localhost:3000",
      "webRoot": "${workspaceFolder}/src",
      "sourceMaps": true
    }
  ]
}
```

---

## 5. Triển Khai Với Docker Compose

### 5.1. Kiến Trúc Docker

```
┌─────────────────────────────────────────────────────────────┐
│                    Docker Network: viet_microservices        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  PostgreSQL  │  │    Redis     │  │   RabbitMQ   │      │
│  │  (nexusdb)   │  │  (basketdb)  │  │              │      │
│  │  Port: 5433  │  │  Port: 6379  │  │  Port: 5672  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │            Microservices Layer                        │   │
│  │  - Product.API      (6002)                           │   │
│  │  - Customer.API     (6003)                           │   │
│  │  - Basket.API       (6004)                           │   │
│  │  - Ordering.API     (6005)                           │   │
│  │  - Inventory.API    (6006)                           │   │
│  │  - Payment.API      (6007)                           │   │
│  │  - Hangfire.API     (6008)                           │   │
│  │  - Identity.API     (6009)                           │   │
│  │  - FlashSale.API    (6011)                           │   │
│  │  - GroupBuy.API     (6012)                           │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──────────────┐  ┌──────────────────────────────────┐    │
│  │   Ocelot     │  │      React Client                 │    │
│  │   Gateway    │  │      (Frontend)                   │    │
│  │  Port: 5000  │  │      Port: 3000                   │    │
│  └──────────────┘  └──────────────────────────────────┘    │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Elasticsearch│  │    Kibana    │  │   Portainer  │      │
│  │  Port: 9200  │  │  Port: 5601  │  │  Port: 9000  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### 5.2. Triển Khai Từ Docker Desktop

#### 5.2.1. Khởi Động Docker Desktop

1. Mở **Docker Desktop**
2. Đợi Docker Engine khởi động hoàn toàn
3. Kiểm tra status: Docker icon phải có màu xanh

#### 5.2.2. Di Chuyển Vào Thư Mục Chứa docker-compose

```powershell
cd d:\Git-Repo\Microservice\distributed-ecommerce-platform\src
```

#### 5.2.3. Build Images

```powershell
# Build tất cả images (lần đầu tiên hoặc khi có thay đổi code)
docker-compose build

# Build một service cụ thể
docker-compose build product.api

# Build với no-cache (xóa cache cũ)
docker-compose build --no-cache

# Build parallel (nhanh hơn)
docker-compose build --parallel
```

#### 5.2.4. Khởi Động Services

```powershell
# Khởi động tất cả services (detached mode)
docker-compose up -d

# Khởi động và xem logs real-time
docker-compose up

# Khởi động một service cụ thể
docker-compose up -d product.api

# Khởi động với rebuild
docker-compose up -d --build
```

#### 5.2.5. Kiểm Tra Trạng Thái

```powershell
# Xem danh sách containers đang chạy
docker-compose ps

# Xem logs của tất cả services
docker-compose logs

# Xem logs của một service cụ thể
docker-compose logs product.api

# Follow logs (real-time)
docker-compose logs -f product.api

# Xem logs 100 dòng cuối
docker-compose logs --tail=100 product.api
```

#### 5.2.6. Dừng Services

```powershell
# Dừng tất cả services (giữ containers)
docker-compose stop

# Dừng một service cụ thể
docker-compose stop product.api

# Dừng và xóa containers (giữ volumes)
docker-compose down

# Dừng, xóa containers và volumes
docker-compose down -v

# Dừng, xóa containers, volumes và images
docker-compose down -v --rmi all
```

#### 5.2.7. Restart Services

```powershell
# Restart tất cả services
docker-compose restart

# Restart một service cụ thể
docker-compose restart product.api
```

### 5.3. Khởi Động Từng Nhóm Services

#### 5.3.1. Chỉ Infrastructure

```powershell
docker-compose up -d nexusdb basketdb rabbitmq elasticsearch kibana pgadmin portainer
```

#### 5.3.2. Core Microservices

```powershell
docker-compose up -d product.api customer.api basket.api ordering.api inventory.api
```

#### 5.3.3. Authentication & Payment

```powershell
docker-compose up -d identity.api payment.api
```

#### 5.3.4. API Gateway & Frontend

```powershell
docker-compose up -d ocelot.apigw react.client
```

### 5.4. Scale Services

```powershell
# Scale một service lên nhiều instances
docker-compose up -d --scale product.api=3

# Kiểm tra
docker-compose ps product.api
```

### 5.5. Exec vào Container

```powershell
# Mở bash shell trong container
docker-compose exec product.api /bin/bash

# Chạy lệnh trong container
docker-compose exec nexusdb psql -U admin -d ProductDb

# Xem biến môi trường
docker-compose exec product.api env
```

### 5.6. Docker Compose Commands Cheat Sheet

```powershell
# ==================== BUILD ====================
docker-compose build                    # Build tất cả services
docker-compose build --no-cache         # Build không dùng cache
docker-compose build product.api        # Build một service

# ==================== START ====================
docker-compose up                       # Start tất cả (foreground)
docker-compose up -d                    # Start tất cả (background)
docker-compose up -d product.api        # Start một service
docker-compose up -d --build            # Build và start

# ==================== STOP ====================
docker-compose stop                     # Stop tất cả
docker-compose stop product.api         # Stop một service
docker-compose down                     # Stop và remove containers
docker-compose down -v                  # Stop, remove containers & volumes

# ==================== LOGS ====================
docker-compose logs                     # Xem logs tất cả
docker-compose logs -f                  # Follow logs
docker-compose logs product.api         # Logs một service
docker-compose logs --tail=50 -f        # 50 dòng cuối + follow

# ==================== STATUS ====================
docker-compose ps                       # Danh sách containers
docker-compose top                      # Processes đang chạy
docker stats                            # Resource usage real-time

# ==================== EXEC ====================
docker-compose exec product.api bash    # Vào container bash
docker-compose exec nexusdb psql -U admin  # Chạy command

# ==================== CLEANUP ====================
docker system prune                     # Xóa unused data
docker volume prune                     # Xóa unused volumes
docker image prune                      # Xóa unused images
docker-compose down -v --rmi all        # Xóa tất cả
```

---

## 6. Cơ Chế Event Transmission Với RabbitMQ

### 6.1. Kiến Trúc Event-Driven

```
┌────────────────────────────────────────────────────────────────┐
│                    Event-Driven Architecture                    │
└────────────────────────────────────────────────────────────────┘

   ┌─────────────┐        ┌─────────────┐        ┌─────────────┐
   │  Basket.API │        │  Payment.API│        │ GroupBuy.API│
   │  (Publisher)│        │  (Publisher)│        │  (Publisher)│
   └──────┬──────┘        └──────┬──────┘        └──────┬──────┘
          │                      │                       │
          │ Publish Event        │ Publish Event         │
          │                      │                       │
          ▼                      ▼                       ▼
   ┌──────────────────────────────────────────────────────────┐
   │              RabbitMQ Message Broker                      │
   │                                                           │
   │  ┌─────────────────────────────────────────────────┐     │
   │  │           Exchange (Topic/Direct/Fanout)         │     │
   │  └────┬──────────────┬───────────────┬─────────────┘     │
   │       │              │               │                   │
   │  ┌────▼─────┐   ┌───▼──────┐   ┌───▼──────┐            │
   │  │  Queue 1 │   │ Queue 2  │   │ Queue 3  │            │
   │  │ Checkout │   │ Payment  │   │ GroupBuy │            │
   │  └────┬─────┘   └───┬──────┘   └───┬──────┘            │
   │       │             │              │                    │
   └───────┼─────────────┼──────────────┼────────────────────┘
           │             │              │
           │ Consume     │ Consume      │ Consume
           │             │              │
   ┌───────▼──────┐ ┌────▼─────┐  ┌────▼─────┐
   │ Ordering.API │ │Order.API │  │Order.API │
   │  (Consumer)  │ │(Consumer)│  │(Consumer)│
   └──────────────┘ └──────────┘  └──────────┘
```

### 6.2. Event Flow Chi Tiết

#### 6.2.1. Basket Checkout Event Flow

```
User Checkout
     │
     ├──> [1] Basket.API validates cart
     │
     ├──> [2] Basket.API publishes BasketCheckoutEvent
     │         {
     │           UserName: "john@example.com",
     │           TotalPrice: 1500000,
     │           FirstName: "John",
     │           LastName: "Doe",
     │           Address: "123 Street",
     │           Products: [...]
     │         }
     │
     ▼
RabbitMQ Exchange
     │
     ├──> Queue: basket-checkout-queue
     │
     ▼
Ordering.API Consumer
     │
     ├──> [3] Receives event
     ├──> [4] Creates Order entity
     ├──> [5] Saves to OrderDb (PostgreSQL)
     ├──> [6] Sends confirmation email
     ├──> [7] Publishes OrderCreatedEvent
     │
     ▼
Multiple Consumers
     ├──> Inventory.API (updates stock)
     ├──> Payment.API (processes payment)
     └──> Notification.API (sends SMS)
```

#### 6.2.2. Payment Completed Event Flow

```
Payment Gateway Webhook
     │
     ├──> [1] Payment.API receives PayOS webhook
     │
     ├──> [2] Validates transaction
     │
     ├──> [3] Updates Payment status in DB
     │
     ├──> [4] Publishes PaymentCompletedEvent
     │         {
     │           OrderId: 12345,
     │           TransactionId: "TXN-ABC-123",
     │           Amount: 1500000,
     │           Status: "Completed",
     │           PaymentMethod: "QR_CODE"
     │         }
     │
     ▼
RabbitMQ Exchange
     │
     ├──> Queue: payment-completed-queue
     │
     ▼
Ordering.API Consumer
     │
     ├──> [5] Receives event
     ├──> [6] Updates Order status to "Paid"
     ├──> [7] Triggers fulfillment process
     ├──> [8] Sends confirmation email
     │
     ▼
Done
```

### 6.3. Cấu Hình RabbitMQ Trong Code

#### 6.3.1. Basket.API (Publisher)

```csharp
// Program.cs - Basket.API
using MassTransit;

builder.Services.AddMassTransit(x =>
{
    x.UsingRabbitMq((context, cfg) =>
    {
        cfg.Host("rabbitmq", "/", h =>
        {
            h.Username("guest");
            h.Password("guest");
        });
    });
});

// BasketController.cs
[HttpPost("checkout")]
public async Task<IActionResult> CheckoutBasket([FromBody] BasketCheckout basketCheckout)
{
    // Validate basket
    var basket = await _repository.GetBasket(basketCheckout.UserName);

    // Map to event
    var eventMessage = _mapper.Map<BasketCheckoutEvent>(basketCheckout);
    eventMessage.TotalPrice = basket.TotalPrice;

    // Publish event to RabbitMQ
    await _publishEndpoint.Publish(eventMessage);

    // Delete basket
    await _repository.DeleteBasket(basketCheckout.UserName);

    return Accepted();
}
```

#### 6.3.2. Ordering.API (Consumer)

```csharp
// Program.cs - Ordering.API
builder.Services.AddMassTransit(x =>
{
    // Register consumer
    x.AddConsumer<BasketCheckoutConsumer>();

    x.UsingRabbitMq((context, cfg) =>
    {
        cfg.Host("rabbitmq", "/", h =>
        {
            h.Username("guest");
            h.Password("guest");
        });

        // Configure endpoint for consumer
        cfg.ReceiveEndpoint("basket-checkout-queue", e =>
        {
            e.ConfigureConsumer<BasketCheckoutConsumer>(context);

            // Retry policy
            e.UseMessageRetry(r => r.Interval(3, TimeSpan.FromSeconds(5)));

            // Circuit breaker
            e.UseCircuitBreaker(cb =>
            {
                cb.TrackingPeriod = TimeSpan.FromMinutes(1);
                cb.TripThreshold = 15;
                cb.ActiveThreshold = 10;
                cb.ResetInterval = TimeSpan.FromMinutes(5);
            });
        });
    });
});

// BasketCheckoutConsumer.cs
public class BasketCheckoutConsumer : IConsumer<BasketCheckoutEvent>
{
    private readonly IMediator _mediator;
    private readonly ILogger<BasketCheckoutConsumer> _logger;

    public async Task Consume(ConsumeContext<BasketCheckoutEvent> context)
    {
        _logger.LogInformation("Received BasketCheckoutEvent for {UserName}",
            context.Message.UserName);

        // Map event to command
        var command = _mapper.Map<CheckoutOrderCommand>(context.Message);

        // Process command using CQRS/MediatR
        var result = await _mediator.Send(command);

        if (result.IsSuccess)
        {
            _logger.LogInformation("Order created successfully: {OrderId}", result.OrderId);
        }
        else
        {
            _logger.LogError("Failed to create order: {Error}", result.Error);
            throw new Exception(result.Error); // Trigger retry
        }
    }
}
```

### 6.4. Event Message Definitions

```csharp
// EventBus.Messages/Events/BasketCheckoutEvent.cs
namespace EventBus.Messages.Events
{
    public class BasketCheckoutEvent
    {
        // Customer Info
        public string UserName { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string EmailAddress { get; set; }

        // Address
        public string AddressLine { get; set; }
        public string Country { get; set; }
        public string State { get; set; }
        public string ZipCode { get; set; }

        // Payment
        public string CardName { get; set; }
        public string CardNumber { get; set; }
        public string Expiration { get; set; }
        public string CVV { get; set; }
        public int PaymentMethod { get; set; }

        // Order
        public decimal TotalPrice { get; set; }

        // Metadata
        public Guid CorrelationId { get; set; }
        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
    }
}

// EventBus.Messages/Events/PaymentCompletedEvent.cs
public class PaymentCompletedEvent
{
    public long OrderId { get; set; }
    public string TransactionId { get; set; }
    public decimal Amount { get; set; }
    public string Status { get; set; } // "Completed", "Failed", "Pending"
    public string PaymentMethod { get; set; }
    public DateTime PaymentDate { get; set; }
    public Guid CorrelationId { get; set; }
}
```

### 6.5. Monitoring RabbitMQ

#### 6.5.1. Truy Cập RabbitMQ Management UI

```
URL: http://localhost:15672
Username: guest
Password: guest
```

#### 6.5.2. Kiểm Tra Queues

1. Vào tab **Queues**
2. Xem các queues:
   - `basket-checkout-queue`
   - `payment-completed-queue`
   - `order-created-queue`

3. Kiểm tra metrics:
   - **Ready**: Số messages chờ xử lý
   - **Unacked**: Số messages đang được xử lý
   - **Total**: Tổng số messages
   - **Message rate**: Tốc độ publish/consume

#### 6.5.3. Xem Messages

1. Click vào queue name
2. Tab **Get messages**
3. Click **Get Message(s)** để xem message content

### 6.6. Error Handling & Retry

#### 6.6.1. Retry Policy

```csharp
cfg.ReceiveEndpoint("basket-checkout-queue", e =>
{
    // Retry 3 lần, mỗi lần cách nhau 5 giây
    e.UseMessageRetry(r => r.Interval(3, TimeSpan.FromSeconds(5)));
});
```

#### 6.6.2. Dead Letter Queue

```csharp
cfg.ReceiveEndpoint("basket-checkout-queue", e =>
{
    e.ConfigureConsumer<BasketCheckoutConsumer>(context);

    // Tự động chuyển failed messages sang dead letter queue
    e.UseMessageRetry(r =>
    {
        r.Interval(3, TimeSpan.FromSeconds(5));
        r.Handle<Exception>();
    });

    // Dead letter exchange
    e.BindDeadLetterQueue("basket-checkout-queue-error");
});
```

### 6.7. Testing Event Flow

#### 6.7.1. Publish Test Event (PowerShell)

```powershell
# Test Basket Checkout Event
$headers = @{
    "Content-Type" = "application/json"
}

$body = @{
    userName = "test@example.com"
    firstName = "Test"
    lastName = "User"
    emailAddress = "test@example.com"
    addressLine = "123 Test Street"
    country = "Vietnam"
    state = "HCM"
    zipCode = "700000"
    totalPrice = 1500000
    paymentMethod = 1
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:6004/api/v1/basket/checkout" `
    -Method POST `
    -Headers $headers `
    -Body $body
```

#### 6.7.2. Monitor Logs

```powershell
# Xem logs của Basket.API (publisher)
docker-compose logs -f basket.api

# Xem logs của Ordering.API (consumer)
docker-compose logs -f ordering.api

# Xem logs của RabbitMQ
docker-compose logs -f rabbitmq
```

---

## 7. Kiểm Tra Và Debug

### 7.1. Health Checks

#### 7.1.1. Kiểm Tra Services

```powershell
# Ocelot Gateway Health
curl http://localhost:5000/health

# Product API Health
curl http://localhost:6002/health

# All services via Health Status UI
# Browser: http://localhost:6010
```

#### 7.1.2. Swagger UI

```
Product API:    http://localhost:6002/swagger
Customer API:   http://localhost:6003/swagger
Basket API:     http://localhost:6004/swagger
Ordering API:   http://localhost:6005/swagger
Inventory API:  http://localhost:6006/swagger
Payment API:    http://localhost:6007/swagger
Identity API:   http://localhost:6009/swagger
Ocelot Gateway: http://localhost:5000/swagger
```

### 7.2. Database Tools

#### 7.2.1. pgAdmin (PostgreSQL)

```
URL: http://localhost:5050
Email: admin@tedu-microservice.com
Password: admin1234

Connection:
  Host: nexusdb
  Port: 5432
  Username: admin
  Password: admin1234

Databases:
  - ProductDb
  - CustomerDb
  - OrderDb
  - InventoryDb
  - PaymentDb
  - IdentityDb
  - FlashSaleDb
  - GroupBuyDb
  - HangfireDb
```

#### 7.2.2. Redis Commander (Optional)

```powershell
# Chạy Redis Commander container
docker run -d --name redis-commander `
  --network viet_microservices `
  -p 8081:8081 `
  -e REDIS_HOSTS=basketdb:basketdb:6379 `
  rediscommander/redis-commander

# Access: http://localhost:8081
```

### 7.3. Logging với Elasticsearch & Kibana

#### 7.3.1. Truy Cập Kibana

```
URL: http://localhost:5601
```

#### 7.3.2. Tạo Index Pattern

1. Management → Stack Management → Index Patterns
2. Create index pattern: `applogs-*`
3. Time field: `@timestamp`
4. Save

#### 7.3.3. Xem Logs

1. Analytics → Discover
2. Select index pattern: `applogs-*`
3. Filter logs:
   - `fields.SourceContext: "Product.API"`
   - `level: "Error"`
   - `message: "exception"`

### 7.4. Portainer (Container Management)

```
URL: http://localhost:9000
Create admin account on first access

Features:
- View all containers
- Start/Stop/Restart containers
- View logs
- Exec into containers
- View resource usage
- Manage volumes
- Manage networks
```

---

## 8. Troubleshooting

### 8.1. Docker Issues

#### 8.1.1. Container Fails to Start

```powershell
# Xem logs chi tiết
docker-compose logs product.api

# Kiểm tra health
docker inspect product.api

# Restart container
docker-compose restart product.api
```

#### 8.1.2. Port Already in Use

```powershell
# Windows: Tìm process đang dùng port
netstat -ano | findstr :5000

# Kill process
taskkill /PID <process_id> /F

# Hoặc thay đổi port trong docker-compose.override.yml
```

#### 8.1.3. Out of Disk Space

```powershell
# Xóa unused containers
docker container prune -f

# Xóa unused images
docker image prune -a -f

# Xóa unused volumes
docker volume prune -f

# Xóa tất cả
docker system prune -a -f --volumes
```

### 8.2. Database Connection Issues

#### 8.2.1. Cannot Connect to PostgreSQL

```powershell
# Kiểm tra nexusdb container đang chạy
docker-compose ps nexusdb

# Xem logs
docker-compose logs nexusdb

# Test connection
docker-compose exec nexusdb psql -U admin -d ProductDb

# Kiểm tra connection string trong appsettings.json
```

#### 8.2.2. Database Migration Errors

```powershell
# Chạy migration thủ công
cd src/Services/Product.API
dotnet ef database update

# Hoặc drop database và tạo lại
docker-compose exec nexusdb psql -U admin -c "DROP DATABASE ProductDb;"
docker-compose exec nexusdb psql -U admin -c "CREATE DATABASE ProductDb;"
```

### 8.3. RabbitMQ Issues

#### 8.3.1. Messages Not Being Consumed

```powershell
# Kiểm tra RabbitMQ management UI
# http://localhost:15672

# Xem logs của consumer
docker-compose logs -f ordering.api

# Kiểm tra queue bindings
# RabbitMQ UI → Queues → basket-checkout-queue → Bindings
```

#### 8.3.2. Connection Refused

```powershell
# Kiểm tra RabbitMQ running
docker-compose ps rabbitmq

# Restart RabbitMQ
docker-compose restart rabbitmq

# Kiểm tra connection string
# EventBusSettings:HostAddress=amqp://guest:guest@rabbitmq:5672
```

### 8.4. API Gateway Issues

#### 8.4.1. 404 Not Found

```powershell
# Kiểm tra ocelot.json routing configuration
# src/APIGateWays/OcelotApiGw/ocelot.json

# Verify upstream services are running
docker-compose ps

# Check gateway logs
docker-compose logs -f ocelot.apigw
```

#### 8.4.2. CORS Errors

```csharp
// OcelotApiGw/Program.cs
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", builder =>
    {
        builder.AllowAnyOrigin()
               .AllowAnyMethod()
               .AllowAnyHeader();
    });
});

app.UseCors("AllowAll");
```

### 8.5. React Frontend Issues

#### 8.5.1. API Calls Failing

```typescript
// Kiểm tra .env.local
console.log(import.meta.env.VITE_API_GATEWAY_URL);

// Verify Ocelot Gateway is running
// http://localhost:5000/health

// Check browser console for CORS errors
```

#### 8.5.2. Build Errors

```powershell
# Clear node_modules và reinstall
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install

# Clear cache
npm cache clean --force

# Try different package manager
pnpm install
```

---

## 📚 Tài Liệu Tham Khảo

### Official Documentation

- [.NET 8 Documentation](https://learn.microsoft.com/en-us/dotnet/)
- [Docker Documentation](https://docs.docker.com/)
- [RabbitMQ Documentation](https://www.rabbitmq.com/documentation.html)
- [MassTransit Documentation](https://masstransit.io/)
- [Ocelot Documentation](https://ocelot.readthedocs.io/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)

### Project Files

- [Master Plan](./MASTER_PLAN.md)
- [Ocelot Configuration Guide](../src/APIGateWays/OcelotApiGw/CONFIGURATION_GUIDE.md)
- [README](../README.md)

---

## 🎯 Quick Start Commands

```powershell
# ============ INFRASTRUCTURE ============
cd d:\Git-Repo\Microservice\distributed-ecommerce-platform\src
docker-compose up -d nexusdb basketdb rabbitmq elasticsearch kibana

# ============ BACKEND (.NET) ============
docker-compose up -d product.api customer.api basket.api ordering.api

# ============ GATEWAY ============
docker-compose up -d ocelot.apigw

# ============ FRONTEND (React) ============
cd WebApps\React.Client
npm install
npm run dev

# ============ CHECK STATUS ============
docker-compose ps
curl http://localhost:5000/health
curl http://localhost:3000

# ============ VIEW LOGS ============
docker-compose logs -f

# ============ STOP ALL ============
docker-compose down
```

---

**Happy Coding! 🚀**
