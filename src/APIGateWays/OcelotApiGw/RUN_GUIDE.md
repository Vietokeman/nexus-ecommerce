# Hướng Dẫn Chạy Ocelot API Gateway

Tài liệu này hướng dẫn 2 cách chạy Ocelot API Gateway sau khi đã fix các lỗi QoS và ServiceDiscovery.

## ✅ Các Lỗi Đã Fix

1. **QoSOptions Error**: Đã thêm `Ocelot.Provider.Polly` package và đăng ký `services.AddPolly()`
2. **ServiceDiscoveryProvider Error**: Đã loại bỏ cấu hình ServiceDiscoveryProvider không cần thiết

---

## 🐳 OPTION 1: Chạy qua Docker (Khuyến nghị)

### Bước 1: Build và chạy tất cả services

```powershell
# Di chuyển đến thư mục src
cd d:\Git-Repo\Microservice\distributed-ecommerce-platform\src

# Build và start tất cả containers
docker-compose up --build -d
```

### Bước 2: Chỉ chạy Gateway và dependencies

Nếu chỉ muốn test Gateway:

```powershell
# Chạy infrastructure cần thiết
docker-compose up -d nexusdb basketdb rabbitmq elasticsearch

# Chạy các microservices
docker-compose up -d product.api customer.api basket.api ordering.api inventory.api payment.api identity.api flashsale.api groupbuy.api

# Chạy Gateway
docker-compose up -d ocelot.apigw
```

### Bước 3: Kiểm tra logs

```powershell
# Xem logs của Gateway
docker logs -f ocelot.apigw

# Kiểm tra Gateway đã chạy chưa
curl http://localhost:5000/api/products
```

### Bước 4: Dừng services

```powershell
# Dừng tất cả
docker-compose down

# Dừng và xóa volumes
docker-compose down -v
```

### URLs quan trọng (Docker)

- **API Gateway**: http://localhost:5000
- **Elasticsearch**: http://localhost:9200
- **Kibana**: http://localhost:5601
- **RabbitMQ Management**: http://localhost:15672 (guest/guest)
- **Portainer**: http://localhost:9000
- **PgAdmin**: http://localhost:5050

---

## 🎯 OPTION 2: Chạy qua Visual Studio

### Bước 1: Cài đặt dependencies qua Docker

Chạy infrastructure cần thiết trước:

```powershell
cd d:\Git-Repo\Microservice\distributed-ecommerce-platform\src

# Chỉ chạy infrastructure (DB, Cache, Message Queue, etc.)
docker-compose up -d nexusdb basketdb rabbitmq elasticsearch kibana
```

### Bước 2: Restore NuGet Packages

```powershell
# Di chuyển đến thư mục OcelotApiGw
cd d:\Git-Repo\Microservice\distributed-ecommerce-platform\src\APIGateWays\OcelotApiGw

# Restore packages
dotnet restore
```

### Bước 3: Chạy từ Visual Studio

**Cách 1: Sử dụng Visual Studio IDE**

1. Mở solution: `d:\Git-Repo\Microservice\distributed-ecommerce-platform\src\src.sln`
2. Click chuột phải vào project `OcelotApiGw` → **Set as Startup Project**
3. Nhấn **F5** hoặc click **Start**

**Cách 2: Sử dụng Command Line**

```powershell
cd d:\Git-Repo\Microservice\distributed-ecommerce-platform\src\APIGateWays\OcelotApiGw

# Chạy ở Development mode
dotnet run --environment Development
```

### Bước 4: Cấu hình Environment Variables (Nếu cần)

Tạo file `appsettings.Development.json` nếu chưa có:

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning",
      "Ocelot": "Debug"
    }
  },
  "ElasticConfiguration": {
    "Uri": "http://localhost:9200"
  }
}
```

### Bước 5: Kiểm tra ứng dụng

Gateway sẽ chạy trên: **http://localhost:5000** (hoặc port được configure trong launchSettings.json)

```powershell
# Test API
curl http://localhost:5000/api/products
```

### URLs quan trọng (Visual Studio Local)

- **API Gateway**: http://localhost:5000 hoặc https://localhost:7000
- **Elasticsearch**: http://localhost:9200
- **Kibana**: http://localhost:5601
- **RabbitMQ**: http://localhost:15672

---

## 🔧 Troubleshooting

### Lỗi: Port already in use

```powershell
# Tìm process đang dùng port 5000
netstat -ano | findstr :5000

# Kill process
taskkill /PID <PID> /F
```

### Lỗi: Cannot connect to Docker daemon

```powershell
# Khởi động Docker Desktop
# Hoặc start Docker service
net start com.docker.service
```

### Lỗi: Database connection failed

Đảm bảo PostgreSQL container đã chạy:

```powershell
docker ps | findstr nexusdb
```

### Lỗi: Elasticsearch connection failed

```powershell
# Kiểm tra Elasticsearch
docker logs elasticsearch

# Test connection
curl http://localhost:9200
```

---

## 📊 Monitoring và Logs

### View logs trong Docker

```powershell
# Real-time logs
docker logs -f ocelot.apigw

# Last 100 lines
docker logs --tail 100 ocelot.apigw
```

### View logs trong Visual Studio

Logs sẽ hiển thị trong **Output** window hoặc **Debug Console**

### View logs trong Kibana

1. Truy cập: http://localhost:5601
2. Tạo index pattern: `ocelot-gateway-logs-*`
3. View logs trong **Discover** tab

---

## 🚀 Performance Tips

1. **Cache**: Gateway đã được configure với CacheManager
2. **Rate Limiting**: Đã bật rate limiting cho các routes
3. **QoS**: Circuit breaker pattern đã được implement với Polly
4. **Load Balancing**: RoundRobin load balancer đã được configure

---

## 📝 Notes

- Khi chạy qua Visual Studio, cần chạy các microservices khác (Product.API, Customer.API, etc.) để Gateway có thể route requests
- Nên sử dụng Docker để chạy full system với tất cả microservices
- Visual Studio option phù hợp cho development và debugging Gateway riêng lẻ
