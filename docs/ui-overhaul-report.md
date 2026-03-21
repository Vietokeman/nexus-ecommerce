# React UI Overhaul Report

Date: 2026-03-18

## API Catalog Reference

- Tai lieu tong hop API theo tung service: [docs/service-api-catalog.md](docs/service-api-catalog.md)
- Muc dich: tra cuu full endpoint + cong dung endpoint de phuc vu thiet ke luong UI va nang cap he thong.

## Phase 2 - Core Primitive Components (Atoms)

- Status: completed
- UI checklist:
  - Added reusable premium primitives: PremiumButton, PremiumInput, PremiumBadge, PremiumCheckbox, PremiumTooltip.
  - Added primitive barrel export and migrated key auth/cart/product/layout flows to primitives.
- Logic verification:
  - TypeScript compile passed.
  - Vite production build passed.
- Recommended commit command:
  - git add . && git commit -m "feat(ui): introduce premium primitive component system"

## Phase 3 - Layout and Shell Modernization

- Status: completed
- UI checklist:
  - Upgraded RootLayout spacing, glass treatment, nav interactions, and responsive container rhythm.
  - Replaced static tooltip usages with premium tooltip variants where updated.
  - Migrated vh-sensitive shell heights to 100dvh where changed.
- Logic verification:
  - Navigation and outlet rendering unchanged.
  - Build passed after layout refactor.
- Recommended commit command:
  - git add . && git commit -m "refactor(layout): modernize shell, navbar, and responsive spacing"

## Phase 4 - Product Discovery Surfaces

- Status: completed
- UI checklist:
  - Upgraded product card interactions with premium button and checkbox controls.
  - Improved HomePage panel behavior for mobile viewport stability and premium CTA styling.
  - Refined product details controls for quantity, cart actions, and wishlist toggles.
- Logic verification:
  - Add-to-cart and wishlist handlers preserved.
  - Build passed with unchanged route behavior.
- Recommended commit command:
  - git add . && git commit -m "refactor(products): premium interactions for listing and details surfaces"

## Phase 5 - Cart and Checkout Experience

- Status: completed
- UI checklist:
  - Refined CartDrawer to premium badge/button controls and icon-based placeholders.
  - Migrated cart page CTA and item removal action to premium buttons.
  - Updated checkout form fields to premium input components and harmonized action styling.
- Logic verification:
  - Quantity, remove, and checkout logic preserved.
  - Build passed after migration.
- Recommended commit command:
  - git add . && git commit -m "refactor(cart): polish drawer, cart, and checkout interactions"

## Phase 6 - State Feedback (Loading, Empty, Error)

- Status: completed
- UI checklist:
  - Replaced circular spinner pattern with shimmer-based loading component.
  - Upgraded EmptyState and ErrorFallback with premium surfaces and CTA controls.
  - Applied loading-state visual parity to selected auth/payment callback flows.
- Logic verification:
  - Error boundaries and fallback behavior unchanged.
  - Build passed after loading-state updates.
- Recommended commit command:
  - git add . && git commit -m "feat(ui-feedback): premium loading, empty, and error states"

## Phase 7 - Auth Flow Cohesion

- Status: completed
- UI checklist:
  - Migrated Login, Signup, Forgot Password, Reset Password, OTP flows to premium input/button primitives.
  - Updated auth layout spacing and 100dvh usage for mobile-safe viewport behavior.
  - Kept validation and submission flows intact while improving visual hierarchy.
- Logic verification:
  - Existing react-hook-form validation behavior preserved.
  - Build passed for all auth pages.
- Recommended commit command:
  - git add . && git commit -m "refactor(auth): unify premium form controls and responsive auth layout"

## Phase 8 - Edge and Recovery Screens

- Status: completed
- UI checklist:
  - Upgraded NotFound, payment success/cancel, and order success screens with premium cards and CTAs.
  - Removed emoji-based labels/placeholders from updated recovery and seller surfaces.
  - Improved typography and action hierarchy on confirmation pages.
- Logic verification:
  - Route destinations and onClick navigation preserved.
  - Build passed after updates.
- Recommended commit command:
  - git add . && git commit -m "refactor(edge-ui): premiumize not-found and checkout result screens"

## Phase 9 - Motion and Interaction Language

- Status: completed
- UI checklist:
  - Updated global motion variants to spring-based reveal choreography.
  - Added magnetic micro-hover physics for premium button primitive with safe motion values.
  - Retuned toast presentation and shell-level transition consistency.
- Logic verification:
  - No business logic coupling to animation layer.
  - Build passed with motion updates.
- Recommended commit command:
  - git add . && git commit -m "feat(motion): apply spring interaction language and tactile microphysics"

## Phase 10 - Final Integration and Validation

- Status: completed
- UI checklist:
  - Consolidated token/theme/global-css foundation and ensured compatibility with existing nexus key usage.
  - Resolved all compile-time regressions introduced during migration.
  - Completed final production build verification.
- Logic verification:
  - Last validation command: npm run build
  - Result: success (TypeScript and Vite build completed)
- Recommended commit command:
  - git add . && git commit -m "chore(ui-overhaul): finalize phases 2-10 with clean production build"

## Angular AdminClient - Premium Deep Sweep

- Status: in progress (global pass complete, page-level expansion started)
- UI checklist:
  - Added global premium skin layer for Angular AdminClient in `src/WebApps/Angular.AdminClient/src/scss/_premium-overhaul.scss`.
  - Imported premium stylesheet in `src/WebApps/Angular.AdminClient/src/scss/styles.scss`.
  - Upgraded layout shell and nav styling hooks in default layout/header/footer templates and styles.
  - Applied premium structural classes to dashboard and core CRUD index pages: users, roles, posts, post-categories, series.
  - Added responsive toolbar/filter/grid hook styles for PrimeNG list screens.
- Logic verification:
  - Angular validation command: `npx ng build --configuration production --no-progress`
  - Result: success
  - Notes: one existing selector warning from third-party styles (`.form-floating>~label`) and one existing CommonJS warning from `quill-delta`.
- Modified files (Angular pass):
  - `src/WebApps/Angular.AdminClient/src/scss/_premium-overhaul.scss`
  - `src/WebApps/Angular.AdminClient/src/scss/styles.scss`
  - `src/WebApps/Angular.AdminClient/src/app/containers/default-layout/default-layout.component.html`
  - `src/WebApps/Angular.AdminClient/src/app/containers/default-layout/default-layout.component.scss`
  - `src/WebApps/Angular.AdminClient/src/app/containers/default-layout/default-header/default-header.component.html`
  - `src/WebApps/Angular.AdminClient/src/app/containers/default-layout/default-header/default-header.component.scss`
  - `src/WebApps/Angular.AdminClient/src/app/containers/default-layout/default-footer/default-footer.component.html`
  - `src/WebApps/Angular.AdminClient/src/app/views/dashboard/dashboard.component.html`
  - `src/WebApps/Angular.AdminClient/src/app/views/system/users/user.component.html`
  - `src/WebApps/Angular.AdminClient/src/app/views/system/roles/role.component.html`
  - `src/WebApps/Angular.AdminClient/src/app/views/content/posts/post.component.html`
  - `src/WebApps/Angular.AdminClient/src/app/views/content/post-categories/post-category.component.html`
  - `src/WebApps/Angular.AdminClient/src/app/views/content/series/series.component.html`
  - `docs/ui-overhaul-report.md`
- Exact commit commands used for Angular sweep:
  - `git add src/WebApps/Angular.AdminClient/src/scss/_premium-overhaul.scss src/WebApps/Angular.AdminClient/src/scss/styles.scss src/WebApps/Angular.AdminClient/src/app/containers/default-layout/default-layout.component.html src/WebApps/Angular.AdminClient/src/app/containers/default-layout/default-layout.component.scss src/WebApps/Angular.AdminClient/src/app/containers/default-layout/default-header/default-header.component.html src/WebApps/Angular.AdminClient/src/app/containers/default-layout/default-header/default-header.component.scss src/WebApps/Angular.AdminClient/src/app/containers/default-layout/default-footer/default-footer.component.html src/WebApps/Angular.AdminClient/src/app/views/dashboard/dashboard.component.html src/WebApps/Angular.AdminClient/src/app/views/system/users/user.component.html src/WebApps/Angular.AdminClient/src/app/views/system/roles/role.component.html src/WebApps/Angular.AdminClient/src/app/views/content/posts/post.component.html src/WebApps/Angular.AdminClient/src/app/views/content/post-categories/post-category.component.html src/WebApps/Angular.AdminClient/src/app/views/content/series/series.component.html docs/ui-overhaul-report.md`
  - `git commit -m "feat(ui-angular): apply premium global skin and core admin page hooks"`

## API-Service Scenario and UI Flow Blueprint (2026-03-22)

### Scope and intent

- Muc tieu section nay: dua ra 1 kich ban North Star end-to-end dua tren service/API hien co, de team doc va nang cap UI/UX co dinh huong nghiep vu ro rang.
- Nguon mapping: he service trong [src/Services](src/Services), gateway o [src/APIGateWays/OcelotApiGw/ocelot.json](src/APIGateWays/OcelotApiGw/ocelot.json), web client o [src/WebApps/React.Client/src](src/WebApps/React.Client/src), admin client o [src/WebApps/Angular.AdminClient/src](src/WebApps/Angular.AdminClient/src).

### Service map used for UX design

- Entry point: Ocelot Gateway (port 5000).
- Identity and auth: Identity.API.
- Browse and product detail: Product.API + Seller.API + Inventory.Product.API.
- Cart and checkout: Basket.API + Ordering.API + Payment.API.
- Promotion layers: FlashSale.API and GroupBuy.API.
- Operational/admin: Admin.API + Hangfire.API.
- AI-assist: Nexus.AI.Service.

### North Star scenario (single primary flow)

#### Scenario name

- Guest -> Customer -> Paid order -> Post-order tracking and review.

#### Business sequence

1. Guest vao trang chu, xem danh sach san pham va chi tiet san pham.
2. Guest dang ky/dang nhap (Identity) de tro thanh Customer.
3. Customer them san pham vao gio, tien hanh checkout.
4. System tao order va tao payment link, customer thanh toan thanh cong.
5. Customer quay ve trang ket qua, theo doi don va de lai review.

#### API chain (implementation-facing)

1. Auth:

- POST /api/auth/register
- POST /api/auth/login

2. Discovery:

- GET /api/products
- GET /api/products/{id}
- GET /api/reviews/product/{productId}

3. Cart:

- GET /api/baskets/{username}
- POST /api/baskets

4. Checkout + Order + Payment:

- POST /api/baskets/checkout
- POST /api/payment/create
- POST /api/payment/payos-callback (from provider)

5. Post-order:

- GET /api/v1/orders/{username}
- GET /api/v1/orders/{id}
- POST /api/reviews

### UI flow (screen-by-screen)

#### Customer web (React)

1. HomePage:

- Hero + search + category filter + product grid.
- Action chinh: Open Product Details, Add to Cart quick action.

2. ProductDetailsPage:

- Gallery, pricing, stock state, reviews, related products.
- Action chinh: Add to Cart, Add to Wishlist, Buy Now.

3. Auth stack:

- Login, Signup, OTP, Forgot/Reset password, OAuth callback.
- Requirement UX: mot visual language cho toan bo auth form + clear error mapping.

4. CartPage:

- Cart items, quantity editor, subtotal, shipping hint, CTA checkout.

5. CheckoutPage:

- Shipping info, payment method, order summary, legal confirmation.
- Requirement UX: anti-double-submit + loading and timeout state ro rang.

6. Payment result pages:

- Success/Cancel pages with explicit next actions.

7. Orders and tracking:

- Order list, order detail, timeline/tracking, re-order CTA.

8. Review submission:

- Inline modal/form sau khi order status du dieu kien.

#### Seller workspace (React)

1. SellerDashboardPage: KPI tong quan, don moi, review moi.
2. SellerProductsPage: CRUD danh sach san pham.
3. SellerCreateProductPage: form tao san pham + preview AI content.
4. ReviewsManagement: tra loi review va xu ly uy tin gian hang.

#### Admin workspace (Angular)

1. Dashboard: health/KPI/revenue snapshots.
2. User management: CRUD user, assign roles.
3. Role and permission management.
4. Content/media and audit logs.
5. Promotion operations:

- Flash sale session lifecycle.
- Group buy campaign lifecycle.

### Recommended UX contracts by role

- Guest:
  - Khong bi chan browse.
  - Bi chan cac action co state mutation (cart/checkout/review) bang prompt auth thong minh.
- Customer:
  - Mot hanh trinh mua lien mach: discover -> cart -> checkout -> payment -> tracking.
- Seller:
  - Toi uu thao tac CRUD + analytics + AI assist.
- Admin:
  - Tap trung governance: user/role/audit/operations.

### Known risks from current behavior (for next upgrade)

1. Gateway timeout co the xay ra o luong auth/checkout khi downstream cham.
2. Dotnet watch trong container dev da tung gay instability; nen uu tien run mode on dinh cho critical services.
3. Angular admin can bo nho lon de build/serve on dinh trong Docker.
4. Toast/state feedback da duoc cai tien, nhung can tiep tuc chuan hoa taxonomy theo domain action.

### Upgrade backlog derived from this scenario

1. Flow reliability:

- Add client-side timeout/retry policy per endpoint group.
- Add idempotency key for checkout and payment-create.

2. UX consistency:

- Chuan hoa loading/empty/error cho tat ca critical screens trong scenario North Star.
- Chuan hoa action feedback sau payment callback (pending, success, failed, delayed callback).

3. Observability for UI flows:

- Them correlation-id hien thi trong error boundary/toast cho support debug.
- Mapping event telemetry theo step cua North Star scenario.

### Decision for next phase

- De xuat dung scenario tren lam baseline cho "Phase UX-Operations Alignment":
  1. Chot contract API theo step.
  2. Chot state machine UI theo step.
  3. Implement theo thu tu Customer flow -> Seller flow -> Admin operations.
