# Admin Client & Admin Service Migration Phases

## 1) Goal

Tach trang admin ra khoi `React.Client` thanh mot web rieng `Angular.AdminClient`, tai su dung CoreUI tu CMS, dong thoi bo sung `Admin.API` cho Nexus voi cac chuc nang admin chung.

## 2) Scope for Nexus (keep)

- Dashboard tong quan
- System management: users, roles, role-permissions
- Content management: post categories, posts, series
- Media upload cho bai viet/noi dung

## 3) Out of Scope (remove)

- Login/Auth UI va token flow tu CMS
- Royalty/Loyalty va cac API lien quan
- Cac module demo/widgets khong phuc vu Nexus

## 4) Migration logic

### UI logic

- Lay bo khung CoreUI (layout, nav, pages) tu CMS admin UI.
- Loai route/module login va royalty.
- Chuyen API base sang endpoint admin cua Nexus.
- Giu route theo domain admin chung de de mo rong.

### API logic

- Tao service `Admin.API` rieng trong microservices.
- Route giu tuong thich theo mau CMS (`/api/admin/...`) de UI de map.
- Chi implement nhom endpoint chung cho admin, khong them loyalty.
- Dung in-memory store cho phase dau de chot contract API va tich hop nhanh.

## 5) Delivery phases

### Phase A - Foundation

- Scaffold `Services/Admin.API` va dang ky vao solution.
- Tao models/contracts dung cho users, roles, posts, categories, series.

### Phase B - API Contracts

- Implement controllers:
  - `UserController`
  - `RoleController`
  - `PostCategoryController`
  - `PostController`
  - `SeriesController`
  - `MediaController`
- Bo hoan toan `Auth/Token/Royalty` endpoints.

### Phase C - Angular Admin Client

- Tao `WebApps/Angular.AdminClient` tu bo khung CMS CoreUI.
- Loai auth/login, royalty, widget demo.
- Giu dashboard + system + content pages.

### Phase D - Integration

- Them `admin.api` vao docker compose + override.
- Them route Ocelot cho `/api/admin/*` -> `admin.api`.
- Them `angular.admin.client` service vao compose (chay doc lap voi React app).

### Phase E - Validation and Docs

- Build `Admin.API` va `Angular.AdminClient`.
- Build solution tong.
- Cap nhat README/MD cho kien truc hien tai.
- Commit theo phase voi message ro rang.

## 6) Why this approach

- Giu pham vi gon cho Nexus: admin chung, khong bi day boi module loyalty.
- Co the mo rong backend implementation ve DB that o phase sau ma khong doi contract UI.
- Tach admin app khoi web app de giam coupling va de tri van hanh.

## 7) Current implementation status

### Completed

- `Admin.API` da duoc scaffold thanh microservice .NET 8 rieng.
- `Angular.AdminClient` da duoc tao thanh web app rieng, tach khoi `React.Client`.
- Da cat bo cac module khong thuoc scope Nexus:
  - login/auth UI
  - token refresh flow
  - royalty
  - widget demo
- Da wire compose, gateway, va solution cho `Admin.API`.
- Da chuan hoa dashboard thanh overview page phu hop Nexus thay vi dashboard demo tu CMS.

### Validated

- `dotnet build src/Services/Admin.API/Admin.API.csproj` -> pass
- `npm run build-prod` tai `src/WebApps/Angular.AdminClient` -> pass

### Current phase design note

- Backend admin hien tai dung in-memory store de chot contract nhanh.
- Phase persistence that nen la buoc tiep theo, sau khi UI va route admin da on dinh.
