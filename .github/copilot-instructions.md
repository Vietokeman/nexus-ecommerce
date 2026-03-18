# Nexus Commerce - Copilot Instructions

## Project Overview

**Nexus Commerce** is a distributed e-commerce microservices platform built with:

- **Backend:** ASP.NET Core 8.0 (C#, .NET 8)
- **Frontend:** React 19 + Vite 6 + TailwindCSS v4
- **Architecture:** Microservices + CQRS + Event-Driven
- **API Gateway:** Ocelot
- **Message Broker:** RabbitMQ
- **Databases:** PostgreSQL (PostGIS), Redis
- **Observability:** Elasticsearch + Kibana + Serilog
- **Containerization:** Docker + Docker Compose

---

## Code Generation Guidelines

### 1. Backend (.NET Microservices)

When generating or modifying backend code:

- ✅ **Follow Clean Architecture:**
  - Domain layer: Entities, Value Objects, Domain Events (NO dependencies)
  - Application layer: Commands, Queries, Handlers (CQRS)
  - Infrastructure layer: Repositories, External services
  - API layer: Controllers, Middleware

- ✅ **Use CQRS Pattern:**

  ```csharp
  // Commands for writes
  public record CreateProductCommand(string Name, decimal Price);

  // Queries for reads
  public record GetProductQuery(Guid Id);

  // Handlers return Result<T>
  public class CreateProductHandler : IRequestHandler<CreateProductCommand, Result<Product>>
  ```

- ✅ **Service Communication:**
  - HTTP calls for synchronous queries
  - RabbitMQ events for asynchronous commands
  - Never access another service's database directly

- ✅ **Database per Service:**
  - ProductDb, CustomerDb, OrderDb, etc.
  - Each service owns its schema

- ✅ **Repository Pattern:**
  - Interfaces in Domain layer
  - Implementations in Infrastructure layer
  - Always use async methods with CancellationToken

- ✅ **Validation:**
  - Use FluentValidation for input validation
  - Domain logic validation in entities/aggregates

- ✅ **Logging:**
  - Use Serilog with structured logging
  - Include correlation IDs
  - Log to Elasticsearch

### 2. Frontend (React)

When generating or modifying frontend code:

- ✅ **Component Structure:**
  - Use functional components with hooks
  - Extract reusable logic to custom hooks
  - Organize by feature, not technical layer

- ✅ **Performance:**
  - Lazy load heavy components
  - Use React.memo() for expensive components
  - Implement virtualization for long lists
  - Avoid barrel imports from Material-UI

- ✅ **Data Fetching:**
  - Use TanStack Query (React Query) for all API calls
  - Configure staleTime and cacheTime appropriately
  - Implement optimistic updates for mutations
  - Prefetch data on user intent (hover, route change)

- ✅ **State Management:**
  - Zustand for global state
  - React Query for server state
  - Local state for component-specific data

- ✅ **Styling:**
  - TailwindCSS v4 for utility classes
  - Material-UI for complex components
  - CSS modules for component-specific styles

- ✅ **TypeScript:**
  - Always use TypeScript
  - Define proper types for API responses
  - Avoid `any` type

### 3. API Gateway (Ocelot)

- ✅ **Route Configuration:**
  - Define routes in `ocelot.json`
  - Use rate limiting for all public endpoints
  - Enable QoS (circuit breaker) for downstream services
  - Cache GET requests when appropriate

- ✅ **Required Packages:**
  ```xml
  <PackageReference Include="Ocelot" Version="23.0.0" />
  <PackageReference Include="Ocelot.Provider.Polly" Version="23.0.0" />
  <PackageReference Include="Ocelot.Cache.CacheManager" Version="23.0.0" />
  ```

### 4. Docker Configuration

- ✅ **Use Minimal Dev Setup for development:**

  ```bash
  docker compose -f docker-compose.dev-minimal.yml up -d
  ```

- ✅ **Container Naming:**
  - Use `src-` prefix: `src-product-api`, `src-ocelot-apigw`

- ✅ **Image Naming:**
  - Organize under `src/` folder: `src/product-api:latest`

- ✅ **Multi-Stage Dockerfiles:**
  - Build stage with SDK image
  - Final stage with runtime image only

---

## File Organization

### Backend Service Structure

```
Services/[ServiceName].API/
├── Controllers/           # API endpoints
├── Entities/             # Domain entities
├── Repositories/         # Data access
├── Services/             # Business logic
├── Extensions/           # DI configuration
├── appsettings.json
├── Dockerfile
└── Program.cs
```

### Frontend Structure

```
src/
├── components/           # Reusable UI components
├── features/            # Feature-based modules
├── hooks/               # Custom React hooks
├── lib/                 # API client, utilities
├── routes/              # Route configuration
├── store/               # Global state (Zustand)
└── types/               # TypeScript types
```

---

## Skills & Best Practices

Reference these architectural guides when working with the codebase:

### Backend Skills

📚 **[Microservices Architecture](../.ai/backend-skills/microservices-architecture.md)**

- Service design patterns
- API Gateway configuration
- Event-driven communication
- Data management strategies
- Resilience patterns
- Observability & monitoring

### Frontend Skills

📚 **[React Performance Optimization](../.ai/frontend-skills/react-performance-optimization.md)**

- Bundle size optimization
- Data fetching strategies
- Re-render optimization
- Component performance
- Vite configuration

---

## Common Tasks

### Add New Microservice

1. Create service project:

   ```bash
   dotnet new webapi -n [ServiceName].API -o Services/[ServiceName].API
   ```

2. Add to solution:

   ```bash
   dotnet sln add Services/[ServiceName].API/[ServiceName].API.csproj
   ```

3. Add Dockerfile (use multi-stage build)

4. Add service to `docker-compose.yml` and `docker-compose.override.yml`

5. Configure routes in `APIGateWays/OcelotApiGw/ocelot.json`

6. Add health checks

### Add New React Feature

1. Create feature folder:

   ```
   src/features/[feature-name]/
   ├── components/
   ├── hooks/
   ├── api.ts
   └── types.ts
   ```

2. Add routes in `src/routes/index.tsx`

3. Create API client functions in `api.ts`

4. Use React Query for data fetching

5. Add to navigation if needed

---

## Technology Versions

| Technology    | Version  | Purpose            |
| ------------- | -------- | ------------------ |
| .NET          | 8.0      | Backend framework  |
| React         | 19.x     | Frontend framework |
| Vite          | 6.x      | Build tool         |
| TypeScript    | Latest   | Type safety        |
| TailwindCSS   | 4.x      | Styling            |
| Material-UI   | Latest   | UI components      |
| Ocelot        | 23.0.0   | API Gateway        |
| PostgreSQL    | 16-3.4   | Database           |
| Redis         | Alpine   | Caching            |
| RabbitMQ      | 3-alpine | Message broker     |
| Elasticsearch | 7.17.2   | Logging & search   |

---

## Important Patterns

### ✅ DO

- Use CQRS for backend (Commands for writes, Queries for reads)
- Return `Result<T>` from handlers (not exceptions for business logic)
- Use repository pattern with interfaces in Domain
- Validate with FluentValidation in Application layer
- Use structured logging with Serilog
- Implement health checks for all services
- Use Docker Compose minimal setup for development
- Lazy load heavy React components
- Use React Query for all API calls
- Memoize expensive computations
- Direct imports from Material-UI (not barrel imports)

### ❌ DON'T

- Access another service's database directly
- Use public setters on entities
- Share data models between services
- Hardcode connection strings or secrets
- Import entire libraries (use code splitting)
- Fetch data in useEffect (use React Query)
- Use index as key in lists
- Run all services locally (use minimal setup)

---

## Development Workflow

### Starting Development

```bash
# 1. Start minimal infrastructure
cd src
docker compose -f docker-compose.dev-minimal.yml up -d

# 2. Run specific service from IDE (VS/Rider)
# Open Services/Product.API and press F5

# 3. Run frontend
cd WebApps/React.Client
npm install
npm run dev
```

### Running Full Stack

```bash
# Development mode (hot-reload)
cd src
docker compose up -d

# Production build
cd src
docker compose -f docker-compose.yml build
```

---

## Troubleshooting

### Build Issues

- Clean Docker cache: `docker builder prune -a`
- Rebuild without cache: `docker compose build --no-cache`

### Performance Issues

- Use minimal dev setup (see DOCKER_OPTIMIZATION.md)
- Check RAM usage: `docker stats`
- Prune unused resources: `docker system prune -a`

### Service Communication Issues

- Check API Gateway routes in `ocelot.json`
- Verify service names in Docker network
- Check connection strings in environment variables

---

## References

- [Microservices Architecture Guide](../.ai/backend-skills/microservices-architecture.md)
- [React Performance Guide](../.ai/frontend-skills/react-performance-optimization.md)
- [Docker Optimization Guide](../DOCKER_OPTIMIZATION.md)
- [Quick Start Guide](../QUICK_START_GUIDE.md)
- [Team Development Guide](../TEAM_DEVELOPMENT_GUIDE.md)

---

**Last Updated:** February 2026  
**Maintainer:** Nexus Commerce Team
