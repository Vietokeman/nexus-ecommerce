\set ON_ERROR_STOP on
\echo '[AUDIT] Cross-service consistency audit started'

\connect postgres
CREATE EXTENSION IF NOT EXISTS dblink;

DROP TABLE IF EXISTS tmp_orders_order_no;
CREATE TEMP TABLE tmp_orders_order_no AS
SELECT order_no
FROM dblink(
  'dbname=OrderDb host=localhost user=admin password=change_me_with_postgres_password port=5432',
  'SELECT "OrderNo" AS order_no FROM "Orders"'
) AS t(order_no text);

DROP TABLE IF EXISTS tmp_products_no;
CREATE TEMP TABLE tmp_products_no AS
SELECT product_no
FROM dblink(
  'dbname=ProductDb host=localhost user=admin password=change_me_with_postgres_password port=5432',
  'SELECT "No" AS product_no FROM "CatalogProducts"'
) AS t(product_no text);

DROP TABLE IF EXISTS tmp_inventory_item_no;
CREATE TEMP TABLE tmp_inventory_item_no AS
SELECT item_no
FROM dblink(
  'dbname=InventoryDb host=localhost user=admin password=change_me_with_postgres_password port=5432',
  'SELECT "ItemNo" AS item_no FROM "WarehouseStocks"'
) AS t(item_no text);

SELECT
  'PaymentTransactions.OrderNo missing in OrderDb.Orders' AS check_name,
  COUNT(*) AS fail_count
FROM dblink(
  'dbname=PaymentDb host=localhost user=admin password=change_me_with_postgres_password port=5432',
  'SELECT "OrderNo" AS order_no FROM "PaymentTransactions"'
) AS payment(order_no text)
LEFT JOIN tmp_orders_order_no orders_ref ON payment.order_no = orders_ref.order_no
WHERE orders_ref.order_no IS NULL;

SELECT
  'WarehouseStocks.ItemNo missing in ProductDb.CatalogProducts.No' AS check_name,
  COUNT(*) AS fail_count
FROM tmp_inventory_item_no stocks
LEFT JOIN tmp_products_no products ON stocks.item_no = products.product_no
WHERE products.product_no IS NULL;

SELECT
  'FlashSaleItems.ProductNo missing in ProductDb.CatalogProducts.No' AS check_name,
  COUNT(*) AS fail_count
FROM dblink(
  'dbname=FlashSaleDb host=localhost user=admin password=change_me_with_postgres_password port=5432',
  'SELECT "ProductNo" AS product_no FROM "FlashSaleItems"'
) AS fs(product_no text)
LEFT JOIN tmp_products_no products ON fs.product_no = products.product_no
WHERE products.product_no IS NULL;

SELECT
  'GroupBuyCampaigns.ProductNo missing in ProductDb.CatalogProducts.No' AS check_name,
  COUNT(*) AS fail_count
FROM dblink(
  'dbname=GroupBuyDb host=localhost user=admin password=change_me_with_postgres_password port=5432',
  'SELECT "ProductNo" AS product_no FROM "GroupBuyCampaigns"'
) AS gb(product_no text)
LEFT JOIN tmp_products_no products ON gb.product_no = products.product_no
WHERE products.product_no IS NULL;

\echo '[AUDIT] Cross-service consistency audit completed'
