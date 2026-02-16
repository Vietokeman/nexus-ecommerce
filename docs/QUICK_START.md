# 🚀 QUICK START GUIDE - One Command Deployment

**Triển khai toàn bộ hệ thống microservices qua API Gateway duy nhất**

---

## 📌 Điểm Khác Biệt

### ❌ Cũ (Phải chạy từng service riêng lẻ):

```powershell
# Phải chạy 10+ services riêng lẻ
dotnet run --project Product.API      # Port 6002
dotnet run --project Customer.API     # Port 6003
dotnet run --project Basket.API       # Port 6004
dotnet run --project Ordering.API     # Port 6005
dotnet run --project Inventory.API    # Port 6006
# ... và còn nhiều nữa
```

### ✅ Mới (Chỉ cần API Gateway):

```powershell
# CHỈ 1 LỆNH DUY NHẤT
cd d:\Git-Repo\Microservice\distributed-ecommerce-platform\src
docker-compose up -d

# TẤT CẢ services chạy qua port 5000
http://localhost:5000/api/v1/products     # → Product.API
http://localhost:5000/api/v1/customers    # → Customer.API
http://localhost:5000/api/v1/baskets      # → Basket.API
http://localhost:5000/api/v1/orders       # → Ordering.API
# Tất cả đều qua Gateway port 5000
```

---

## 🎯 Single Command Deployment

### 1. Khởi Động Toàn Bộ Hệ Thống

```powershell
# Di chuyển vào thư mục chứa docker-compose.yml
cd d:\Git-Repo\Microservice\distributed-ecommerce-platform\src

# Khởi động TẤT CẢ services với 1 lệnh duy nhất
docker-compose up -d

# ✅ Hệ thống sẽ tự động:
# - Khởi động PostgreSQL, Redis, RabbitMQ
# - Build và start 10 microservices
# - Khởi động API Gateway (Ocelot)
# - Khởi động React Frontend
# - Seed data tự động
```

### 2. Kiểm Tra Trạng Thái

```powershell
# Xem tất cả containers đang chạy
docker-compose ps

# Kết quả mong đợi: TẤT CẢ services status "Up"
# NAME                STATE
# nexusdb             Up
# basketdb            Up
# rabbitmq            Up
# product.api         Up
# customer.api        Up
# basket.api          Up
# ordering.api        Up
# inventory.api       Up
# payment.api         Up
# identity.api        Up
# flashsale.api       Up
# groupbuy.api        Up
# hangfire.api        Up
# ocelot.apigw        Up  ← ⭐ MAIN ENTRY POINT
# react.client        Up
```

### 3. Truy Cập Ứng Dụng

```
✅ Frontend Application:
   http://localhost:3000

⭐ API Gateway (MAIN ENTRY POINT):
   http://localhost:5000
   http://localhost:5000/swagger

🏥 Health Check Dashboard:
   http://localhost:6010

📊 Management Tools:
   - RabbitMQ:      http://localhost:15672
   - Kibana:        http://localhost:5601
   - pgAdmin:       http://localhost:5050
   - Portainer:     http://localhost:9000
```

---

## 🌐 API Endpoints (Tất Cả Qua Gateway Port 5000)

### Product Management

```
GET    http://localhost:5000/api/v1/products
GET    http://localhost:5000/api/v1/products/{id}
POST   http://localhost:5000/api/v1/products
PUT    http://localhost:5000/api/v1/products/{id}
DELETE http://localhost:5000/api/v1/products/{id}
```

### Customer Management

```
GET    http://localhost:5000/api/v1/customers
GET    http://localhost:5000/api/v1/customers/{id}
POST   http://localhost:5000/api/v1/customers
PUT    http://localhost:5000/api/v1/customers/{id}
```

### Shopping Cart

```
GET    http://localhost:5000/api/v1/baskets/{username}
POST   http://localhost:5000/api/v1/baskets
PUT    http://localhost:5000/api/v1/baskets
DELETE http://localhost:5000/api/v1/baskets/{username}
POST   http://localhost:5000/api/v1/baskets/checkout
```

### Order Management

```
GET    http://localhost:5000/api/v1/orders/{username}
GET    http://localhost:5000/api/v1/orders/all
POST   http://localhost:5000/api/v1/orders
```

### Authentication

```
POST   http://localhost:5000/api/v1/identity/register
POST   http://localhost:5000/api/v1/identity/login
POST   http://localhost:5000/api/v1/identity/refresh-token
```

### Payment

```
POST   http://localhost:5000/api/v1/payments/create-payment-link
GET    http://localhost:5000/api/v1/payments/{orderId}
POST   http://localhost:5000/api/v1/payments/webhook
```

---

## 📦 Seed Data Tự Động

Khi khởi động lần đầu, hệ thống sẽ tự động seed data:

### Products (30+ sản phẩm)

- **Smartphones**: iPhone 9, Samsung Galaxy, OPPO F19, Huawei P30
- **Laptops**: MacBook Pro, Samsung Galaxy Book, Microsoft Surface, HP Pavilion
- **Fragrances**: Perfumes, Colognes
- **Skincare**: Tree Oil, Moisturizers
- **Groceries**: Strawberry, Orange Essence
- **Home Decoration**: Vases, Flowers
- **Fashion**: T-Shirts, Dresses
- **Footwear**: Sandals, Shoes
- **Accessories**: Watches, Sunglasses, Bags
- **Furniture**: Tables, Chairs

### Categories

```
smartphones, laptops, fragrances, skincare, groceries,
home-decoration, furniture, tops, womens-dresses,
womens-shoes, mens-shirts, mens-shoes, mens-watches,
womens-watches, womens-bags, womens-jewellery,
sunglasses, automotive, motorcycle, lighting
```

---

## 🔄 Development Workflow

### Xem Logs Real-Time

```powershell
# Xem logs tất cả services
docker-compose logs -f

# Xem logs của một service cụ thể
docker-compose logs -f product.api

# Xem logs của Gateway
docker-compose logs -f ocelot.apigw

# Xem logs của React frontend
docker-compose logs -f react.client
```

### Restart Services

```powershell
# Restart tất cả
docker-compose restart

# Restart một service cụ thể
docker-compose restart product.api

# Restart Gateway
docker-compose restart ocelot.apigw
```

### Update Code và Rebuild

```powershell
# Nếu bạn thay đổi code backend
docker-compose up -d --build product.api

# Rebuild tất cả
docker-compose up -d --build

# Rebuild toàn bộ không dùng cache
docker-compose build --no-cache
docker-compose up -d
```

---

## 🛑 Tắt Hệ Thống

### Dừng Tất Cả (Giữ data)

```powershell
docker-compose stop
```

### Dừng và Xóa Containers (Giữ data)

```powershell
docker-compose down
```

### Xóa Toàn Bộ (Bao gồm data)

```powershell
docker-compose down -v
```

---

## 🐛 Troubleshooting

### Lỗi: Port đã được sử dụng

```powershell
# Tìm process đang dùng port 5000
netstat -ano | findstr :5000

# Kill process
taskkill /PID <process_id> /F

# Hoặc thay đổi port trong docker-compose.override.yml
# Tìm dòng:
#   ports:
#     - "5000:80"
# Đổi thành:
#   ports:
#     - "5001:80"
```

### Lỗi: Service không start

```powershell
# Xem logs chi tiết
docker-compose logs product.api

# Restart service
docker-compose restart product.api

# Rebuild nếu cần
docker-compose up -d --build product.api
```

### Lỗi: Database connection

```powershell
# Kiểm tra nexusdb đang chạy
docker-compose ps nexusdb

# Restart database
docker-compose restart nexusdb

# Xem logs database
docker-compose logs nexusdb
```

### Reset Toàn Bộ Hệ Thống

```powershell
# Dừng và xóa tất cả (bao gồm volumes)
docker-compose down -v

# Xóa unused Docker resources
docker system prune -a -f

# Start lại từ đầu
docker-compose up -d --build
```

---

## 📊 Kiểm Tra Khởi Động Thành Công

### 1. Check All Containers Running

```powershell
docker-compose ps
# Tất cả phải có status "Up"
```

### 2. Check Gateway Health

```powershell
curl http://localhost:5000/health
# Kết quả: {"status": "Healthy"}
```

### 3. Check Product API

```powershell
curl http://localhost:5000/api/v1/products
# Kết quả: JSON array với danh sách products
```

### 4. Check Frontend

```powershell
# Mở browser: http://localhost:3000
# Phải thấy trang login/home
```

---

## 🎨 Frontend Development (React)

### Khởi Động Development Mode

```powershell
# Di chuyển vào thư mục React client
cd d:\Git-Repo\Microservice\distributed-ecommerce-platform\src\WebApps\React.Client

# Cài đặt dependencies (lần đầu)
npm install

# Chạy dev server
npm run dev

# Frontend sẽ chạy tại: http://localhost:3000
# Tất cả API calls sẽ đi qua Gateway: http://localhost:5000
```

### Environment Configuration

File `.env.local`:

```env
VITE_API_GATEWAY_URL=http://localhost:5000
VITE_APP_NAME=E-Commerce Platform
```

---

## 📝 Workflow Khuyến Nghị

### Cho Development

1. **Start Backend**:

   ```powershell
   cd d:\Git-Repo\Microservice\distributed-ecommerce-platform\src
   docker-compose up -d
   ```

2. **Start Frontend (Dev Mode)**:

   ```powershell
   cd WebApps\React.Client
   npm run dev
   ```

3. **Develop**:
   - Frontend: Edit code → Auto reload
   - Backend: Edit code → `docker-compose up -d --build <service>`

4. **Stop**:
   ```powershell
   docker-compose stop
   ```

### Cho Production

```powershell
# Build và start tất cả
docker-compose up -d --build

# Access qua nginx reverse proxy hoặc domain
# Frontend: https://yourdomain.com
# API: https://api.yourdomain.com
```

---

## 🎯 Key Points

1. **⭐ QUAN TRỌNG**: TẤT CẢ API endpoints phải đi qua port **5000** (Gateway)
2. **❌ KHÔNG** truy cập trực tiếp vào ports của microservices (đã bị comment out)
3. **✅ SỬ DỤNG**: `http://localhost:5000/api/v1/...` cho mọi API calls
4. Frontend tự động gọi API qua Gateway (đã config trong `.env.local`)
5. Chỉ cần **`docker-compose up -d`** là đủ để chạy toàn bộ hệ thống

---

## 📞 Support

- **Documentation**: [docs/DEPLOYMENT_GUIDE_VI.md](./DEPLOYMENT_GUIDE_VI.md)
- **Master Plan**: [docs/MASTER_PLAN.md](./docs/MASTER_PLAN.md)
- **Ocelot Config**: [src/APIGateWays/OcelotApiGw/CONFIGURATION_GUIDE.md](../src/APIGateWays/OcelotApiGw/CONFIGURATION_GUIDE.md)

---

**Happy Coding! 🚀**

_Hệ thống đã được cấu hình để chạy hoàn toàn qua API Gateway. Không cần chạy từng service riêng lẻ nữa!_
