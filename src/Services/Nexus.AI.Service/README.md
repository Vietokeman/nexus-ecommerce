# Nexus.AI.Service

A dedicated AI microservice for the Nexus distributed e-commerce platform. The service owns its own PostgreSQL + pgvector database, synchronizes product data through Product.API, stores chat memory locally, and uses Semantic Kernel with Gemini for grounded shopping assistance.

## 🧠 LOGIC ANALYSIS

1. Service isolation
   - Nexus.AI.Service owns a separate database named `NexusAiDb`.
   - Product data is synchronized over HTTP from `Product.API`.
   - No direct cross-service database access is used.
2. Retrieval and grounding
   - Product payloads are normalized into `ProductVector` records.
   - Gemini embeddings are generated and stored as pgvector values.
   - Product lookup uses vector similarity against the local AI catalog.
3. Conversational orchestration
   - Chat sessions and messages are persisted inside the AI service database.
   - Semantic Kernel plugins expose product search and order-support guidance.
   - Gemini can auto-invoke kernel functions when grounded retrieval is needed.
4. Operational safety
   - Admin endpoints are protected by `X-Nexus-AI-Key`.
   - Health checks, Swagger, Docker, and Ocelot routes are wired for the service.

## Phases

### Phase 1. Microservice foundation

[COMMIT: feat(ai): scaffold Nexus.AI.Service with .NET 8 startup, Docker, and repo conventions]
[COMMENT: Replaced the weather-template scaffold with production-aligned startup, configuration binding, health checks, Swagger, and Docker packaging.]

### Phase 2. Persistence model

[COMMIT: feat(ai): add AI database schema for chat memory and product vectors]
[COMMENT: Introduced `ChatSession`, `ChatMessageRecord`, `ProductVector`, and `NexusAiDbContext` with pgvector support.]

### Phase 3. Product synchronization

[COMMIT: feat(ai): sync catalog data from Product.API into pgvector store]
[COMMENT: Added HTTP-based catalog ingestion, embedding generation, upsert logic, and local vector materialization.]

### Phase 4. Semantic retrieval and plugins

[COMMIT: feat(ai): add semantic product search and kernel plugins]
[COMMENT: Added vector similarity search, product-search plugin output, and order-support guidance for grounded responses.]

### Phase 5. Chat orchestration

[COMMIT: feat(ai): implement Gemini chat flow with persistent sessions]
[COMMENT: Added session-aware conversation handling, grounded history reconstruction, and Gemini prompt settings with automatic tool invocation.]

### Phase 6. Platform integration

[COMMIT: feat(ai): wire AI service into compose, Ocelot, and solution files]
[COMMENT: Added dedicated pgvector container, gateway routes, Swagger exposure, development port mapping, and solution registration.]

### Phase 7. Validation and usage docs

[COMMIT: docs(ai): add service usage guide and smoke-test requests]
[COMMENT: Documented the architecture, configuration, and manual request flows required to operate and validate the service.]

## Endpoints

- `POST /api/ai/chat/sessions`
- `GET /api/ai/chat/sessions/{sessionId}`
- `POST /api/ai/admin/sync/products`
- `GET /api/ai/admin/search?query=...&topK=...`
- `GET /health`

## Configuration

- `ConnectionStrings:Database`: AI service database connection string.
- `Ai:Google:ApiKey`: Gemini API key.
- `Ai:Google:ChatModelId`: default Gemini chat model.
- `Ai:Google:EmbeddingModelId`: embedding model used for vector search.
- `Ai:ProductCatalog:BaseUrl`: Product.API base URL for synchronization.
- `Ai:Security:ApiKey`: required admin API key.
- `Ai:Security:HeaderName`: defaults to `X-Nexus-AI-Key`.

## Local development

1. Start the platform with `docker compose up -d` from `src`.
2. Ensure `GOOGLE_AI_API_KEY` and `NEXUS_AI_ADMIN_KEY` are set for the AI service container.
3. Trigger product synchronization before the first chat session.
4. Use the HTTP file in this folder to exercise chat and admin routes.

## Build

The service builds with:

```powershell
dotnet build src/Services/Nexus.AI.Service/Nexus.AI.Service.csproj
```
