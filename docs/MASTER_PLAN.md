# 🏗️ MASTER IMPLEMENTATION PLAN — Nexus Commerce

**Project:** Nexus Commerce Microservices Platform  
**Current Status:** Sections 1-7 ✅ Completed  
**Remaining:** Sections 8-13  
**Author:** Senior Full-Stack .NET & React Engineer (10+ YoE)  
**Date:** February 15, 2026

---

## 📋 Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Current Project Status](#2-current-project-status)
3. [Phase Breakdown & Agent Architecture](#3-phase-breakdown--agent-architecture)
4. [Phase 1: API Gateway & Infrastructure (Section 8, 9, 10)](#4-phase-1-api-gateway--infrastructure)
5. [Phase 2: New Frontend Application](#5-phase-2-new-frontend-application)
6. [Phase 3: Authentication & Authorization (Section 11, 12)](#6-phase-3-authentication--authorization)
7. [Phase 4: Payment Integration — Section 13](#7-phase-4-payment-integration--section-13)
8. [Phase 5: Integration Testing & Build](#8-phase-5-integration-testing--build)
9. [Agent Responsibility Matrix](#9-agent-responsibility-matrix)
10. [Technology Stack Summary](#10-technology-stack-summary)
11. [Risk Assessment & Mitigation](#11-risk-assessment--mitigation)

---

## 1. Executive Summary

This plan covers the full implementation of Sections 8-13 of the Nexus Commerce Platform course, plus:

- **Replace Angular.Client** with a modern **React + Vite + TypeScript** frontend (setup mirroring AURA-FE)
- **Replicate mern-ecommerce UI/UX** (MUI theme, Lottie animations, layout structure)
- **Add PayOS payment integration** (Section 13 — new)
- **Use Zustand** for state management (replacing Redux Toolkit)
- Full Docker containerization and production deployment readiness

---

## 2. Current Project Status

### ✅ Completed (Sections 1-7)

| Section | Service               | Database   | Status                                               |
| ------- | --------------------- | ---------- | ---------------------------------------------------- |
| 1-2     | Product.API           | MySQL 8.0  | ✅ Full CRUD, Seeding, Docker                        |
| 3       | Customer.API          | PostgreSQL | ✅ Minimal API, Seeding, Docker                      |
| 4       | Basket.API            | Redis      | ✅ CRUD, gRPC Client, MassTransit Publisher          |
| 5       | Ordering.API          | SQL Server | ✅ Clean Architecture, CQRS, MediatR, Email Service  |
| 6       | Communication         | RabbitMQ   | ✅ Basket→Ordering event flow, gRPC Inventory↔Basket |
| 7       | Inventory.Product.API | MongoDB    | ✅ gRPC Server, REST API, Pagination                 |

### Infrastructure Completed

- Docker Compose (13+ containers)
- Serilog centralized logging
- BuildingBlocks (Contracts, Infrastructure, Shared, EventBus)
- Ocelot API Gateway (routing, rate limiting, caching, QoS)
- Elasticsearch + Kibana (containers ready)

### 🔲 Remaining

| Section | Topic                        | Status                      |
| ------- | ---------------------------- | --------------------------- |
| 8       | API Gateway (Enhancement)    | 🔲 Auth, Service Discovery  |
| 9       | Hangfire Background Jobs     | 🔲 Scaffold only            |
| 10      | Advanced Config & Extensions | 🔲 Polly, HealthChecks, ELK |
| 11      | Identity Server Auth         | 🔲 Not started              |
| 12      | Production Deployment        | 🔲 Not started              |
| 13      | PayOS + Frontend (NEW)       | 🔲 Not started              |

---

## 3. Phase Breakdown & Agent Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      LEAD AGENT (Orchestrator)                  │
│  • Project planning & coordination                              │
│  • Cross-service integration decisions                          │
│  • Final review & validation                                    │
├─────────┬──────────┬──────────┬──────────┬─────────────────────┤
│ Phase 1 │ Phase 2  │ Phase 3  │ Phase 4  │ Phase 5             │
│ Backend │ Frontend │ Identity │ Payment  │ Testing & Build     │
│ Infra   │ React    │ Auth     │ PayOS    │                     │
├─────────┼──────────┼──────────┼──────────┼─────────────────────┤
│SubAgent │SubAgent  │SubAgent  │SubAgent  │SubAgent             │
│ BE-1    │ FE-1     │ AUTH-1   │ PAY-1    │ TEST-1              │
│         │          │          │          │                     │
│ S8: GW  │ Setup    │ S11: IS  │ S13:     │ Unit Tests          │
│ S9: HF  │ Layout   │ S12: Cfg │ PayOS BE │ Integration Tests   │
│ S10:Ext │ Pages    │ S12: JWT │ PayOS FE │ Docker Build        │
│         │ Store    │ S12: Perm│ Cart Flow│ Smoke Tests         │
│         │ API Intg │          │          │ Documentation       │
└─────────┴──────────┴──────────┴──────────┴─────────────────────┘
```

---

## 4. Phase 1: API Gateway & Infrastructure (Sections 8, 9, 10)

### Phase 1A — Section 8: Ocelot API Gateway Enhancement

**SubAgent: BE-1** | **Duration: 2-3 days**

> Note: Ocelot routing, rate limiting, caching, QoS already implemented.

| Task | Description                                                                    | Priority |
| ---- | ------------------------------------------------------------------------------ | -------- |
| 8.1  | Configure JWT Authentication in Ocelot (defer impl to Phase 3, prepare config) | HIGH     |
| 8.2  | Add Gateway Load Balancing verification tests                                  | MEDIUM   |
| 8.3  | Containerize API Gateway — verify `ocelot.json` Docker routing                 | HIGH     |
| 8.4  | Add request/response logging middleware                                        | MEDIUM   |
| 8.5  | Test all 11 routes through gateway                                             | HIGH     |

**Deliverables:**

- Updated `ocelot.json` with authentication placeholders
- Gateway Dockerfile verification
- Route testing documentation

### Phase 1B — Section 9: Hangfire Background Jobs

**SubAgent: BE-1** | **Duration: 1-2 days**

| Task | Description                                                                              | Priority |
| ---- | ---------------------------------------------------------------------------------------- | -------- |
| 9.1  | Install Hangfire NuGet packages (Hangfire.Core, Hangfire.SqlServer, Hangfire.AspNetCore) | HIGH     |
| 9.2  | Configure Hangfire dashboard & storage (SQL Server)                                      | HIGH     |
| 9.3  | Create `IScheduledEmailService` — check for abandoned carts                              | HIGH     |
| 9.4  | Implement recurring job: scan orders not checked out within 24h                          | HIGH     |
| 9.5  | Send reminder email using existing `IEmailService`                                       | MEDIUM   |
| 9.6  | Add Hangfire to Docker Compose                                                           | MEDIUM   |

**Deliverables:**

- Working Hangfire.API with dashboard at `/hangfire`
- `AbandonedCartEmailJob` recurring job
- Docker integration

### Phase 1C — Section 10: Advanced Configuration & Extensions

**SubAgent: BE-1** | **Duration: 3-4 days**

| Task | Description                                                                 | Priority |
| ---- | --------------------------------------------------------------------------- | -------- |
| 10.1 | Transaction management — Saga/Outbox pattern for cross-service transactions | HIGH     |
| 10.2 | Integrate Serilog → Elasticsearch (already have ES container)               | HIGH     |
| 10.3 | Configure Kibana dashboards for log visualization                           | MEDIUM   |
| 10.4 | Add request correlation IDs across microservices                            | HIGH     |
| 10.5 | Implement Polly policies: Retry, Circuit Breaker, Timeout, Bulkhead         | HIGH     |
| 10.6 | Apply Polly to HTTP clients (Basket→Inventory, Gateway→Services)            | HIGH     |
| 10.7 | Add HealthChecks to all microservices (DB, Redis, RabbitMQ, MongoDB)        | HIGH     |
| 10.8 | Build WebHealthStatus dashboard (replace MVC scaffold)                      | MEDIUM   |
| 10.9 | Containerize WebHealthStatus                                                | LOW      |

**Deliverables:**

- ELK stack fully integrated
- Polly resilience policies on all HTTP clients
- Health check endpoints on every service
- WebHealthStatus dashboard

---

## 5. Phase 2: New Frontend Application

### Phase 2A — Project Setup (Like AURA-FE)

**SubAgent: FE-1** | **Duration: 1-2 days**

**Delete:** `src/WebApps/Angular.Client/`

**Create:** `src/WebApps/React.Client/` with AURA-FE tooling:

| Tool                      | Version | Purpose                                  |
| ------------------------- | ------- | ---------------------------------------- |
| React                     | ^19.x   | UI Framework                             |
| Vite 7                    | ^7.x    | Build tool with SWC                      |
| TypeScript                | ^5.8    | Type safety                              |
| Tailwind CSS v4           | ^4.x    | Utility-first CSS                        |
| MUI v5                    | ^5.x    | Component library (match mern-ecommerce) |
| Zustand                   | ^5.x    | Client state management                  |
| TanStack React Query      | ^5.x    | Server state management                  |
| React Router DOM v7       | ^7.x    | Routing                                  |
| Axios                     | ^1.x    | HTTP client                              |
| React Hook Form + Yup     | Latest  | Form handling                            |
| Framer Motion             | ^12.x   | Animations                               |
| Lottie React              | ^2.x    | Lottie animations                        |
| ESLint 9 (flat config)    | ^9.x    | Linting                                  |
| Prettier                  | ^3.x    | Formatting                               |
| Husky 9 + lint-staged     | ^9.x    | Git hooks                                |
| commitlint                | Latest  | Conventional commits                     |
| Jest 30 + Testing Library | Latest  | Unit testing                             |
| react-toastify            | Latest  | Notifications                            |
| react-swipeable-views     | Latest  | Carousels                                |

**Setup Tasks:**
| # | Task |
|---|------|
| 2A.1 | Initialize Vite + React + TypeScript project |
| 2A.2 | Configure `tsconfig.json` with path aliases (`@/*`) |
| 2A.3 | Configure `vite.config.mjs` (SWC, Tailwind, chunking, compression) |
| 2A.4 | Install & configure ESLint 9 flat config |
| 2A.5 | Configure Prettier (`.prettierrc`) |
| 2A.6 | Setup Husky + lint-staged + commitlint |
| 2A.7 | Configure Jest + Testing Library |
| 2A.8 | Setup MUI v5 theme (replicate mern-ecommerce theme) |
| 2A.9 | Setup environment files (`.env`, `.env.example`) |
| 2A.10 | Configure PostCSS + Tailwind |

### Phase 2B — Core Architecture

**SubAgent: FE-1** | **Duration: 2-3 days**

| #    | Task                      | Details                                                                                          |
| ---- | ------------------------- | ------------------------------------------------------------------------------------------------ |
| 2B.1 | **Zustand Stores**        | `auth-store`, `cart-store`, `wishlist-store`, `product-store`, `ui-store` with logger middleware |
| 2B.2 | **Axios API Layer**       | Base instance pointing to Ocelot Gateway (`:5000`), interceptors (Bearer token, 401 handling)    |
| 2B.3 | **API Endpoints**         | Centralized `endpoints.ts` for all microservice routes via gateway                               |
| 2B.4 | **React Query Setup**     | `QueryClientProvider`, typed query/mutation handlers                                             |
| 2B.5 | **Router Setup**          | Lazy-loaded routes with Suspense, route guards (Protected, Admin)                                |
| 2B.6 | **Provider Architecture** | `QueryClientProvider` → `ThemeProvider` → `ErrorBoundary` → `Router`                             |
| 2B.7 | **Custom Hooks**          | `useAuth`, `useDebounce`, `useMediaQuery`, `useCart`                                             |

**Zustand Store Design:**

```typescript
// cart-store.ts
interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (itemNo: string) => void;
  updateQuantity: (itemNo: string, qty: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  subtotal: () => number;
}

// auth-store.ts
interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (credentials: LoginDto) => Promise<void>;
  logout: () => void;
  checkAuth: () => void;
}
```

### Phase 2C — UI Pages (Replicate mern-ecommerce)

**SubAgent: FE-1** | **Duration: 5-7 days**

**Theme (from mern-ecommerce):**

```typescript
palette: {
  primary: { main: '#000000', light: '#ffffff', dark: '#DB4444' },
  background: { default: '#ffffff' }
}
typography: { fontFamily: 'Poppins, sans-serif' }
```

**Pages to Implement:**

| Page                  | Route                            | Auth      | Key Components                                     |
| --------------------- | -------------------------------- | --------- | -------------------------------------------------- |
| `LoginPage`           | `/login`                         | Public    | Form + ecommerceOutlook Lottie                     |
| `SignupPage`          | `/signup`                        | Public    | Registration form                                  |
| `ForgotPasswordPage`  | `/forgot-password`               | Public    | Email input                                        |
| `ResetPasswordPage`   | `/reset-password/:userId/:token` | Public    | New password form                                  |
| `OtpVerificationPage` | `/verify-otp`                    | Public    | OTP entry                                          |
| `HomePage`            | `/`                              | Protected | Banner carousel + ProductList + Filters + Footer   |
| `ProductDetailsPage`  | `/product-details/:id`           | Protected | Image gallery, sizes, colors, reviews, add to cart |
| `CartPage`            | `/cart`                          | Protected | Cart items, subtotal, shipping, taxes              |
| `CheckoutPage`        | `/checkout`                      | Protected | Address form, payment method, order summary        |
| `OrderSuccessPage`    | `/order-success/:id`             | Protected | orderSuccess Lottie                                |
| `UserOrdersPage`      | `/orders`                        | Protected | Order history                                      |
| `UserProfilePage`     | `/profile`                       | Protected | Profile management                                 |
| `WishlistPage`        | `/wishlist`                      | Protected | Wishlist grid                                      |
| `PaymentPage`         | `/payment`                       | Protected | PayOS integration (Section 13)                     |
| `PaymentSuccessPage`  | `/payment/success`               | Protected | Payment confirmation                               |
| `PaymentCancelPage`   | `/payment/cancel`                | Protected | Payment cancelled                                  |
| `AdminDashboardPage`  | `/admin/dashboard`               | Admin     | Admin overview                                     |
| `AddProductPage`      | `/admin/add-product`             | Admin     | Product creation                                   |
| `ProductUpdatePage`   | `/admin/product-update/:id`      | Admin     | Product editing                                    |
| `AdminOrdersPage`     | `/admin/orders`                  | Admin     | All orders management                              |
| `NotFoundPage`        | `*`                              | —         | notFoundPage Lottie                                |

**Shared Components:**
| Component | Description |
|-----------|-------------|
| `Navbar` | Sticky AppBar, avatar menu, cart badge, wishlist badge, filter toggle |
| `Footer` | Social links, download badges, info columns |
| `ProductCard` | Thumbnail, price, add-to-cart, wishlist heart (Framer Motion) |
| `ProductBanner` | AutoPlay swipeable image carousel |
| `CartItem` | Quantity selector, remove button |
| `ProductFilters` | Brand/Category accordions, sort dropdown |
| `Spinner` | Lottie loading animation |
| `EmptyState` | Configurable Lottie empty state |
| `ProtectedRoute` | Auth guard HOC |

**Lottie Animations (copy from mern-ecommerce):**

- `ecommerceOutlook.json` — Login/Signup
- `shoppingBag.json` — Empty cart
- `orderSuccess.json` — Order complete
- `noOrders.json` — No orders
- `emptyWishlist.json` — Empty wishlist
- `notFoundPage.json` — 404
- `loading.json` — Loading spinner

---

## 6. Phase 3: Authentication & Authorization (Sections 11, 12)

### Phase 3A — Section 11: Identity Server Setup

**SubAgent: AUTH-1** | **Duration: 3-4 days**

| Task | Description                                                                           | Priority |
| ---- | ------------------------------------------------------------------------------------- | -------- |
| 11.1 | Create `Identity.API` project with ASP.NET Core Identity                              | CRITICAL |
| 11.2 | Configure Identity DbContext (SQL Server)                                             | CRITICAL |
| 11.3 | Implement User Entity with `IdentityUser` base                                        | HIGH     |
| 11.4 | Repository Pattern + Service Manager with Lazy Loading                                | HIGH     |
| 11.5 | Email verification (confirm email, reset password)                                    | HIGH     |
| 11.6 | Permission entities (Role, Permission, RolePermission)                                | HIGH     |
| 11.7 | Auth APIs: Register, Login, RefreshToken, ConfirmEmail, ForgotPassword, ResetPassword | CRITICAL |
| 11.8 | JWT Token generation & validation                                                     | CRITICAL |
| 11.9 | Role-based authorization middleware                                                   | HIGH     |

### Phase 3B — Section 12: Duende Identity Server & Production

**SubAgent: AUTH-1** | **Duration: 4-5 days**

| Task  | Description                                            | Priority |
| ----- | ------------------------------------------------------ | -------- |
| 12.1  | Initialize Duende Identity Server with template        | HIGH     |
| 12.2  | Configure Serilog for Identity Server                  | MEDIUM   |
| 12.3  | Define Scopes, API Resources, Clients                  | CRITICAL |
| 12.4  | Migrate Config & Persisted Grant DB                    | HIGH     |
| 12.5  | Integrate .NET Core Identity                           | HIGH     |
| 12.6  | Configure SMTP Email Service                           | MEDIUM   |
| 12.7  | Repository Pattern + Repository Manager (Lazy Loading) | HIGH     |
| 12.8  | Permission Entity + Repository + Presentation API      | HIGH     |
| 12.9  | Permission API with Dapper + Stored Procedures         | HIGH     |
| 12.10 | Bearer token authentication & authorization policies   | CRITICAL |
| 12.11 | Implement Permission List middleware                   | HIGH     |
| 12.12 | Apply Auth to Product Microservice                     | HIGH     |
| 12.13 | Apply Auth to all other Microservices                  | HIGH     |
| 12.14 | Configure Ocelot Gateway Authentication                | CRITICAL |
| 12.15 | Containerize Identity Service                          | HIGH     |
| 12.16 | End-to-end auth flow testing                           | CRITICAL |

---

## 7. Phase 4: Payment Integration — Section 13 (NEW)

### Phase 4A — Backend: PayOS Integration

**SubAgent: PAY-1** | **Duration: 2-3 days**

**PayOS Configuration (from Trippio appsettings):**

```json
{
  "PayOS": {
    "ClientId": "change_me_with_payos_client_id",
    "ApiKey": "change_me_with_payos_api_key",
    "ChecksumKey": "change_me_with_payos_checksum_key"
  }
}
```

| Task  | Description                                                                      | Priority |
| ----- | -------------------------------------------------------------------------------- | -------- |
| 13.1  | Create `Payment.API` microservice project                                        | CRITICAL |
| 13.2  | Install `Net.payOS` NuGet package                                                | CRITICAL |
| 13.3  | Configure PayOS settings in `appsettings.json`                                   | HIGH     |
| 13.4  | Implement `IPaymentService` with PayOS SDK                                       | CRITICAL |
| 13.5  | Create Payment DTOs: `CreatePaymentRequest`, `PaymentResponse`, `WebhookPayload` | HIGH     |
| 13.6  | API: `POST /api/payment/create` — create PayOS payment link                      | CRITICAL |
| 13.7  | API: `GET /api/payment/{orderId}/status` — check payment status                  | HIGH     |
| 13.8  | API: `POST /api/payment/payos-callback` — webhook handler                        | CRITICAL |
| 13.9  | API: `POST /api/payment/cancel/{orderId}` — cancel payment                       | MEDIUM   |
| 13.10 | Integrate with Ordering.API — update order status on payment success             | CRITICAL |
| 13.11 | Publish `PaymentCompletedEvent` via RabbitMQ                                     | HIGH     |
| 13.12 | Add Payment routes to Ocelot Gateway                                             | HIGH     |
| 13.13 | Add Payment.API to Docker Compose                                                | MEDIUM   |
| 13.14 | Payment database (order-payment mapping, transaction logs)                       | HIGH     |

**Payment Flow:**

```
User Cart → Checkout → Create Order (Ordering.API)
                        ↓
                   Create Payment Link (Payment.API → PayOS)
                        ↓
                   Redirect to PayOS payment page
                        ↓
                   PayOS Callback → Payment.API webhook
                        ↓
                   Update Order Status (via RabbitMQ)
                        ↓
                   Redirect to Success/Cancel page
```

### Phase 4B — Frontend: Cart & Payment Flow

**SubAgent: FE-1 + PAY-1** | **Duration: 2-3 days**

| Task  | Description                                                                   | Priority |
| ----- | ----------------------------------------------------------------------------- | -------- |
| 13.15 | **Cart Zustand Store** — add/remove/update items, persist to localStorage     | CRITICAL |
| 13.16 | **Sync cart with Basket.API** — on login, merge local cart with server basket | HIGH     |
| 13.17 | **Checkout flow** — address form + order summary + payment method selection   | CRITICAL |
| 13.18 | **PayOS payment page** — redirect to PayOS URL from backend                   | CRITICAL |
| 13.19 | **Payment success page** — display order confirmation + orderSuccess Lottie   | HIGH     |
| 13.20 | **Payment cancel page** — retry or go back to cart                            | MEDIUM   |
| 13.21 | **Order history** — show payment status per order                             | MEDIUM   |
| 13.22 | **Real-time cart badge** — update navbar cart count reactively                | HIGH     |

---

## 8. Phase 5: Integration Testing & Build

### Phase 5A — Testing

**SubAgent: TEST-1** | **Duration: 2-3 days**

| Task | Description                                                  | Priority |
| ---- | ------------------------------------------------------------ | -------- |
| T.1  | Unit tests for all Zustand stores                            | HIGH     |
| T.2  | Unit tests for API service layer                             | HIGH     |
| T.3  | Component tests for critical pages (Cart, Checkout, Payment) | HIGH     |
| T.4  | Integration tests for payment flow                           | CRITICAL |
| T.5  | E2E smoke tests for full user journey                        | MEDIUM   |
| T.6  | Backend API tests for Payment.API                            | HIGH     |
| T.7  | Health check endpoint verification                           | MEDIUM   |

### Phase 5B — Docker Build & Verification

**SubAgent: TEST-1** | **Duration: 1-2 days**

| Task | Description                                           | Priority |
| ---- | ----------------------------------------------------- | -------- |
| B.1  | Update `docker-compose.yml` with all new services     | CRITICAL |
| B.2  | Build all Docker images                               | CRITICAL |
| B.3  | Run full `docker-compose up` verification             | CRITICAL |
| B.4  | Test all gateway routes                               | HIGH     |
| B.5  | Verify health check dashboard                         | MEDIUM   |
| B.6  | Test payment webhook in Docker network                | HIGH     |
| B.7  | Performance testing with multiple concurrent requests | LOW      |

### Phase 5C — Documentation

**SubAgent: TEST-1** | **Duration: 1 day**

| Task | Description                                   |
| ---- | --------------------------------------------- |
| D.1  | Update main `README.md` with new architecture |
| D.2  | Create `FRONTEND_SETUP.md` for React client   |
| D.3  | Create `PAYMENT_INTEGRATION.md`               |
| D.4  | Create `IDENTITY_SERVER_SETUP.md`             |
| D.5  | Update Docker Compose documentation           |

---

## 9. Agent Responsibility Matrix

| Agent          | Scope                                                         | Sections           | Skills                            |
| -------------- | ------------------------------------------------------------- | ------------------ | --------------------------------- |
| **Lead Agent** | Orchestration, cross-cutting decisions                        | All                | Architecture, Integration         |
| **BE-1**       | Backend infrastructure, Ocelot, Hangfire, Polly, HealthChecks | 8, 9, 10           | .NET 8, Docker, ELK               |
| **FE-1**       | React frontend setup, all UI pages, Zustand stores            | Frontend + 13 (FE) | React 19, Vite, TypeScript, MUI   |
| **AUTH-1**     | Identity Server, JWT, Permissions, Auth middleware            | 11, 12             | ASP.NET Identity, Duende, JWT     |
| **PAY-1**      | Payment.API, PayOS SDK, payment flow                          | 13 (BE)            | PayOS, Payment patterns           |
| **TEST-1**     | Testing, Docker builds, documentation                         | Phase 5            | Jest, Docker, Integration testing |

---

## 10. Technology Stack Summary

### Backend

| Technology                       | Usage                               |
| -------------------------------- | ----------------------------------- |
| .NET 8                           | All microservices                   |
| Entity Framework Core 8          | ORM (MySQL, PostgreSQL, SQL Server) |
| MongoDB Driver                   | Inventory service                   |
| Redis                            | Basket caching                      |
| MassTransit + RabbitMQ           | Async messaging                     |
| gRPC                             | Sync communication (stock check)    |
| Ocelot                           | API Gateway                         |
| Serilog + Elasticsearch + Kibana | Logging & monitoring                |
| Hangfire                         | Background jobs                     |
| Polly                            | Resilience policies                 |
| Duende Identity Server           | OAuth2/OIDC                         |
| PayOS SDK                        | Payment processing                  |
| Dapper                           | Permission queries                  |
| FluentValidation + MediatR       | CQRS pipeline                       |
| AutoMapper                       | Object mapping                      |

### Frontend

| Technology                       | Usage                       |
| -------------------------------- | --------------------------- |
| React 19                         | UI framework                |
| Vite 7 + SWC                     | Build tooling               |
| TypeScript 5.8                   | Type safety                 |
| MUI v5 + Emotion                 | Component library + styling |
| Tailwind CSS v4                  | Utility CSS                 |
| Zustand 5                        | Client state management     |
| TanStack React Query 5           | Server state management     |
| React Router DOM v7              | Routing                     |
| Axios                            | HTTP client                 |
| React Hook Form + Yup            | Forms                       |
| Framer Motion                    | Animations                  |
| Lottie React                     | Lottie animations           |
| react-swipeable-views            | Carousels                   |
| react-toastify                   | Notifications               |
| Husky + lint-staged + commitlint | Git hooks                   |
| ESLint 9 + Prettier              | Code quality                |
| Jest 30 + Testing Library        | Testing                     |

### Infrastructure

| Technology              | Usage                   |
| ----------------------- | ----------------------- |
| Docker + Docker Compose | Container orchestration |
| SQL Server 2019         | Ordering + Identity DBs |
| MySQL 8.0               | Product DB              |
| PostgreSQL              | Customer DB             |
| MongoDB                 | Inventory DB            |
| Redis                   | Basket cache            |
| RabbitMQ                | Message broker          |
| Elasticsearch 7.17      | Log storage             |
| Kibana 7.17             | Log visualization       |
| Azure DevOps (optional) | CI/CD pipeline          |

---

## 11. Risk Assessment & Mitigation

| Risk                       | Impact | Mitigation                                                                   |
| -------------------------- | ------ | ---------------------------------------------------------------------------- |
| Duende IS licensing        | HIGH   | Use community edition for development; evaluate IdentityServer4 alternative  |
| PayOS sandbox limitations  | MEDIUM | Test with sandbox first, configure webhook tunneling (ngrok)                 |
| Docker network complexity  | MEDIUM | Use Docker Compose networks, test inter-service communication                |
| gRPC + Auth integration    | HIGH   | Ensure gRPC channels carry auth tokens; configure Ocelot gRPC passthrough    |
| Frontend bundle size       | MEDIUM | Code splitting, lazy loading, bundle analysis with rollup-plugin-visualizer  |
| Cross-service transactions | HIGH   | Implement Saga pattern with compensation; use outbox pattern for reliability |
| ELK memory consumption     | MEDIUM | Configure ES JVM heap limits in docker-compose; use minimal indices          |

---

## Timeline Estimate

| Phase                  | Duration       | Dependencies             |
| ---------------------- | -------------- | ------------------------ |
| Phase 1 (S8, S9, S10)  | 6-9 days       | None                     |
| Phase 2 (Frontend)     | 8-12 days      | Phase 1 (Gateway routes) |
| Phase 3 (S11, S12)     | 7-9 days       | Phase 1                  |
| Phase 4 (S13 PayOS)    | 4-6 days       | Phase 2, Phase 3         |
| Phase 5 (Test & Build) | 3-5 days       | All phases               |
| **Total**              | **28-41 days** | —                        |

> Phases 1, 2, 3 can run in parallel after Phase 1A (Gateway) is ready.
> Phase 4 depends on Phase 2 (Frontend) and Phase 3 (Auth).
> Phase 5 runs after all phases complete.
