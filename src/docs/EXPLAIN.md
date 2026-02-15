# EXPLAIN — Sections 8, 10, 12, 13: Architecture Deep-Dive

> **Document purpose**: Giải thích chi tiết flow hoạt động, lý do thiết kế, và cách các section liên kết với nhau trong kiến trúc microservices e-commerce platform.

---

## Table of Contents

1. [Section 8 — Payment Service (PayOS Integration)](#section-8--payment-service-payos-integration)
2. [Section 10 — React SPA Client](#section-10--react-spa-client)
3. [Section 12 — Docker Containerization & Deployment](#section-12--docker-containerization--deployment)
4. [Section 13 — Event-Driven Communication](#section-13--event-driven-communication)
5. [End-to-End Flow Walkthrough](#end-to-end-flow-walkthrough)
6. [Architecture Decision Records](#architecture-decision-records)

---

## Section 8 — Payment Service (PayOS Integration)

### 8.1 Tổng quan

Payment.API là microservice xử lý thanh toán, tích hợp **PayOS** — cổng thanh toán hỗ trợ chuyển khoản ngân hàng và QR Code tại Việt Nam.

### 8.2 Flow thanh toán chi tiết

```
┌──────────┐    ┌──────────────┐    ┌──────────────┐    ┌─────────┐
│  React   │───▶│  Ocelot GW   │───▶│ Payment.API  │───▶│  PayOS  │
│  Client  │    │  (:5000)     │    │  (:6007)     │    │  SDK    │
└──────────┘    └──────────────┘    └──────────────┘    └─────────┘
     │                                     │                  │
     │                                     ▼                  │
     │                              ┌──────────────┐          │
     │                              │   SQL Server  │          │
     │                              │  PaymentDb   │          │
     │                              └──────────────┘          │
     │                                     │                  │
     │◀────── redirect to paymentUrl ──────┘                  │
     │                                                        │
     │──────── user pays via bank/QR ────────────────────────▶│
     │                                                        │
     │                              ┌──────────────┐          │
     │                              │  Webhook POST │◀─────────┘
     │                              │  /payos-callback│
     │                              └──────┬───────┘
     │                                     │
     │                              ┌──────▼───────┐
     │                              │  Verify sig  │
     │                              │  Update DB   │
     │                              │  Publish evt │
     │                              └──────────────┘
```

**Step-by-step**:

1. **User clicks "Pay with PayOS"** → React gửi `POST /api/payments` qua Ocelot Gateway
2. **Payment.API nhận request** → Validate input, tạo `PaymentTransaction` (status=Pending) lưu vào SQL Server
3. **Gọi PayOS SDK** → `_payOS.createPaymentLink(paymentData)` với:
   - `orderCode`: unique long từ `DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()` (đảm bảo không trùng)
   - `amount`: số tiền VND (PayOS chỉ nhận VND)
   - `description`: truncate 25 ký tự (giới hạn PayOS API)
   - `items`: danh sách sản phẩm
   - `returnUrl` / `cancelUrl`: redirect URLs sau khi thanh toán
4. **PayOS trả về `paymentUrl`** → Payment.API lưu URL vào DB, trả về cho client
5. **Client redirect** → User thấy trang thanh toán PayOS (QR code / bank transfer)
6. **User thanh toán xong** → PayOS gọi webhook `POST /api/payments/payos-callback`
7. **Webhook handler**:
   - Verify chữ ký bằng `_payOS.verifyPaymentWebhookData(webhookBody)` (checksumKey)
   - Nếu valid → Update status = Paid, lưu PaidAt + PaymentMethod
   - **Publish `PaymentCompletedEvent`** qua RabbitMQ (MassTransit)
   - Luôn trả về `200 OK` (tránh PayOS retry storm)

### 8.3 Tại sao thiết kế như vậy?

| Quyết định | Lý do |
|---|---|
| **orderCode = UnixTimeMilliseconds** | PayOS yêu cầu orderCode là `long` unique. Unix timestamp ms đảm bảo unique trong cùng process. |
| **Description truncate 25 chars** | PayOS API limit — nếu quá dài sẽ reject request. |
| **Webhook luôn return 200** | PayOS sẽ retry webhook nếu nhận non-2xx. Nếu có lỗi logic, ta log nhưng vẫn trả 200 để tránh duplicate processing. |
| **userId từ X-User-Id header** | Chưa có Identity Server (planned Section 11). Tạm dùng header, khi có JWT sẽ extract từ claims. |
| **Dùng SQL Server chung với OrderDb** | Payment và Order có relationship chặt (cùng orderNo). Shared database instance giảm infrastructure cost, nhưng dùng separate database (`PaymentDb` vs `OrderDb`). |
| **MassTransit + RabbitMQ** | Consistent với các service khác (Basket→Ordering đã dùng MassTransit). Loosely coupled — Ordering service subscribe `PaymentCompletedEvent` để update order status mà không cần Payment biết về Ordering. |

### 8.4 Cấu trúc Payment.API

```
Services/Payment.API/
├── Configuration/
│   └── PayOSSettings.cs          # Options pattern cho PayOS config
├── Controllers/
│   └── PaymentController.cs      # 6 endpoints (CRUD + webhook)
├── DTOs/
│   ├── CreatePaymentRequest.cs   # Input validation (DataAnnotations)
│   ├── PaymentResponse.cs        # Create response
│   └── PaymentStatusResponse.cs  # Status query response
├── Entities/
│   ├── PaymentStatus.cs          # Enum: Pending→Paid→Cancelled→Failed→Refunded
│   └── PaymentTransaction.cs     # EF Core entity
├── Persistence/
│   └── PaymentDbContext.cs       # DbContext + Fluent API (indexes, decimal precision)
├── Repositories/
│   ├── Interfaces/
│   │   └── IPaymentRepository.cs
│   └── PaymentRepository.cs      # EF Core implementation
├── Services/
│   ├── Interfaces/
│   │   └── IPaymentService.cs
│   └── PaymentService.cs         # PayOS SDK + MassTransit publish
├── Program.cs                    # DI setup, auto-migrate, Serilog→ES
├── appsettings.json              # Production config (docker hostnames)
├── appsettings.Development.json  # Local dev config (localhost)
└── Dockerfile                    # Multi-stage build
```

---

## Section 10 — React SPA Client

### 10.1 Tổng quan

React.Client là Single Page Application (SPA) cho end-user, xây dựng trên stack hiện đại:

- **React 19** + **TypeScript 5.8** — UI rendering
- **Vite 6 + SWC** — Build tooling (esbuild + SWC for blazing fast HMR)
- **MUI v5** — Component library (clone theme từ mern-ecommerce: black primary, #DB4444 accent, Poppins font)
- **Zustand 5** — Client-side state (cart, wishlist, UI)
- **TanStack React Query 5** — Server state management
- **React Router DOM v7** — Client-side routing with lazy loading
- **Axios** — HTTP client with interceptors
- **Framer Motion** — Animations

### 10.2 Architecture Pattern

```
┌─────────────────────────────────────────────────────┐
│                    React.Client                      │
│                                                      │
│  ┌──────────┐   ┌──────────────┐   ┌──────────────┐ │
│  │  Pages   │───│  React Query │───│  Axios API   │ │
│  │ (lazy)   │   │  (cache)     │   │  (interceptor)│ │
│  └──────────┘   └──────────────┘   └──────┬───────┘ │
│       │                                    │         │
│  ┌──────────┐                              │         │
│  │ Zustand  │                              ▼         │
│  │ Stores   │                    ┌──────────────┐    │
│  │(cart/wish)│                   │ Ocelot GW    │    │
│  └──────────┘                    │ localhost:5000│    │
│                                  └──────────────┘    │
└─────────────────────────────────────────────────────┘
```

### 10.3 State Management Strategy

**Tại sao dùng Zustand thay vì Redux?**

| Zustand | Redux Toolkit |
|---|---|
| ~1KB bundle size | ~11KB |
| Zero boilerplate | Slices, actions, reducers |
| Built-in persist middleware | Cần redux-persist thêm |
| No Provider wrapper needed | Provider bắt buộc |
| Đủ cho e-commerce cart/wishlist | Overkill cho scope này |

**Tại sao dùng React Query cho server state?**

- **Automatic cache invalidation** — staleTime 30s, gcTime 5min
- **Background refetch** — Data luôn fresh
- **Optimistic updates** — UX mượt
- **Request deduplication** — Multiple components cùng query key chỉ fetch 1 lần
- **Devtools** — Debug query cache trực quan

### 10.4 Routing Architecture

```tsx
createBrowserRouter([
  { path: '/', element: <RootLayout />, children: [
    // Products
    { index: true, element: <HomePage /> },           // Product grid + search
    { path: 'products/:id', element: <ProductDetailsPage /> },

    // Cart & Checkout
    { path: 'cart', element: <CartPage /> },           // Cart with quantity controls
    { path: 'checkout', element: <CheckoutPage /> },   // Form + PayOS/COD selection

    // Payment
    { path: 'payment/success', element: <PaymentSuccessPage /> }, // PayOS redirect back
    { path: 'payment/cancel', element: <PaymentCancelPage /> },

    // Orders
    { path: 'order-success/:orderNo', element: <OrderSuccessPage /> }, // COD success
    { path: 'orders', element: <UserOrdersPage /> },   // Order history

    // User
    { path: 'profile', element: <UserProfilePage /> },
    { path: 'wishlist', element: <WishlistPage /> },

    // Admin
    { path: 'admin', element: <AdminDashboardPage /> },
    { path: 'admin/products/add', element: <AddProductPage /> },
    { path: 'admin/products/:id/edit', element: <ProductUpdatePage /> },
    { path: 'admin/orders', element: <AdminOrdersPage /> },

    // Fallback
    { path: '*', element: <Navigate to="/404" /> },
  ]}
])
```

**Tại sao tất cả pages đều lazy load?**
- **Code splitting** → Mỗi page là 1 chunk riêng, user chỉ download code cho page đang xem
- **Initial bundle < 100KB** → Fast First Contentful Paint
- **Vite manualChunks** → vendor libs (react, mui, framer-motion) tách riêng, cache lâu dài

### 10.5 API Integration Flow

```
User Action → React Query mutate/query
                    │
                    ▼
              Axios Instance
              ├── Request Interceptor: Attach Bearer token + X-User-Id
              ├── Base URL: /api (relative, proxied by Vite dev / nginx prod)
              └── Response Interceptor: 401 → redirect /login
                    │
                    ▼
            ┌───────────────┐
            │  Vite Proxy   │ (dev: localhost:5173 → localhost:5000)
            │  OR           │
            │  Nginx Proxy  │ (prod: /api/ → ocelot.apigw:80)
            └───────┬───────┘
                    │
                    ▼
            Ocelot API Gateway → Downstream Microservices
```

### 10.6 Cart Flow (Zustand + API Sync)

1. User **add to cart** → Zustand `addItem()` → persisted to `localStorage` (instant UX)
2. User **checkout** → Sync cart to Basket.API via `POST /api/baskets`
3. Submit checkout → `POST /api/baskets/checkout` → triggers `BasketCheckoutEvent`
4. Ordering.API consumes event → Creates Order
5. If PayOS → `POST /api/payments` → redirect to PayOS
6. PayOS webhook → `PaymentCompletedEvent` → Ordering.API updates order status

---

## Section 12 — Docker Containerization & Deployment

### 12.1 Tổng quan Architecture

```
                    ┌─────────────────────────────┐
                    │    react.client (:3000)       │
                    │    Nginx + React SPA          │
                    └─────────────┬───────────────┘
                                  │ /api/ proxy
                    ┌─────────────▼───────────────┐
                    │   ocelot.apigw (:5000)       │
                    │   API Gateway + Rate Limit   │
                    └──┬───┬───┬───┬───┬───┬──────┘
                       │   │   │   │   │   │
          ┌────────────┘   │   │   │   │   └────────────┐
          ▼                ▼   ▼   ▼   ▼                ▼
    ┌──────────┐  ┌─────┐ ┌─────┐ ┌─────┐ ┌───────┐ ┌─────────┐
    │Product   │  │Cust.│ │Bask.│ │Order│ │Invent.│ │Payment  │
    │API:6002  │  │:6003│ │:6004│ │:6005│ │:6006  │ │API:6007 │
    └────┬─────┘  └──┬──┘ └──┬──┘ └──┬──┘ └───┬───┘ └────┬────┘
         │           │       │       │         │          │
    ┌────▼─────┐ ┌───▼──┐ ┌─▼──┐ ┌──▼───┐ ┌───▼───┐ ┌───▼────┐
    │MySQL     │ │Postgr│ │Redis│ │MSSQL │ │MongoDB│ │MSSQL   │
    │:3306     │ │:5433 │ │:6379│ │:1432 │ │:27017 │ │(shared)│
    └──────────┘ └──────┘ └────┘ └──────┘ └───────┘ └────────┘
                                     │
                              ┌──────▼──────┐
                              │  RabbitMQ   │
                              │  :5672/15672│
                              └─────────────┘
```

### 12.2 Docker Compose Strategy

**docker-compose.yml** — Service definitions + build context:
- Defines images, build contexts, Dockerfile paths
- Network: `viet_microservices` (bridge) — tất cả services communicate qua container name
- Volumes: persistent storage cho databases

**docker-compose.override.yml** — Environment-specific config:
- Connection strings (dùng container hostname: `orderdb`, `productdb`, etc.)
- Port mappings (host:container)
- `depends_on` ordering
- PayOS/SMTP credentials cho Payment.API

### 12.3 Dockerfile Patterns

**Backend (.NET) — Multi-stage build**:
```dockerfile
# Stage 1: SDK image → restore + build + publish
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
COPY BuildingBlocks/**/*.csproj ./BuildingBlocks/  # Restore xong cache layer
COPY Services/Payment.API/*.csproj ./Services/Payment.API/
RUN dotnet restore
COPY . .
RUN dotnet publish -c Release -o /app/publish

# Stage 2: Runtime image (nhẹ hơn ~5x so với SDK)
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "Payment.API.dll"]
```

**Frontend (React) — Node + Nginx**:
```dockerfile
# Stage 1: Node → npm ci + npm run build (Vite output → dist/)
FROM node:20-alpine AS build
COPY package.json package-lock.json* ./
RUN npm ci --ignore-scripts
COPY . .
RUN npm run build

# Stage 2: Nginx serve static + proxy API
FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
```

### 12.4 Nginx Configuration

```nginx
server {
    listen 80;
    
    # SPA routing — mọi route → index.html (React Router handle phía client)
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # API proxy → Ocelot Gateway (trong cùng Docker network)
    location /api/ {
        proxy_pass http://ocelot.apigw:80/api/;
    }
    
    # Cache static assets 1 year (Vite content-hash filenames)
    location ~* \.(js|css|png|jpg|svg|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

**Tại sao dùng Nginx thay vì serve từ Node?**
- Nginx xử lý static files nhanh hơn 10-50x so với Node
- RAM usage ~5MB vs ~50MB cho Node process
- Built-in gzip compression
- Reverse proxy capabilities cho API routing
- Production-ready security headers

### 12.5 Network & Service Discovery

Tất cả services nằm trên `viet_microservices` bridge network:
- Services gọi nhau bằng **container name** (e.g., `http://product.api:80`)
- Ocelot config dùng `"Host": "payment.api"` — Docker DNS tự resolve
- Không cần Consul/Eureka service discovery cho development (sẽ thêm khi scale production)

---

## Section 13 — Event-Driven Communication

### 13.1 Tổng quan

Hệ thống dùng **MassTransit + RabbitMQ** cho async messaging giữa microservices.

### 13.2 Event Flow

```
  ┌─────────────┐   BasketCheckoutEvent    ┌──────────────┐
  │ Basket.API  │─────────────────────────▶│ Ordering.API │
  └─────────────┘                          └──────────────┘
                                                  │
  ┌─────────────┐   PaymentCompletedEvent         │
  │ Payment.API │─────────────────────────▶│ (subscribe)  │
  └─────────────┘                          └──────────────┘
         │
         │         PaymentFailedEvent
         └────────────────────────────────▶ (future: Notification.API)
```

### 13.3 Event Definitions

**BasketCheckoutEvent** (existing):
```csharp
// User checkout → Basket.API publish → Ordering.API consume → Create Order
public record BasketCheckoutEvent : IntegrationBaseEvent
{
    public string UserName { get; set; }
    public decimal TotalPrice { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string EmailAddress { get; set; }
    public string ShippingAddress { get; set; }
    public string InvoiceAddress { get; set; }
}
```

**PaymentCompletedEvent** (new):
```csharp
// PayOS webhook → Payment.API publish → Ordering.API consume → Update Order status
public record PaymentCompletedEvent : IntegrationBaseEvent
{
    public string OrderNo { get; init; }
    public decimal Amount { get; init; }
    public DateTime PaidAt { get; init; }
    public string PaymentMethod { get; init; }
    public string TransactionId { get; init; }
}
```

**PaymentFailedEvent** (new):
```csharp
// Payment failed/timeout → Payment.API publish → Future: Notification.API
public record PaymentFailedEvent : IntegrationBaseEvent
{
    public string OrderNo { get; init; }
    public string Reason { get; init; }
    public decimal Amount { get; init; }
}
```

### 13.4 Tại sao Event-Driven?

| Approach | Pros | Cons |
|---|---|---|
| **Synchronous (HTTP)** | Simple, immediate response | Tight coupling, cascade failures, slower |
| **Event-Driven (MQ)** | Loosely coupled, resilient, scalable | Eventually consistent, harder to debug |

Chọn **Event-Driven** vì:

1. **Loose coupling**: Payment.API không cần biết Ordering.API tồn tại. Nó chỉ publish event, ai subscribe thì tự xử lý.
2. **Resilience**: Nếu Ordering.API down khi payment thành công → RabbitMQ giữ message trong queue → Khi Ordering.API recover, nó consume và cập nhật. **Zero data loss**.
3. **Scalability**: Có thể thêm N consumers (Notification.API, Analytics.API) mà không sửa Payment.API.
4. **Consistency**: MassTransit hỗ trợ retry policy, dead-letter queue, outbox pattern.

### 13.5 MassTransit Configuration Pattern

```csharp
// Program.cs — Payment.API
services.AddMassTransit(cfg =>
{
    cfg.UsingRabbitMq((ctx, cfg) =>
    {
        cfg.Host(new Uri(hostAddress), "/", h =>
        {
            h.Username("guest");
            h.Password("guest");
        });
    });
});

// PaymentService.cs — Publish event
await _publishEndpoint.Publish(new PaymentCompletedEvent
{
    OrderNo = transaction.OrderNo,
    Amount = transaction.Amount,
    PaidAt = DateTime.UtcNow,
    PaymentMethod = verifiedData.PaymentMethod ?? "PayOS",
    TransactionId = verifiedData.TransactionId
});
```

**Tại sao MassTransit thay vì raw RabbitMQ client?**
- **Abstraction**: Có thể switch sang Azure Service Bus, Amazon SQS mà không đổi code
- **Conventions**: Tự tạo exchange, queue, binding theo event type
- **Middleware**: Retry, circuit breaker, rate limiting built-in
- **Testing**: In-memory transport cho unit tests
- **Saga support**: Cho complex workflows (Order Saga) trong tương lai

---

## End-to-End Flow Walkthrough

### Happy Path: User mua hàng và thanh toán PayOS

```
Timeline:
─────────────────────────────────────────────────────────────

1. [React] User browse → GET /api/products → Product.API → MySQL
   → React Query cache 30s, hiển thị product grid

2. [React] User add to cart → Zustand addItem() → localStorage persist
   → Instant UI update (no API call)

3. [React] User click Checkout → Navigate to /checkout
   → Form: name, email, address + payment method selection

4. [React] User submit form (PayOS selected):
   a. POST /api/baskets → Sync cart items to Basket.API (Redis)
   b. POST /api/baskets/checkout → BasketCheckoutEvent published
   c. Ordering.API consume → Create Order (status: New)
   d. POST /api/payments → Payment.API creates PaymentTransaction

5. [Payment.API] Create PayOS payment link:
   → PayOS SDK createPaymentLink({orderCode, amount, items, returnUrl})
   → Save paymentUrl to DB
   → Return paymentUrl to client

6. [React] window.location.href = paymentUrl
   → User redirected to PayOS checkout page
   → User scans QR code / bank transfer

7. [PayOS → Payment.API] Webhook POST /api/payments/payos-callback
   → Verify webhook signature (checksumKey)
   → Update PaymentTransaction status = Paid
   → Publish PaymentCompletedEvent to RabbitMQ

8. [Ordering.API] Consume PaymentCompletedEvent
   → Update Order status: New → Paid
   → (Future: trigger email notification)

9. [PayOS → React] Redirect to returnUrl (/payment/success?orderCode=xxx)
   → PaymentSuccessPage fetches status by orderCode
   → Confirms payment, clears cart
   → Shows success UI with confetti 🎉

─────────────────────────────────────────────────────────────
```

### Unhappy Path: Payment cancelled

```
6b. User clicks "Cancel" on PayOS page
    → Redirect to cancelUrl (/payment/cancel)
    → PaymentCancelPage shows retry options
    → Cart preserved (not cleared)
```

### Unhappy Path: Webhook failure

```
7b. Payment.API down khi PayOS gọi webhook
    → PayOS retry (exponential backoff)
    → Khi Payment.API recover → process webhook normally
    → Idempotent: check if already Paid before updating
```

---

## Architecture Decision Records

### ADR-1: Shared SQL Server Instance, Separate Databases

**Context**: Payment.API cần database. Có thể dùng chung instance SQL Server với Ordering.API hoặc tạo instance mới.

**Decision**: Dùng chung instance `orderdb` (SQL Server container), nhưng tạo database riêng `PaymentDb`.

**Rationale**:
- Giảm resource consumption (1 SQL Server instance thay vì 2)
- Database-per-service pattern vẫn được maintain (separate schemas)
- Payment và Order có lifecycle liên quan (cùng orderNo)
- Development/test environment không cần tối ưu isolation

**Consequences**: Production nên tách ra separate instances cho HA.

---

### ADR-2: Zustand over Redux for Client State

**Context**: Need client-side state management for cart, wishlist, UI state.

**Decision**: Zustand 5 with persist middleware.

**Rationale**:
- Cart/wishlist state is simple (array of items + CRUD operations)
- Zustand's persist middleware = localStorage sync out-of-the-box
- ~1KB vs Redux Toolkit's ~11KB
- No Provider/Store wrapper needed
- Server state handled by React Query (separation of concerns)

---

### ADR-3: Webhook Always Returns 200

**Context**: PayOS webhook retries on non-2xx responses.

**Decision**: Always return HTTP 200 from webhook handler, even on processing errors.

**Rationale**:
- Prevents retry storms that could cause duplicate payment processing
- Errors are logged to Elasticsearch via Serilog for debugging
- Idempotency check prevents double-processing even if retried
- PayOS documentation recommends this pattern

---

### ADR-4: Multi-Stage Docker Builds

**Context**: Need to containerize both .NET and React apps.

**Decision**: Multi-stage Dockerfiles for both.

**Rationale**:
- .NET: SDK image (~700MB) → Runtime image (~85MB). Final image 8x smaller.
- React: Node image (~300MB) → Nginx image (~25MB). Final image 12x smaller.
- Separate build and runtime dependencies
- Faster CI/CD (build cache for dependency layers)
- Security: No build tools in production image

---

### ADR-5: Vite Proxy (dev) + Nginx Proxy (prod) for API Routing

**Context**: React SPA needs to call backend APIs without CORS issues.

**Decision**: 
- Dev: Vite proxy (`/api` → `localhost:5000`)
- Prod: Nginx proxy (`/api/` → `ocelot.apigw:80`)

**Rationale**:
- Same-origin requests = no CORS configuration needed in browsers
- API base URL is always relative (`/api/...`), works in both environments
- Nginx reverse proxy adds security layer (no direct backend access)
- Consistent behavior between dev and prod

---

### ADR-6: Lazy Loading All Pages

**Context**: React app has 15+ pages.

**Decision**: All page components are lazy-loaded with `React.lazy()`.

**Rationale**:
- Initial bundle < 100KB (only framework + layout)
- Each page splits into separate chunk (~5-30KB each)
- Vite's manualChunks separates vendor libs (react, mui, framer-motion)
- Suspense fallback (Spinner) provides loading UX
- Prefetch on hover possible with React Router's `loader` (future enhancement)

---

*Generated: Section 8/10/12/13 Implementation — Distributed E-Commerce Platform*
