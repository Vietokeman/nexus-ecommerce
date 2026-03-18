# Admin.API

`Admin.API` is the dedicated admin microservice for Nexus Commerce.

## Purpose

It exposes a shared back-office surface for the separated Angular admin application.

Current scope:

- users
- roles and permissions
- post categories
- posts
- series
- media upload

Intentionally out of scope:

- customer-facing web flows
- CMS login/token endpoints
- royalty/loyalty features

## Current implementation phase

This service currently uses an in-memory store.

Reason:

- stabilize admin contracts quickly
- finish UI separation from the customer app
- keep migration risk low before introducing persistence

## Routes

- `GET /api/admin/user/paging`
- `GET /api/admin/user/{id}`
- `POST /api/admin/user`
- `PUT /api/admin/user/{id}`
- `DELETE /api/admin/user`
- `GET /api/admin/role/all`
- `GET /api/admin/role/paging`
- `GET /api/admin/role/{id}`
- `PUT /api/admin/role/permissions`
- `GET /api/admin/post-category`
- `GET /api/admin/post-category/paging`
- `GET /api/admin/post/paging`
- `GET /api/admin/post/{id}`
- `GET /api/admin/series/paging`
- `GET /api/admin/series/{id}`
- `POST /api/admin/media`
- `GET /health`

## Local run

```powershell
cd src/Services/Admin.API
dotnet run
```

Default dev port in compose override:

- `6014`

Swagger:

- `http://localhost:6014/swagger/index.html`

## Gateway

Ocelot forwards admin routes through:

- `/api/admin/*`

That lets `Angular.AdminClient` consume the service through the platform gateway at `http://localhost:5000`.
