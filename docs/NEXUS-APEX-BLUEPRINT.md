# NEXUS APEX BLUEPRINT

Date: 2026-03-22
Owner role: CTO + Principal UX/UI Architect + Logical System Master
Scope: React Web, Angular Admin, API Gateway, 14-service ecosystem
Constraint: This document is planning-only. No UI code changes in this phase.

## 0) Executive Mandate

This blueprint solves three critical fronts at once:

1. UI/UX Purge and Layout Mathematics reset.
2. Deep logic mapping to use 100% API surface from Service API Catalog.
3. Strict 15-commit execution roadmap for implementation phase.

Success condition for phase implementation later:

- No overlapping layout in React and Angular.
- OAuth Google/GitHub login callback stable and deterministic.
- Every API endpoint has an explicit consumer flow or operational purpose.

---

## 1) Mission 1 - UI/UX Purge, Layout Mathematics, Deep Stability

### 1.1 The Purge - Production clean-up doctrine

A. Remove all non-production visual garbage:

- Floating debug buttons.
- Debug state overlays.
- Temporary QA helper cards.
- Test-only banners.

B. Forbidden layout anti-patterns:

- Random position absolute for primary layout blocks.
- Negative margin hacks for structural alignment.
- Arbitrary z-index numbers.
- Nested fixed layers without scroll ownership definition.

C. Definition of done:

- Zero debug artifacts visible in production mode.
- No text clipping from overlay div stacks.
- No primary flow block depends on absolute positioning for desktop/mobile shell.

### 1.2 Layout Mathematics - mandatory geometry system

#### Angular Admin shell formula

- Sidebar width fixed: 260px.
- Header height fixed: 64px.
- Main content: flex-1, independent scroll.
- Layout objective: content never overlays header/sidebar, on all breakpoints.

Canonical shell math:

- Root = full height flex row.
- Sidebar = fixed 260 width, full height.
- Right panel = flex column, min width 0.
- Header = fixed 64 height in right panel.
- Main = remaining vertical space with overflow auto.

#### React Web shell formula

- Container max width: 1280px.
- Product listing grid: 12 columns, gap 1.5rem.
- Bento layout split: 2/3 and 1/3.
- Touch target min: 44x44.

Grid math doctrine:

- Desktop hero+featured: col-span 8 and col-span 4.
- Product cards: balanced spans that preserve scan rhythm.
- No card may violate minimum interactive hit area.

### 1.3 Z-index hierarchy contract (hard rule)

Only these layers are valid:

- Base: 10
- Header and Sidebar: 30
- Dropdown and Popover: 40
- Modal and Toastify: 50

No other z-index values are allowed.

### 1.4 React UI Rescue strategy

A. ImageFallback strategy to stop 404 visual breaks:

- Detect load error event once.
- Swap to deterministic fallback source.
- Preserve aspect ratio box to avoid layout shift.
- Avoid infinite fallback loop.

B. PremiumInput redesign:

- Compact vertical rhythm (smaller than current oversized input).
- Built-in password reveal toggle.
- Validation text spacing reserved to avoid jump.
- Keyboard and screen-reader accessibility intact.

C. ToastProvider redesign:

- Centralized severity map: success, info, warning, error.
- Fixed presentation layer at z-index 50 only.
- Dedupe repeated messages by operation key.
- Multi-line text-safe container to avoid clipping.

### 1.5 OAuth failure analysis and fix strategy

Problem statement:

- Google/GitHub login callback not closing auth loop correctly.
- UI can get stuck in loading or miss token handoff.

Fix architecture:

1. Entry from UI:

- UI must call /api/auth/external-login with provider and optional returnUrl.

2. Callback processing:

- Backend endpoint /api/auth/external-login-callback creates or links account.
- Backend generates access token and refresh token.
- Backend redirects to frontend callback route with token payload.

3. Frontend callback handling:

- Dedicated callback page parses query params once.
- Validate token presence.
- Persist auth state atomically.
- Call /api/auth/me immediately to hydrate header and role context.
- Route user to intended returnUrl or default dashboard.

4. Failure handling:

- Missing token, provider error, malformed callback all mapped to explicit UI error states.
- No infinite spinner.
- Retry action and fallback login action always visible.

5. Security and UX safeguards:

- Clear one-time transient callback params after processing.
- Never render raw sensitive tokens on visible UI.
- Ensure callback page is responsive and not blocked by shell overlays.

---

## 2) Mission 2 - 100% API Mapping into Business Flows

Principle:
Every endpoint in Service API Catalog must map to either:

- Customer, Seller, Admin UX flow.
- System orchestration and operations.
- Health, diagnostics, or realtime infra.

## 2.1 Flow 1 - Customer Journey (React Web)

### Stage A - Auth and identity resolution

- POST /api/auth/register
  - Account creation.
- POST /api/auth/login
  - Credential login.
- GET /api/auth/external-providers
  - Render social login availability.
- GET /api/auth/external-login
  - Start Google/GitHub auth.
- GET /api/auth/external-login-callback
  - Token handoff completion.
- POST /api/auth/refresh-token
  - Session continuity.
- GET /api/auth/me
  - Hydrate top bar user state.
- POST /api/auth/forgot-password
  - Password recovery start.
- POST /api/auth/reset-password
  - Password recovery complete.
- GET /api/auth/confirm-email
  - Account verification link.

### Stage B - Discovery and content

- GET /api/products
  - Product list.
- GET /api/products/{id}
  - Product detail.
- GET /api/products/search/{productNo}
  - Product no lookup.
- GET /api/sellerproducts
  - Seller storefront mix.
- GET /api/sellerproducts/{id:long}
  - Seller product detail variant.
- GET /api/sellerproducts/by-category/{category}
  - Category stream.
- GET /api/reviews/product/{productId:long}
  - Product review feed.
- GET /api/reviews/product/{productId:long}/summary
  - Rating summary widgets.
- GET /api/admin/post/paging
  - Blog and editorial feed.
- GET /api/admin/post/{id:guid}
  - Blog detail in customer web.
- GET /api/ai/admin/search
  - AI semantic product search panel.
- POST /api/ai/chat/sessions
  - In-page AI shopping assistant.
- GET /api/ai/chat/sessions/{sessionId:guid}
  - Resume conversation thread.

### Stage C - Mega campaigns

Flash sale endpoints:

- GET /api/flashsales/sessions
- GET /api/flashsales/sessions/active
- GET /api/flashsales/sessions/{id:long}
- GET /api/flashsales/items/{itemId:long}/stock
- POST /api/flashsales/purchase
- GET /api/flashsales/orders/{userName}

Group buy endpoints:

- GET /api/groupbuys/campaigns
- GET /api/groupbuys/campaigns/active
- GET /api/groupbuys/campaigns/{id:long}
- POST /api/groupbuys/sessions/open
- POST /api/groupbuys/sessions/join
- GET /api/groupbuys/sessions/invite/{inviteCode}

UI anti-jitter requirement:

- Countdown and progress update via stable interval ownership.
- Reconcile server truth on each critical action.

### Stage D - Cart, stock lock, checkout, payment

Basket and stock:

- GET /api/baskets/{username}
- POST /api/baskets
- DELETE /api/baskets/{username}
- GET /api/baskets/stock/{itemNo}
- POST /api/baskets/checkout

Inventory support:

- GET /api/inventory/stock/{itemNo}
- POST /api/inventory/stock/batch

Required temporary lock behavior:

- UI starts 15-minute reserve timer when checkout session begins.
- Auto-release flow is orchestrated by background jobs when timer expires.

Ordering and payment:

- POST /api/v1/orders
- GET /api/v1/orders/{userName}
- GET /api/v1/orders
- GET /api/payment/{orderNo}/status
- GET /api/payment/code/{orderCode:long}/status
- POST /api/payment/create
- POST /api/payment/payos-callback
- POST /api/payment/cancel/{orderNo}
- GET /api/payment/user/{userId}

Post-order engagement:

- POST /api/reviews
- GET /api/reviews/user/{userName}

## 2.2 Flow 2 - Seller Workspace (React Web)

Product management and AI assist:

- GET /api/sellerproducts/by-seller/{sellerUserName}
- GET /api/sellerproducts/dashboard/{sellerUserName}
- POST /api/sellerproducts/preview-ai
- POST /api/sellerproducts
- PUT /api/sellerproducts/{id:long}
- DELETE /api/sellerproducts/{id:long}

Review operations:

- GET /api/reviews/product/{productId:long}
- POST /api/reviews/{reviewId:long}/reply

Optional inventory visibility for seller ops panels:

- GET /api/inventory/items/{itemNo}
- GET /api/inventory/documents/{documentNo}

## 2.3 Flow 3 - Admin Control Plane (Angular Admin)

### Identity and access governance

Identity service admin endpoints:

- GET /api/user
- GET /api/user/{id}
- DELETE /api/user/{id}
- GET /api/permission
- GET /api/permission/{roleId}
- POST /api/permission
- DELETE /api/permission/{id:int}

Admin service user and role command plane:

- GET /api/admin/user/{id:guid}
- GET /api/admin/user/paging
- POST /api/admin/user
- PUT /api/admin/user/{id:guid}
- DELETE /api/admin/user
- POST /api/admin/user/password-change-current-user
- POST /api/admin/user/set-password/{id:guid}
- POST /api/admin/user/change-email/{id:guid}
- PUT /api/admin/user/{id}/assign-users
- POST /api/admin/role
- PUT /api/admin/role/{id:guid}
- DELETE /api/admin/role
- GET /api/admin/role/{id:guid}
- GET /api/admin/role/paging
- GET /api/admin/role/all

Audit and observability:

- GET /api/admin/audit-logs

### Content orchestration

- POST /api/admin/post
- PUT /api/admin/post
- DELETE /api/admin/post
- GET /api/admin/post/{id:guid}
- GET /api/admin/post/paging
- GET /api/admin/post/series-belong/{postId:guid}
- GET /api/admin/post-category
- GET /api/admin/post-category/paging
- PUT /api/admin/post-category/{id:guid}
- POST /api/admin/post-category
- DELETE /api/admin/post-category/{ids}
- POST /api/admin/series
- PUT /api/admin/series
- PUT /api/admin/series/post-series
- DELETE /api/admin/series/post-series
- GET /api/admin/series/post-series/{seriesId:guid}
- DELETE /api/admin/series
- GET /api/admin/series/{id:guid}
- GET /api/admin/series/paging
- GET /api/admin/series
- POST /api/admin/media

### Notification and realtime

- GET /api/admin/notifications
- GET /api/admin/notifications/unread-count
- POST /api/admin/notifications/{id:guid}/mark-as-read
- POST /api/admin/notifications/mark-all-as-read
- POST /api/admin/notifications/publish
- WS /hubs/notifications

### Campaign and inventory command center

Flash sale admin actions:

- POST /api/flashsales/sessions
- POST /api/flashsales/sessions/{id:long}/activate
- POST /api/flashsales/sessions/{id:long}/end

Group buy admin actions:

- POST /api/groupbuys/campaigns
- POST /api/groupbuys/sessions/process-expired

Inventory command endpoints:

- GET /api/inventory
- GET /api/inventory/{id}
- GET /api/inventory/items/{itemNo}
- GET /api/inventory/documents/{documentNo}
- GET /api/inventory/stock/{itemNo}
- POST /api/inventory/stock/batch
- POST /api/inventory/purchase-orders
- POST /api/inventory/sales-orders
- POST /api/inventory
- DELETE /api/inventory/{id}

### AI operational endpoints in admin

- POST /api/ai/admin/sync/products
- GET /api/ai/admin/search

## 2.4 Flow 4 - Background jobs and orchestration

Hangfire operational endpoints:

- GET /hangfire
- GET /health

Background logic contracts:

1. Release stock lock after 15-minute basket timeout.
2. Process expired group-buy sessions.
3. Send payment success email and operational reminders.

Supporting callbacks and health surfaces:

- POST /api/payment/payos-callback
- GET /health on all services

## 2.5 Full API utilization ledger by service

Admin.API:

- All user, role, post, category, series, media, notification, audit endpoints are mapped to Admin Control Plane or Customer content discovery.

Identity.API:

- All auth, OAuth, user-admin, permission endpoints are mapped to Customer auth flow and Admin identity governance.

Product.API:

- All product endpoints mapped to Customer discovery and search detail.

Seller.API:

- All seller product and review endpoints mapped to Seller workspace and Customer post-order review journey.

Basket.API:

- All basket endpoints mapped to cart, stock validation, and checkout pipeline.

Customer.API:

- All minimal endpoints mapped to profile provisioning and customer lookup.

Ordering.API:

- All business endpoints mapped to checkout/order timeline; test endpoints reserved for staging diagnostics.

Payment.API:

- All payment lifecycle endpoints mapped to checkout and callback reconciliation.

Inventory.Product.API:

- All inventory, stock, PO, SO, create/delete endpoints mapped to Admin inventory command center and checkout safety.

FlashSale.API:

- All session, activation, purchase, stock, user-order endpoints mapped to campaign flow and admin orchestration.

GroupBuy.API:

- All campaign/session endpoints mapped to customer social purchase and admin process-expired orchestration.

Nexus.AI.Service:

- All chat and admin AI endpoints mapped to customer assistant and admin semantic search/sync.

Hangfire.API:

- Operational endpoints mapped to orchestrator monitoring and recurring automation.

Gateway note:

- Ocelot route layer is mandatory traffic contract for FE consumption in integrated mode.

---

## 3) Mission 3 - Discipline Execution Roadmap (15 commits)

Commit 1:
docs: generate APEX blueprint with UX mathematics and 100% API logic

Commit 2:
refactor(react-ui): purge debug UI, enforce layout math, and fix broken inputs/images

Commit 3:
refactor(angular-ui): rewrite shell layout (sidebar/header) to fix overlapping issues

Commit 4:
feat(react-auth): fix Google/GitHub OAuth flows and build premium auth forms

Commit 5:
feat(react-core): build home grid, AI search, and blog viewer

Commit 6:
feat(react-campaign): implement FlashSale and GroupBuy UI interactions

Commit 7:
feat(react-cart): build basket logic with gRPC lock-stock 15-min timers

Commit 8:
feat(react-checkout): integrate ordering, PayOS, and success callbacks

Commit 9:
feat(react-profile): user profile, order history, and review submission

Commit 10:
feat(react-seller): seller dashboard, AI product generation, review replies

Commit 11:
feat(angular-system): user, role, permission, and audit log data grids

Commit 12:
feat(angular-content): blog, series, category, and media upload UI

Commit 13:
feat(angular-campaign): flash sale and group buy orchestration UI

Commit 14:
feat(angular-inventory): deep inventory management, PO/SO flows

Commit 15:
chore: system-wide integration, real-time notification hub, Hangfire sync

---

## 4) Implementation governance checklist

Before coding each commit:

1. Confirm API contract and payload assumptions.
2. Confirm z-index and shell math invariants are not violated.
3. Confirm responsive behavior and minimum touch target.
4. Confirm no debug artifact remains in production build.

After each commit:

1. Run unit or integration checks relevant to changed surface.
2. Run FE build and smoke test critical flows.
3. Update progress ledger and blockers.

Blocker policy:

- No bypass for OAuth callback errors.
- No merge if shell overlap still exists.
- No merge if API utilization matrix regresses.

---

## 5) Final outcome target

When all 15 commits are complete:

- React and Angular shells are deterministic, clean, and overlap-free.
- OAuth social and normal auth are stable and measurable.
- All API endpoints are operationally or functionally integrated.
- Campaign, checkout, inventory, and background automation behave as one coherent system.
