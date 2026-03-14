# Nexus AI pgvector DB Guide

This guide explains how Nexus.AI.Service stores and validates vector data in PostgreSQL + pgvector.

## 1. Database model

Nexus.AI.Service uses a dedicated database `NexusAiDb` and does not share direct data access with other services.

Main tables:
- `product_vectors`: synchronized catalog data with embedding vectors.
- `chat_sessions`: conversation sessions.
- `chat_messages`: persisted user/assistant turns.

Key constraints:
- unique `product_id`
- unique `product_no`
- `embedding` column stored as `vector`

## 2. Docker services

Compose services:
- `nexusaidb`: pgvector image (`pgvector/pgvector:pg16`)
- `nexus.ai.service`: ASP.NET Core AI microservice

Default dev database port mapping:
- host `5436` -> container `5432`

## 3. Verify extension and schema

Connect from host:

```powershell
psql "host=localhost port=5436 dbname=NexusAiDb user=admin password=0977452762Viet" -c "SELECT extname FROM pg_extension WHERE extname='vector';"
```

Check tables:

```powershell
psql "host=localhost port=5436 dbname=NexusAiDb user=admin password=0977452762Viet" -c "\dt"
```

## 4. Data quality checks

Run these checks after product sync:

```sql
-- row count
SELECT COUNT(*) AS total_vectors FROM product_vectors;

-- vectors without embedding
SELECT COUNT(*) AS vectors_without_embedding
FROM product_vectors
WHERE embedding IS NULL;

-- duplicate business keys
SELECT product_no, COUNT(*)
FROM product_vectors
GROUP BY product_no
HAVING COUNT(*) > 1;

-- invalid pricing
SELECT COUNT(*) AS invalid_price_rows
FROM product_vectors
WHERE price < 0;
```

## 5. Similarity validation query

```sql
SELECT
  product_id,
  product_no,
  name,
  1 - (embedding <=> '[0.1,0.2,0.3]'::vector) AS similarity
FROM product_vectors
WHERE embedding IS NOT NULL
ORDER BY embedding <=> '[0.1,0.2,0.3]'::vector
LIMIT 5;
```

Replace the example vector by a real embedding to get meaningful ranking.

## 6. About Python / ONNX / Hugging Face

Current implementation does not require Python and does not require ONNX models from Hugging Face.

Current runtime path:
- embeddings: Semantic Kernel Google connector (`text-embedding-004`)
- chat: Gemini API via Semantic Kernel

If you want an offline or on-prem setup later, you can add an alternative embedding provider using ONNX + Hugging Face models as a separate adapter without changing API contracts.
