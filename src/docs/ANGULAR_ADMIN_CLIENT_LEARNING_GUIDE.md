# Angular Admin Client Learning Guide

This document explains Angular through the actual `Angular.AdminClient` project inside Nexus Commerce.

## 1. What this project is

`Angular.AdminClient` is the separated admin web application for Nexus.

It was migrated from the CMS admin UI, but trimmed so it only keeps the reusable back-office capabilities that make sense for Nexus:

- dashboard
- user management
- role and permission management
- content categories
- posts
- series
- media upload

It intentionally does not include the old CMS login and royalty flows.

## 2. Frameworks and libraries used

### Angular

Angular is the application framework.

In this project Angular provides:

- modules
- routing
- components
- forms
- dependency injection
- HTTP integration

### CoreUI

CoreUI is the admin layout and UI shell framework.

It provides:

- sidebar
- header/footer
- grid layout
- cards
- admin-friendly visual primitives

CoreUI is the main “core UI” layer in this project.

### PrimeNG

PrimeNG is used for richer admin interactions:

- dialogs
- confirmation popups
- toast messages
- inputs and tables in some views

### NSwag

NSwag generates TypeScript API clients from the backend Swagger document.

In this project it generates:

- strongly typed API client classes
- request DTO classes
- response DTO classes

Output file:

- `src/app/api/admin-api.service.generated.ts`

### Quill

Quill is used as the editor foundation for post content editing.

## 3. How the app is structured

Main folders:

```text
src/app/
  api/
  containers/
  icons/
  shared/
  views/
```

### `api/`

This contains the generated NSwag client.

What to learn here:

- Angular services can be generated, not always hand-written.
- Components call these generated clients directly.
- DTO classes let you see exactly what payload the backend expects.

### `containers/`

This is the application shell.

Important file group:

- `default-layout/*`

This is where the reusable admin frame lives:

- header
- footer
- sidebar nav
- router outlet host

If you want to understand “core UI”, start here.

### `shared/`

This folder contains reusable pieces used across multiple features.

Examples:

- constants
- permission directive
- token storage service
- utility service
- validation message component

This is the closest thing to the app’s front-end infrastructure layer.

### `views/`

This contains feature pages.

Current feature groups:

- `dashboard/`
- `system/`
- `content/`

This is where business pages live.

## 4. Angular concepts mapped to this project

### Module

An Angular module groups related components and dependencies.

Examples in this project:

- `dashboard.module.ts`
- `system.module.ts`
- `content.module.ts`

What to observe:

- each module imports the UI libraries it needs
- each module owns a feature slice

### Routing

Routing decides which page renders for a URL.

Main app routes:

- `/dashboard`
- `/system/users`
- `/system/roles`
- `/content/post-categories`
- `/content/posts`
- `/content/series`

Where to learn it:

- `src/app/app-routing.module.ts`
- feature routing files under each `views/*` folder

### Component

A component is a page or reusable UI unit.

Typical component structure:

- `.ts` for logic
- `.html` for template
- optional `.scss` for styles

Good learning examples:

- `views/system/users/user.component.ts`
- `views/content/posts/post.component.ts`
- `containers/default-layout/default-layout.component.ts`

### Service

Services hold reusable logic or API communication.

Examples:

- generated API clients in `api/`
- `AlertService`
- `TokenStorageService`
- `UtilityService`

### Reactive forms

Forms are built in code and bound to templates.

Good examples:

- `user-detail.component.ts`
- `role-detail.component.ts`
- `post-detail.component.ts`

Learn these pieces:

- `FormGroup`
- `FormControl`
- validators
- dialog-based edit flows

## 5. How a page talks to the backend

Typical flow in this project:

1. A view component injects a generated NSwag client.
2. The component calls a typed method like `getAllUsersPaging(...)`.
3. The response is mapped directly into the page state.
4. Dialogs are used for create/update flows.
5. Success/error feedback goes through the alert service.

Example pages to study:

- `views/system/users/user.component.ts`
- `views/system/roles/role.component.ts`
- `views/content/post-categories/post-category.component.ts`
- `views/content/posts/post.component.ts`

## 6. What NSwag is doing here

`nswag-admin.json` points to the Swagger document of `Admin.API`.

Input:

- `http://localhost:6014/swagger/v1/swagger.json`

Output:

- `src/app/api/admin-api.service.generated.ts`

Why this matters:

- no hand-written HTTP boilerplate for each endpoint
- request/response contracts stay aligned with backend Swagger
- DTO changes become visible in one generated file

When to regenerate:

- after backend endpoint changes
- after request/response model changes
- after adding a new admin controller

Command:

```powershell
cd src/WebApps/Angular.AdminClient
npm run nswag-admin
```

## 7. What the current core layout is

If your goal is to understand the reusable admin frame, read these in order:

1. `src/app/app.module.ts`
2. `src/app/app-routing.module.ts`
3. `src/app/containers/default-layout/default-layout.component.ts`
4. `src/app/containers/default-layout/_nav.ts`

That sequence shows:

- how the app starts
- how the shell is mounted
- how the left navigation is defined
- how feature pages are placed inside the shell

## 8. Suggested learning order

If you want to learn Angular through this project as a senior engineer would read it:

1. Start with the shell and routing.
2. Move to one feature list page like users or posts.
3. Read the matching detail dialog page.
4. Inspect the generated NSwag client used by that page.
5. Open the corresponding `Admin.API` controller and compare both sides.

Recommended first path:

1. `app-routing.module.ts`
2. `containers/default-layout/_nav.ts`
3. `views/system/users/user.component.ts`
4. `views/system/users/user-detail.component.ts`
5. `src/Services/Admin.API/Controllers/UserController.cs`

## 9. Current architectural limitations

This admin stack is in a stabilization phase.

Current decisions:

- backend admin data is still in-memory
- auth UI from CMS is intentionally removed
- admin user permissions are seeded client-side for now

This is acceptable for the migration phase because the immediate goal is:

- stabilize contracts
- separate the admin app from the customer web app
- keep only the Nexus-relevant admin surface

## 10. What to improve next

Natural next steps for learning and production hardening:

1. Replace in-memory `Admin.API` data with persistent storage.
2. Regenerate NSwag after every backend contract refinement.
3. Add real identity integration for admin authentication.
4. Add Angular unit tests around dialogs, list pages, and permission behavior.
5. Split generated API client if it becomes too large.
