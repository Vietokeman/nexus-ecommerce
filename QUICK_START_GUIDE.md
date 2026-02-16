# 🚀 Quick Start - Development Guide

## ⚡ Cách Chạy Nhanh Nhất

### Option 1: Dùng Script Helper (Khuyến nghị)

```powershell
cd d:\Git-Repo\Microservice\distributed-ecommerce-platform
.\docker-helper.ps1
```

Menu sẽ hiện ra, chọn:
- **1** → Start All (lần đầu sẽ pull images)
- **4** → Xem trạng thái containers
- **5** → Xem logs tất cả services
- **2** → Dừng tất cả

### Option 2: Dùng Run Script

```powershell
cd d:\Git-Repo\Microservice\distributed-ecommerce-platform
.\run-gateway.ps1 -Mode docker
```

### Option 3: Dùng Docker Compose trực tiếp

```powershell
# QUAN TRỌNG: Phải CD vào thư mục src trước!
cd d:\Git-Repo\Microservice\distributed-ecommerce-platform\src

# Start all
docker compose up -d

# View status
docker compose ps

# View logs
docker compose logs -f

# Stop all
docker compose down
```

---

## 🔥 LƯU Ý QUAN TRỌNG

### ❌ KHÔNG chạy như thế này:

```powershell
C:\Users\ADMIN> docker compose ps
# ❌ Lỗi: no configuration file provided: not found
```

### ✅ PHẢI chạy từ thư mục src:

```powershell
cd d:\Git-Repo\Microservice\distributed-ecommerce-platform\src
docker compose ps
# ✅ OK!
```

**Lý do:** Docker Compose cần file `docker-compose.yml` và `docker-compose.override.yml` trong thư mục hiện tại.

---

## 📁 Cấu Trúc Thư Mục

```
d:\Git-Repo\Microservice\distributed-ecommerce-platform\
│
├── run-gateway.ps1           ← Script launcher (chạy từ đây)
├── docker-helper.ps1         ← Quick commands menu (chạy từ đây)
│
└── src\
    ├── docker-compose.yml         ← File config chính
    ├── docker-compose.override.yml ← Dev mode config
    │
    ├── Services\                  ← Backend APIs
    │   ├── Product.API\
    │   ├── Customer.API\
    │   └── ...
    │
    ├── APIGateWays\               ← API Gateway
    │   └── OcelotApiGw\
    │
    └── WebApps\                   ← Frontend
        └── React.Client\
```

---

## 🌐 URLs Sau Khi Chạy

| Service | URL | Ghi chú |
|---------|-----|---------|
| **React Frontend** | http://localhost:3000 | Main UI |
| **API Gateway** | http://localhost:5000 | Backend entry point |
| **Health Dashboard** | http://localhost:6010 | Service health |
| RabbitMQ UI | http://localhost:15672 | guest/guest |
| Kibana | http://localhost:5601 | Logs viewer |
| Elasticsearch | http://localhost:9200 | Search engine |
| PgAdmin | http://localhost:5050 | DB admin |
| Portainer | http://localhost:9000 | Docker UI |
| PostgreSQL | localhost:5433 | Database |
| Redis | localhost:6379 | Cache |

---

## 🐳 Các Lệnh Thường Dùng

**LUÔN luôn CD trước:**
```powershell
cd d:\Git-Repo\Microservice\distributed-ecommerce-platform\src
```

### Start/Stop

```powershell
# Start tất cả
docker compose up -d

# Start services cụ thể
docker compose up -d nexusdb basketdb rabbitmq
docker compose up -d product.api customer.api
docker compose up -d ocelot.apigw react.client

# Stop tất cả
docker compose down

# Stop nhưng GIỮ data
docker compose stop

# Restart tất cả
docker compose restart

# Restart 1 service
docker compose restart product.api
```

### View Status & Logs

```powershell
# Xem containers đang chạy
docker compose ps

# Xem tất cả (kể cả stopped)
docker compose ps -a

# Xem logs tất cả (realtime)
docker compose logs -f

# Xem logs 1 service
docker compose logs -f product.api
docker compose logs -f react.client
docker compose logs -f ocelot.apigw

# Xem logs với filter
docker compose logs -f --tail 100 product.api
docker compose logs -f --since 5m
```

### Shell vào Container

```powershell
# Shell vào .NET service
docker compose exec product.api sh

# Shell vào React
docker compose exec react.client sh

# Shell vào Database
docker compose exec nexusdb psql -U admin -d NexusDb
```

### Run Commands trong Container

```powershell
# Run migration
docker compose exec product.api dotnet ef database update
docker compose exec ordering.api dotnet ef database update

# Check .NET version
docker compose exec product.api dotnet --version

# Check npm packages
docker compose exec react.client npm list

# Rebuild .NET project
docker compose exec product.api dotnet build
```

### Rebuild & Clean

```powershell
# Rebuild tất cả
docker compose up -d --build

# Rebuild 1 service
docker compose up -d --build product.api

# Clean tất cả (XÓA DATA!)
docker compose down -v

# Remove orphaned containers
docker compose down --remove-orphans
```

---

## ⚡ Hot Reload

**Backend (.cs, .json files):**
```
Sửa file → Save → dotnet watch tự detect → Rebuild (5-10s) → đợi xong test API
```

**Frontend (.tsx, .ts, .css):**
```
Sửa file → Save → Vite HMR → Browser cập nhật ngay (<1s) ✨
```

**Test:**
1. Mở http://localhost:3000
2. Sửa `src/WebApps/React.Client/src/App.tsx`
3. Save → Browser tự động update!

---

## 🐛 Troubleshooting

### Containers không start

```powershell
# Xem logs để biết lỗi
cd d:\Git-Repo\Microservice\distributed-ecommerce-platform\src
docker compose logs

# Xem logs chi tiết 1 service
docker compose logs product.api
docker compose logs ocelot.apigw
```

### Port đã được sử dụng

```powershell
# Tìm process đang dùng port
netstat -ano | findstr "5000"
netstat -ano | findstr "3000"

# Kill process
taskkill /PID <PID> /F

# Hoặc stop containers cũ
docker compose down
```

### Pull images lỗi

```powershell
# Đổi DNS
Set-DnsClientServerAddress -InterfaceAlias "Ethernet" -ServerAddresses ("8.8.8.8","8.8.4.4")

# Retry
docker compose pull
docker compose up -d
```

Xem thêm: [DOCKER_NETWORK_FIX.md](DOCKER_NETWORK_FIX.md)

### Database connection failed

```powershell
# Check DB container
docker compose ps nexusdb
docker compose logs nexusdb

# Restart DB
docker compose restart nexusdb

# Run migrations
docker compose exec product.api dotnet ef database update
```

### React không load

```powershell
# Check logs
docker compose logs react.client

# Restart
docker compose restart react.client

# Xem npm install progress
docker compose exec react.client sh
npm list
```

---

## 📦 Lần Đầu Chạy

**Bước 1: Pull images**
```powershell
cd d:\Git-Repo\Microservice\distributed-ecommerce-platform\src
docker compose pull
```

**Bước 2: Start infrastructure**
```powershell
docker compose up -d nexusdb basketdb rabbitmq elasticsearch kibana
```

**Bước 3: Đợi DB khởi động (20-30s)**
```powershell
docker compose logs -f nexusdb
# Đợi thấy "database system is ready to accept connections"
```

**Bước 4: Start services**
```powershell
docker compose up -d
```

**Bước 5: Run migrations** (nếu cần)
```powershell
docker compose exec product.api dotnet ef database update
docker compose exec customer.api dotnet ef database update
docker compose exec ordering.api dotnet ef database update
docker compose exec payment.api dotnet ef database update
docker compose exec identity.api dotnet ef database update
docker compose exec flashsale.api dotnet ef database update
docker compose exec groupbuy.api dotnet ef database update
docker compose exec hangfire.api dotnet ef database update
```

**Bước 6: Kiểm tra**
```powershell
docker compose ps
# Tất cả phải "Up" hoặc "Up (healthy)"
```

**Bước 7: Test**
- Frontend: http://localhost:3000
- API Gateway: http://localhost:5000/api/products
- Health: http://localhost:6010

---

## 🎯 Development Workflow

### Khi code Backend (.NET)

```powershell
# 1. Start services
cd d:\Git-Repo\Microservice\distributed-ecommerce-platform\src
docker compose up -d

# 2. Sửa code (VD: Product.API/Controllers/ProductsController.cs)

# 3. Đợi dotnet watch rebuild (xem logs)
docker compose logs -f product.api

# 4. Test API
curl http://localhost:5000/api/products

# 5. Nếu cần debug detail
docker compose exec product.api sh
dotnet build
dotnet test
```

### Khi code Frontend (React)

```powershell
# 1. Start services
docker compose up -d

# 2. Mở browser: http://localhost:3000

# 3. Sửa code (VD: React.Client/src/App.tsx)

# 4. Browser tự động update (Vite HMR)

# 5. Nếu cần check logs
docker compose logs -f react.client
```

### Khi sửa Gateway config

```powershell
# 1. Sửa file: APIGateWays/OcelotApiGw/ocelot.json

# 2. Gateway tự reload config
docker compose logs -f ocelot.apigw

# 3. Test routing
curl http://localhost:5000/api/products
```

---

## 💾 Backup & Clean

### Backup data

```powershell
# Export database
docker compose exec nexusdb pg_dump -U admin NexusDb > backup.sql

# Backup volumes
docker run --rm -v nexusdb_data:/data -v ${PWD}:/backup alpine tar czf /backup/nexusdb_backup.tar.gz -C /data .
```

### Clean everything

```powershell
# Stop và xóa containers + volumes
docker compose down -v

# Xóa images cũ
docker image prune -a

# Xóa toàn bộ Docker cache
docker system prune -a --volumes
```

---

## 📚 Tài Liệu Liên Quan

- [TEAM_DEVELOPMENT_GUIDE.md](TEAM_DEVELOPMENT_GUIDE.md) - Best practices cho team
- [DOCKER_NETWORK_FIX.md](DOCKER_NETWORK_FIX.md) - Fix lỗi network
- [OCELOT_FIX_README.md](OCELOT_FIX_README.md) - Gateway setup
- [RUN_GUIDE.md](src/APIGateWays/OcelotApiGw/RUN_GUIDE.md) - Chi tiết Gateway

---

## 🆘 Cần Trợ Giúp?

**Quick commands:**
```powershell
.\docker-helper.ps1    # Interactive menu
.\run-gateway.ps1      # Auto launcher
```

**Check services:**
```powershell
cd src
docker compose ps      # Status
docker compose logs    # All logs
```

**Reset everything:**
```powershell
docker compose down -v
docker compose up -d
```

---

Generated: 2026-02-16
