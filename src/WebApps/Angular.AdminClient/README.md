# Angular.AdminClient

Dedicated admin web application for Nexus Commerce. This project was migrated from the CMS CoreUI admin shell, then trimmed to keep only the generic admin capabilities that fit Nexus.

## Purpose

- Separate admin operations from `React.Client`.
- Reuse the mature CoreUI Angular layout from CMS.
- Keep only common back-office domains for Nexus:
  - dashboard
  - users
  - roles and permissions
  - post categories
  - posts
  - series
  - media upload
	- audit logs
	- payments
	- products
	- sellers

Out of scope for this app:

- login UI from CMS
- token refresh/auth flow from CMS
- royalty/loyalty features
- demo widget pages

## Stack

- Angular 18
- CoreUI Angular 5
- PrimeNG 18
- RxJS 7
- NSwag TypeScript client generation
- Quill editor for post content

## Run

```powershell
cd src/WebApps/Angular.AdminClient
npm install
npm start
```

Default local URL:

- `http://localhost:4201`

When the full platform runs through Docker Compose, the admin client still talks to the gateway base URL:

- `http://localhost:5000`

## Build

```powershell
cd src/WebApps/Angular.AdminClient
npm run build-prod
```

Validated result:

- production build succeeds
- current warning: `quill` pulls `quill-delta` as CommonJS

## API integration

Generated client file:

- `src/app/api/admin-api.service.generated.ts`
- `src/app/api/gateway-api.service.generated.ts` (optional, generated from gateway swagger)

The app points to the gateway by default:

- `src/environments/environment.ts` -> `API_URL = http://localhost:5000`

Gateway route:

- `/api/admin/*` -> `Admin.API`

## Regenerate NSwag client

`nswag-admin.json` is configured against the dev `Admin.API` Swagger endpoint.

```powershell
cd src/WebApps/Angular.AdminClient
npm run nswag-admin
```

Generate cross-service clients from API Gateway swagger:

```powershell
cd src/WebApps/Angular.AdminClient
npm run nswag-gateway
```

Expected backend Swagger URL:

- `http://localhost:6014/swagger/v1/swagger.json`

## Project structure

```text
src/app/
	api/                 generated NSwag clients and DTOs
	containers/          CoreUI shell layout, header, footer, side nav
	icons/               icon subset used by the app shell
	shared/              constants, directive, services, reusable utilities
	views/
		dashboard/         Nexus admin overview page
		system/            users, roles, permissions
		content/           categories, posts, series
		audit-logs/        system activity monitoring
		payments/          payment operation checks
		products/          product catalog operations
		sellers/           seller product operations
```

## What is the “core UI” here?

The reusable admin shell comes from CoreUI:

- layout container
- sidebar navigation
- header/footer shell
- responsive grid and cards
- form primitives and admin page composition

Nexus keeps that shell, but the actual business pages and API wiring are now tailored to `Admin.API`.

## Learning guide

See the Angular walkthrough here:

- `src/docs/ANGULAR_ADMIN_CLIENT_LEARNING_GUIDE.md`

That guide explains:

- how this Angular app is organized
- which frameworks are being used
- what NSwag does in this project
- where the core layout lives
- how views talk to generated API clients
