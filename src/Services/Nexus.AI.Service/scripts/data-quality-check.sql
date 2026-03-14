-- Nexus AI data quality checks for pgvector store

SELECT COUNT(*) AS total_vectors FROM product_vectors;

SELECT COUNT(*) AS vectors_without_embedding
FROM product_vectors
WHERE "Embedding" IS NULL;

SELECT "ProductNo", COUNT(*) AS duplicates
FROM product_vectors
GROUP BY "ProductNo"
HAVING COUNT(*) > 1;

SELECT COUNT(*) AS invalid_price_rows
FROM product_vectors
WHERE "Price" < 0;

SELECT COUNT(*) AS empty_name_rows
FROM product_vectors
WHERE "Name" IS NULL OR btrim("Name") = '';
