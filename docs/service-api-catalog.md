# Service API Catalog

Date: 2026-03-22

Tai lieu nay tong hop endpoint theo tung service trong he thong, kem mo ta endpoint dung de lam gi.

## 1) Admin.API

Base route: /api/admin

### UserController (route: /api/admin/user)

- GET /api/admin/user/{id:guid}
  - Lay thong tin user theo id.
- GET /api/admin/user/paging
  - Lay danh sach user co phan trang, filter, sort.
- POST /api/admin/user
  - Tao user moi.
- PUT /api/admin/user/{id:guid}
  - Cap nhat thong tin user.
- DELETE /api/admin/user
  - Xoa nhieu user theo request batch.
- POST /api/admin/user/password-change-current-user
  - Doi mat khau cua user hien tai.
- POST /api/admin/user/set-password/{id:guid}
  - Dat/reset mat khau cho user theo id.
- POST /api/admin/user/change-email/{id:guid}
  - Doi email cua user.
- PUT /api/admin/user/{id}/assign-users
  - Gan role cho user.

### RoleController (route: /api/admin/role)

- POST /api/admin/role
  - Tao role moi.
- PUT /api/admin/role/{id:guid}
  - Cap nhat role.
- DELETE /api/admin/role
  - Xoa nhieu role.
- GET /api/admin/role/{id:guid}
  - Lay role theo id.
- GET /api/admin/role/paging
  - Lay danh sach role phan trang.
- GET /api/admin/role/all
  - Lay tat ca role.

### Scope note (2026-03-22 update)

- Admin.API da loai bo toan bo domain content editor (post, post-category, series).
- Admin shell hien chi tap trung cho domain van hanh: user, role, notification, media, audit logs.

### NotificationController (route: /api/admin/notifications)

- GET /api/admin/notifications
  - Lay danh sach notification (paging/filter).
- GET /api/admin/notifications/unread-count
  - Lay so luong notification chua doc.
- POST /api/admin/notifications/{id:guid}/mark-as-read
  - Danh dau mot notification da doc.
- POST /api/admin/notifications/mark-all-as-read
  - Danh dau tat ca notification da doc.
- POST /api/admin/notifications/publish
  - Tao/phat hanh notification moi.

### MediaController (route: /api/admin/media)

- POST /api/admin/media
  - Upload media (anh), co type qua query string.

### AuditLogsController (route: /api/admin/audit-logs)

- GET /api/admin/audit-logs
  - Tim kiem/loc audit logs theo keyword, ngay, paging.

### Internal

- GET /health
  - Health check.
- WS /hubs/notifications
  - SignalR hub cho thong bao real-time.

---

## 2) Identity.API

### AuthController (route: /api/auth)

- POST /api/auth/register
  - Dang ky tai khoan moi.
- POST /api/auth/login
  - Dang nhap bang email/password.
- POST /api/auth/refresh-token
  - Lam moi access token.
- GET /api/auth/confirm-email
  - Xac nhan email qua userId + token.
- POST /api/auth/forgot-password
  - Gui email reset mat khau.
- POST /api/auth/reset-password
  - Dat lai mat khau.
- GET /api/auth/me
  - Lay thong tin user hien tai theo bearer token.

### ExternalAuthController (route: /api/auth)

- GET /api/auth/external-login
  - Bat dau luong OAuth (Google/GitHub).
- GET /api/auth/external-login-callback
  - Nhan callback OAuth, tao/login user, redirect ve FE kem token.
- GET /api/auth/external-providers
  - Lay danh sach provider OAuth dang duoc cau hinh.

### UserController (route: /api/user, admin role)

- GET /api/user
  - Lay tat ca user.
- GET /api/user/{id}
  - Lay user theo id.
- DELETE /api/user/{id}
  - Xoa user.

### PermissionController (route: /api/permission, admin role)

- GET /api/permission
  - Lay danh sach permission.
- GET /api/permission/{roleId}
  - Lay permission theo role.
- POST /api/permission
  - Tao permission moi.
- DELETE /api/permission/{id:int}
  - Xoa permission.

### Internal

- GET /health
  - Health check.

---

## 3) Product.API

Base route: /api/products

- GET /api/products
  - Lay tat ca san pham.
- GET /api/products/{id}
  - Lay chi tiet san pham theo id.
- POST /api/products
  - Tao san pham moi.
- PUT /api/products/{id:long}
  - Cap nhat san pham.
- DELETE /api/products/{id}
  - Xoa san pham.
- GET /api/products/search/{productNo}
  - Tim san pham theo ma/no.

### Internal

- GET /health
  - Health check.

---

## 4) Seller.API

### SellerProductsController (route: /api/sellerproducts)

- GET /api/sellerproducts
  - Lay danh sach san pham seller (active storefront).
- GET /api/sellerproducts/{id:long}
  - Lay chi tiet 1 san pham seller.
- GET /api/sellerproducts/by-seller/{sellerUserName}
  - Lay san pham theo seller username.
- GET /api/sellerproducts/by-category/{category}
  - Lay san pham theo category.
- POST /api/sellerproducts/preview-ai
  - Preview noi dung AI cho san pham truoc khi tao.
- POST /api/sellerproducts
  - Tao san pham (co the dung AI generation).
- PUT /api/sellerproducts/{id:long}
  - Cap nhat san pham.
- DELETE /api/sellerproducts/{id:long}
  - Xoa san pham.
- GET /api/sellerproducts/dashboard/{sellerUserName}
  - Lay tong quan dashboard seller (products, reviews, rating, doanh thu uoc tinh).

### ReviewsController (route: /api/reviews)

- GET /api/reviews/product/{productId:long}
  - Lay reviews cua mot san pham.
- GET /api/reviews/product/{productId:long}/summary
  - Lay tong hop rating/review distribution.
- GET /api/reviews/user/{userName}
  - Lay reviews cua user.
- POST /api/reviews
  - Tao review moi cho san pham.
- POST /api/reviews/{reviewId:long}/reply
  - Seller reply vao review.

### Internal

- GET /health
  - Health check.

---

## 5) Basket.API

Base route: /api/baskets

- GET /api/baskets/{username}
  - Lay gio hang theo username.
- POST /api/baskets
  - Tao/cap nhat gio hang.
- DELETE /api/baskets/{username}
  - Xoa gio hang cua user.
- POST /api/baskets/checkout
  - Checkout gio hang: validate ton kho qua gRPC, publish event checkout, xoa basket.
- GET /api/baskets/stock/{itemNo}
  - Check ton kho theo itemNo qua gRPC Inventory.

### Internal

- GET /health
  - Health check.

---

## 6) Customer.API

(duoc map theo Minimal API trong CustomerController.MapCustomerEndpoints)

- GET /
  - Welcome endpoint don gian.
- GET /api/customers
  - Lay tat ca customer.
- GET /api/customer/{username}
  - Lay customer theo username.
- POST /api/customer
  - Tao customer moi.
- DELETE /api/customer?id={id}
  - Xoa customer theo id (query param).

### Internal

- GET /health
  - Health check.

---

## 7) Ordering.API

Base route: /api/v1/orders

- GET /api/v1/orders
  - Lay danh sach orders (phan trang/filters qua query).
- GET /api/v1/orders/{userName}
  - Lay orders theo username.
- POST /api/v1/orders
  - Tao order moi qua CQRS command.
- PUT /api/v1/orders/{id}
  - Cap nhat order.
- DELETE /api/v1/orders/{id}
  - Xoa order.

### Test endpoints

- POST /api/v1/orders/publish
  - Test publish message/event tu order.
- GET /api/v1/orders/test-transmit
  - Test publish/consume RabbitMQ truc tiep.

### Internal

- GET /health
  - Health check.

---

## 8) Payment.API

Base route: /api/payment

- POST /api/payment/create
  - Tao payment link (PayOS) cho order.
- GET /api/payment/{orderNo}/status
  - Lay trang thai thanh toan theo orderNo.
- GET /api/payment/code/{orderCode:long}/status
  - Lay trang thai thanh toan theo PayOS order code.
- POST /api/payment/payos-callback
  - Webhook callback tu PayOS de cap nhat transaction status.
- POST /api/payment/cancel/{orderNo}
  - Huy thanh toan dang pending.
- GET /api/payment/user/{userId}
  - Lay lich su thanh toan cua user.

### Internal

- GET /health
  - Health check.

---

## 9) Inventory.Product.API

Base route: /api/inventory

- GET /api/inventory
  - Lay danh sach inventory entries co phan trang.
- GET /api/inventory/{id}
  - Lay inventory entry theo id.
- GET /api/inventory/items/{itemNo}
  - Lay entries theo itemNo.
- GET /api/inventory/documents/{documentNo}
  - Lay entries theo documentNo.
- GET /api/inventory/stock/{itemNo}
  - Lay ton kho hien tai cua 1 item.
- POST /api/inventory/stock/batch
  - Lay ton kho cho nhieu item.
- POST /api/inventory/purchase-orders
  - Tao purchase order (cong ton kho).
- POST /api/inventory/sales-orders
  - Tao sales order (tru ton kho + validate).
- POST /api/inventory
  - Tao custom inventory entry.
- DELETE /api/inventory/{id}
  - Xoa inventory entry theo id.

### gRPC

- StockGrpcService
  - Endpoint gRPC phuc vu check stock cho Basket/API khac.

### Internal

- GET /health
  - Health check.

---

## 10) FlashSale.API

Base route: /api/flashsales

- GET /api/flashsales/sessions
  - Lay tat ca flash sale sessions.
- GET /api/flashsales/sessions/active
  - Lay cac session dang active.
- GET /api/flashsales/sessions/{id:long}
  - Lay chi tiet session.
- POST /api/flashsales/sessions
  - Tao flash sale session moi.
- POST /api/flashsales/sessions/{id:long}/activate
  - Activate session, preload stock vao Redis.
- POST /api/flashsales/sessions/{id:long}/end
  - End session, sync stock Redis ve DB.
- POST /api/flashsales/purchase
  - Dat mua item flash sale (atomic deduction qua Redis/Lua).
- GET /api/flashsales/items/{itemId:long}/stock
  - Lay remaining stock cua item.
- GET /api/flashsales/orders/{userName}
  - Lay lich su don flash sale theo user.

### Internal

- GET /health
  - Health check.

---

## 11) GroupBuy.API

Base route: /api/groupbuys

- GET /api/groupbuys/campaigns
  - Lay tat ca group buy campaigns.
- GET /api/groupbuys/campaigns/active
  - Lay campaigns dang active.
- GET /api/groupbuys/campaigns/{id:long}
  - Lay campaign theo id.
- POST /api/groupbuys/campaigns
  - Tao campaign moi.
- POST /api/groupbuys/sessions/open
  - Mo session group buy moi (leader).
- POST /api/groupbuys/sessions/join
  - Tham gia session bang invite code.
- GET /api/groupbuys/sessions/invite/{inviteCode}
  - Lay thong tin session theo invite code.
- POST /api/groupbuys/sessions/process-expired
  - Xu ly session het han (thuong goi boi scheduler/Hangfire).

### Internal

- GET /health
  - Health check.

---

## 12) Nexus.AI.Service

### AiChatController (route: /api/ai/chat)

- POST /api/ai/chat/sessions
  - Tao/tiep tuc phien hoi thoai AI.
- GET /api/ai/chat/sessions/{sessionId:guid}
  - Lay thong tin/lich su 1 phien chat.

### AiAdminController (route: /api/ai/admin)

- POST /api/ai/admin/sync/products
  - Dong bo product catalog vao vector index.
- GET /api/ai/admin/search?query=...&topK=...
  - Tim kiem vector semantic products.

### Internal

- GET /health
  - Health check.

---

## 13) Hangfire.API

### Operational endpoints

- GET /hangfire
  - Dashboard quan tri background jobs.
- GET /health
  - Health check cho hangfire server.

### Luu y

- Service nay chu yeu thuc thi recurring jobs (abandoned cart reminder, cleanup), khong expose bo business REST API nhu cac service khac.

---

## 14) Quick note for Gateway mapping

- Tat ca endpoint tren duoc expose thong qua Ocelot gateway (route config trong APIGateWays/OcelotApiGw/ocelot.json).
- Khi test end-to-end tu frontend, uu tien goi qua host gateway thay vi goi thang service.
