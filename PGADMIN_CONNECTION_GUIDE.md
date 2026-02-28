# 📋 Hướng dẫn kết nối Database với pgAdmin

## 1. Truy cập pgAdmin

| Thông tin       | Giá trị                          |
|-----------------|----------------------------------|
| **URL**         | http://localhost:5050             |
| **Email**       | `admin@nexus.io`                 |
| **Password**    | `admin123`                       |

> Mở trình duyệt và truy cập http://localhost:5050, đăng nhập bằng thông tin trên.

---

## 2. Tạo Server Connection

1. **Click chuột phải** vào `Servers` → `Register` → `Server...`
2. Tab **General**:
   - **Name**: `Nexus PostgreSQL` (hoặc tên bất kỳ)
3. Tab **Connection**:

| Field              | Giá trị             |
|--------------------|----------------------|
| **Host name**      | `host.docker.internal` |
| **Port**           | `5433`               |
| **Username**       | `admin`              |
| **Password**       | `change_me_with_postgres_password`     |
| **Save password?** | ✅ Yes               |

> **Lưu ý**: Nếu `host.docker.internal` không hoạt động (Linux), dùng IP của máy host hoặc `172.17.0.1`.
>
> Nếu bạn chạy pgAdmin **ngoài Docker** (cài trực tiếp trên máy), dùng `localhost` thay vì `host.docker.internal`.

4. Click **Save** → Server sẽ hiện trong sidebar.

---

## 3. Danh sách toàn bộ Databases (10 databases)

| #  | Database Name   | Service         | Mô tả                                    | Seed Data           |
|----|-----------------|-----------------|-------------------------------------------|---------------------|
| 1  | `ProductDb`     | Product API     | Sản phẩm (CatalogProducts)               | 62 sản phẩm         |
| 2  | `CustomerDb`    | Customer API    | Khách hàng                                | 11 khách hàng       |
| 3  | `OrderDb`       | Ordering API    | Đơn hàng                                  | 10 đơn hàng         |
| 4  | `IdentityDb`    | Identity API    | Users, Roles, Permissions (ASP.NET Identity) | 10 users          |
| 5  | `InventoryDb`   | Inventory API   | Kho hàng, tồn kho                        | 3 kho, 77 stocks    |
| 6  | `PaymentDb`     | Payment API     | Giao dịch thanh toán (PayOS)              | 0 (runtime data)    |
| 7  | `FlashSaleDb`   | FlashSale API   | Flash sale sessions & items               | 0 (runtime data)    |
| 8  | `GroupBuyDb`    | GroupBuy API    | Mua chung campaigns & sessions            | 0 (runtime data)    |
| 9  | `HangfireDb`    | Hangfire API    | Background jobs                           | 0 (auto-created)    |
| 10 | `NexusDb`       | (default)       | Database mặc định PostgreSQL              | —                   |

---

## 4. Thông tin kết nối chung

```
Host:     localhost (hoặc host.docker.internal từ Docker)
Port:     5433
Username: admin
Password: change_me_with_postgres_password
```

### Connection String mẫu (.NET):
```
Server=localhost;Port=5433;Database=ProductDb;User Id=admin;Password=change_me_with_postgres_password;
```

### Connection String mẫu (URI):
```
postgresql://admin:change_me_with_postgres_password@localhost:5433/ProductDb
```

---

## 5. Các công cụ quản lý khác

| Tool          | URL                    | Credentials             |
|---------------|------------------------|-------------------------|
| **pgAdmin**   | http://localhost:5050   | admin@nexus.io / admin123 |
| **Portainer** | http://localhost:9000   | (tự tạo khi truy cập lần đầu) |
| **RabbitMQ**  | http://localhost:15672  | guest / guest           |
| **Kibana**    | http://localhost:5601   | —                       |
| **Swagger**   | http://localhost:5000/swagger | — (API Gateway)    |

---

## 6. Xem database trong pgAdmin

Sau khi kết nối thành công:

1. Mở `Servers` → `Nexus PostgreSQL` → `Databases`
2. Chọn database cần xem (ví dụ: `ProductDb`)
3. Mở `Schemas` → `public` → `Tables`
4. Click chuột phải vào table → `View/Edit Data` → `All Rows`

### Bảng chính trong từng database:

| Database       | Bảng chính                                              |
|----------------|--------------------------------------------------------|
| `ProductDb`    | `CatalogProducts`                                      |
| `CustomerDb`   | `Customers`                                            |
| `OrderDb`      | `Orders`                                               |
| `IdentityDb`   | `Users`, `AspNetRoles`, `AspNetUserRoles`, `Permissions` |
| `InventoryDb`  | `Warehouses`, `WarehouseStocks`, `InventoryEntries`    |
| `PaymentDb`    | `PaymentTransactions`                                  |
| `FlashSaleDb`  | `FlashSaleSessions`, `FlashSaleItems`, `FlashSaleOrders` |
| `GroupBuyDb`   | `GroupBuyCampaigns`, `GroupBuySessions`, `GroupBuyParticipants` |
| `HangfireDb`   | (Hangfire tự tạo tables khi có job)                    |
