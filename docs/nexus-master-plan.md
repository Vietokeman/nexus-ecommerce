# Nexus Master Plan

## 0. Muc tieu va nguyen tac toi cao

Tai lieu nay la kim chi nam cho chuong trinh tai cau truc du lieu va UI/UX toan he thong Nexus Commerce.

Phai tuan thu dong thoi 4 bo nguyen tac:
- `.ai/frontend-skills/taste-skill.md`
- `.ai/frontend-skills/soft-skill.md`
- `.ai/frontend-skills/redesign-skill.md`
- `.ai/rules/output-skill.md`

Rang buoc chien luoc:
- Khong dung C# seed data.
- Chi dung SQL script thuan va Bash script orchestration.
- Moi script SQL deu phai xoa sach du lieu truoc khi insert lai.
- Chu de du lieu mau: Qua Tet Cao Cap, phu hop production-demo.
- UI phai tai hien du lieu lon mot cach sang trong, logic, muot, co loading/empty/error state day du.

Trang thai hien tai cua tai lieu:
- Chi la ke hoach tong the.
- Chua thi cong SQL.
- Chua thi cong code UI.

---

## 1. Truc Logic Data Mapping (Database-per-Service)

## 1.1 Nguyen tac mapping

- Moi microservice so huu schema va database rieng.
- Khong co foreign key vat ly xuyen service.
- Lien ket xuyen service dung Reference ID (GUID/int/string business key) va duoc validate qua API/Event.
- Internal FK trong cung 1 database duoc phep dung FK vat ly.
- Dinh danh xuyen service uu tien:
  - User/Seller/Customer/Order/Payment/Session: GUID.
  - Product co the dung `itemNo` (business key) + `id` noi bo.
  - Category uu tien int noi bo trong Product service, khong expose FK vat ly ra ngoai.

## 1.2 Ban do service -> database -> entity

1. Identity.API -> `identity_db`
- Tables chinh: roles, users, user_roles, refresh_tokens, external_logins.
- Ownership: authN/authZ, profile co ban, state verified.

2. Admin.API -> `admin_db`
- Tables chinh: notifications, notification_reads, audit_logs.
- Ownership: thong bao he thong va audit trail.

3. Customer.API -> `customer_db`
- Tables chinh: customers, customer_addresses, customer_preferences.
- Ownership: profile nghiep vu khach hang.

4. Seller.API -> `seller_db`
- Tables chinh: sellers, seller_profiles, seller_reviews, seller_metrics_snapshots.
- Ownership: nghiep vu seller dashboard va seller operations metadata.

5. Product.API -> `product_db`
- Tables chinh: categories, products, product_images, product_attributes, product_reviews.
- Ownership: catalog qua tet, review aggregate source.

6. Inventory.Product.API -> `inventory_db`
- Tables chinh: inventories, stock_movements, reservations.
- Ownership: ton kho va bien dong kho.

7. Basket.API -> `basket_db`
- Tables chinh: baskets, basket_items.
- Ownership: gio hang tam thoi theo user.

8. Ordering (Ordering.API) -> `ordering_db`
- Tables chinh: orders, order_items, order_status_history, shipments.
- Ownership: don hang va vong doi don hang.

9. Payment.API -> `payment_db`
- Tables chinh: payments, payment_transactions, payment_callbacks.
- Ownership: giao dich thanh toan.

10. GroupBuy.API -> `groupbuy_db`
- Tables chinh: campaigns, sessions, session_participants, invites.
- Ownership: group buy campaigns/sessions.

11. FlashSale.API -> `flashsale_db`
- Tables chinh: flash_sale_sessions, flash_sale_items, flash_sale_purchases.
- Ownership: flash deal inventory va purchase gate.

12. Hangfire.API -> `hangfire_db`
- Tables chinh: jobs, state, recurring_jobs (theo schema Hangfire).
- Ownership: scheduling/background jobs.

## 1.3 Xu ly quan he xuyen service

- Product tham chieu seller bang `seller_user_name` hoac `seller_id` (reference only).
- Order tham chieu user, product bang `user_id/user_name` va `item_no`/`product_id` snapshot.
- Payment tham chieu order bang `order_no` + `order_id` (dual key for traceability).
- GroupBuy/FlashSale tham chieu product bang `item_no` va luu snapshot gia ten de dam bao audit.
- Review tham chieu user/product bang reference ID, khong FK xuyen DB.

Dong bo nhat quan du lieu:
- Query dong bo qua HTTP.
- Dong bo bat dong bo qua event bus (RabbitMQ).
- Idempotency key cho payment/group-buy joins.

---

## 2. Chien luoc SQL (Clean and Insert)

## 2.1 Nguyen tac bat buoc cho moi file SQL

Moi script SQL phai theo khung:
1. `BEGIN;`
2. `SET session_replication_role = replica;` (neu can de reset nhanh)
3. `TRUNCATE TABLE ... RESTART IDENTITY CASCADE;` cho toan bo bang phu thuoc trong service do
4. `INSERT ...` theo thu tu dependency
5. `SET session_replication_role = DEFAULT;`
6. `COMMIT;`

Quy tac an toan:
- Khong truncate cross-service DB.
- Moi phase chi tac dong DB service thuoc phase.
- Moi script co checksum log (echo phase + row count sau insert).

## 2.2 Ke hoach row counts du kien (Production-like mock)

1. Identity/API auth
- roles: 6
- users: 35
- user_roles: 45
- refresh_tokens: 35
- external_logins: 10

2. Customer/Seller profile
- customers: 20
- customer_addresses: 55
- sellers: 10
- seller_profiles: 10

3. Product/Inventory
- categories: 8
- products: 30
- product_images: 150
- product_attributes: 240
- inventories: 30
- stock_movements: 180

4. Campaigns
- flash_sale_sessions: 6
- flash_sale_items: 45
- groupbuy_campaigns: 8
- groupbuy_sessions: 24
- groupbuy_participants: 140

5. Basket/Ordering/Payment
- baskets: 20
- basket_items: 80
- orders: 60
- order_items: 180
- order_status_history: 260
- shipments: 50
- payments: 60
- payment_transactions: 85

6. Interactions va admin
- product_reviews: 220
- notifications: 180
- notification_reads: 320
- audit_logs: 900

## 2.3 Cau truc thu muc script de thi cong

- `scripts/sql/phase-01-identity.sql`
- `scripts/sql/phase-02-catalog-inventory.sql`
- `scripts/sql/phase-03-campaigns.sql`
- `scripts/sql/phase-04-transactions.sql`
- `scripts/sql/phase-05-interactions.sql`
- `scripts/init-all-db.sh`

---

## 3. Theme du lieu mau "Qua Tet Cao Cap"

## 3.1 Nhom danh muc

- Banh keo cao cap
- Ruou vang va ruou manh cao cap
- Tra va cafe dac san
- Hat dinh duong qua tet
- Gio qua truyen thong
- Gio qua doanh nghiep
- Vat pham phong thuy tet
- Do trang tri nha tet

## 3.2 Nguyen tac du lieu thuc te

- Product name, summary, highlights co y nghia thuong mai ro rang.
- Gia chia theo tier: economy, premium, luxury.
- Co stock logic theo tung SKU.
- Anh dung nguon placeholder on dinh, uu tien:
  - Unsplash links co chu de food/gift/new year
  - Hoac fallback `https://picsum.photos/seed/{sku}/1200/900`

## 3.3 Distribution tinh huong nghiep vu

- Orders da dang trang thai: Pending, Confirmed, Paid, Shipping, Delivered, Cancelled, Refunded.
- Group buy co session thanh cong/that bai/sap het han.
- Flash sale co item sold-out, item con it, item dang hot.
- Reviews co phan bo sao 1-5 de tao data analytics that.

---

## 4. Ban do UI Overhaul (React + Angular)

## 4.1 Nguyen tac UI/UX ap dung tu 4 skill

- Su dung typography co dac tinh thuong hieu, khong default stack generic.
- Layout uu tien asymmetry co kiem soat, grid va spacing rong.
- Bento-grid cho dashboard/discovery; giant whitespace cho premium sections.
- Soft shadow huong mau nen, bo vien mong, layer depth hop ly.
- Motion co chu dich: stagger reveal, smooth transitions, tactile press.
- Day du loading/empty/error/disabled states.
- Khong pha vo logic nghiep vu hien co.

## 4.2 React Client - man hinh can overhaul

1. Product Discovery cluster
- Home, filters, product cards, flash-sale widget, group-buy highlights.

2. PDP and Campaign cluster
- Product details, review section, flash sale detail, group-buy list/campaign/join.

3. Checkout cluster
- Cart, cart drawer, checkout, payment success/cancel, order success.

4. User cluster
- Profile, wishlist, orders, order tracking, notifications.

5. Shared primitives and states
- PremiumInput/Button/Badge/Tooltip/Checkbox, EmptyState, ErrorFallback, Spinner.

## 4.3 Angular Admin - man hinh can overhaul

1. Admin dashboard
- KPI cards, revenue chart, order funnel, campaign heat blocks.

2. Catalog management
- Product list 30 items, inventory indicators, bulk actions, detail editors.

3. Order and payment operations
- Order board, payment status workflows, dispute/refund handling.

4. Campaign and CRM
- Flash sale control panel, group-buy monitor, user/seller management screens.

5. Design system alignment
- Header/footer/layout shell, typography scale, spacing rhythm, table visuals, form ergonomics.

---

## 5. Lo trinh 15 Phase bat buoc

## Operation A: Backend Data Seeding

### Phase 1 - Core Identity (Identity/Admin/Customer/Seller)
Muc tieu:
- Tao roles, admin users, sellers, customers va profile co nghia.

Deliverables:
- SQL cho identity_db, admin_db, customer_db, seller_db.
- Dataset user da da vai tro va trang thai verified.

Validation:
- Login 4 nhom role thanh cong.
- Notifications/audit co du data hien thi.

### Phase 2 - Catalog and Inventory (Product/API + Inventory)
Muc tieu:
- Tao 8 categories va 30 san pham qua tet chi tiet.

Deliverables:
- SQL products/categories/images/attributes + inventories/stock movements.

Validation:
- Product listing co 30 item, stock theo SKU hop ly.

### Phase 3 - Campaigns (FlashSale/GroupBuy)
Muc tieu:
- Tao campaigns dang Active, co countdown va tien do.

Deliverables:
- SQL flash_sale sessions/items; group_buy campaigns/sessions/participants.

Validation:
- UI campaign hien du cac trang thai Open/Succeeded/Failed.

### Phase 4 - Transactions (Basket/Ordering/Payment)
Muc tieu:
- Tao don hang, gio hang, giao dich thanh toan da dang.

Deliverables:
- SQL baskets, orders, order_items, status history, payments, callbacks.

Validation:
- Order timeline va payment pages hien dung data status.

### Phase 5 - Customer Interactions
Muc tieu:
- Tao reviews/ratings gan voi product Phase 2.

Deliverables:
- SQL product_reviews va aggregate helper records neu can.

Validation:
- PDP review distribution hop ly, dashboard seller co recent reviews.

### Phase 6 - Orchestration Script
Muc tieu:
- Tu dong hoa chay toan bo SQL vao dung container DB.

Deliverables:
- `scripts/init-all-db.sh` dung `docker exec` theo thu tu phase.
- Logging ro phase, service, row count.

Validation:
- 1 lenh khoi tao lai toan bo du lieu thanh cong.

## Operation B: Frontend UI Overhaul

### Phase 7 - React Product Discovery
Scope:
- Catalog page, filter UX, product card architecture, lazy data views.

### Phase 8 - React PDP and Campaigns
Scope:
- Product detail, flash-sale countdown, group-buy progress and invite UX.

### Phase 9 - React Checkout Flow
Scope:
- Cart, checkout summary, payment transitions, success/fail states.

### Phase 10 - React User Dashboard
Scope:
- Orders, tracking, profile, wishlist, notifications center.

### Phase 11 - Angular Admin Dashboard
Scope:
- KPI bento, charts, operational snapshots theo chu de qua tet.

### Phase 12 - Angular Catalog Management
Scope:
- Quan ly 30 product, inventory, status lifecycle.

### Phase 13 - Angular Order Management
Scope:
- Duyet don, payment state machine, refund/dispute actions.

### Phase 14 - Angular Campaign and CRM
Scope:
- Quan ly flash-sale, group-buy, seller, user workflows.

### Phase 15 - Cross-Client Polish and Sync
Scope:
- Dong bo typography, spacing, shadow system, animation timing, empty/error states, table/forms across React + Angular.

Validation tong:
- Hai client nhat quan visual va nghiep vu.
- Khong vo logic su dung du lieu da seed.

---

## 6. Chi tiet thi cong script orchestration (Phase 6)

Nguyen tac script `scripts/init-all-db.sh`:
- Stop on first error (`set -euo pipefail`).
- Detect container names qua environment vars.
- Chay phase theo thu tu bat buoc 1 -> 5.
- Moi phase:
  - copy script vao container (hoac stdin pipe)
  - chay `psql -v ON_ERROR_STOP=1`
  - in row-count summary query
- Ket thuc script in status PASS/FAIL theo phase.

Khong viet implementation o buoc nay.

---

## 7. Data governance va quality gates

1. Referential integrity gate
- Khong FK xuyen service.
- Tat ca reference ID phai ton tai trong dataset nguon.

2. Domain realism gate
- Gia ban, discount, stock, reviews phai hop ly voi boi canh qua tet cao cap.

3. UX data stress gate
- Dam bao du lieu du phong phu de test pagination, filter, sorting, charts, empty-state fallback.

4. Repeatability gate
- Chay script 10 lan lien tiep cho ket qua deterministic.

5. Safety gate
- Scripts chi duoc truncate database dev/local docker.

---

## 8. Deliverable checklist cho giai doan planning

- [x] Dinh nghia truc mapping entity-database theo service.
- [x] Chot chien luoc SQL clean and insert voi `TRUNCATE ... CASCADE`.
- [x] Uoc tinh row counts cho tung cum bang.
- [x] Lap ban do UI overhaul React va Angular.
- [x] Ghi ro cach thi cong 15 phase theo lo trinh bat buoc.
- [x] Chua thuc thi code SQL/UI trong tai lieu nay.

---

## 9. Lenh tiep theo (doi lenh nguoi dung)

Cho den khi nhan lenh:
- "Ke hoach tuyet voi, hay thi cong Phase X"

Thi moi bat dau viet code cho phase tuong ung, dam bao:
- output day du 100%
- test/build check
- commit message ro rang theo phase
