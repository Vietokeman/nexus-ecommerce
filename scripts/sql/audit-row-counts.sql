\set ON_ERROR_STOP on
\echo '[AUDIT] Row count audit started'

\connect IdentityDb
SELECT 'IdentityDb.AspNetRoles' AS table_name, COUNT(*) AS row_count FROM "AspNetRoles";
SELECT 'IdentityDb.Users' AS table_name, COUNT(*) AS row_count FROM "Users";
SELECT 'IdentityDb.AspNetUserRoles' AS table_name, COUNT(*) AS row_count FROM "AspNetUserRoles";
SELECT 'IdentityDb.Permissions' AS table_name, COUNT(*) AS row_count FROM "Permissions";
SELECT 'IdentityDb.AspNetUserClaims' AS table_name, COUNT(*) AS row_count FROM "AspNetUserClaims";
SELECT 'IdentityDb.AspNetRoleClaims' AS table_name, COUNT(*) AS row_count FROM "AspNetRoleClaims";

\connect CustomerDb
SELECT 'CustomerDb.Customers' AS table_name, COUNT(*) AS row_count FROM "Customers";

\connect ProductDb
SELECT 'ProductDb.CatalogProducts' AS table_name, COUNT(*) AS row_count FROM "CatalogProducts";

\connect SellerDb
SELECT 'SellerDb.SellerProducts' AS table_name, COUNT(*) AS row_count FROM "SellerProducts";
SELECT 'SellerDb.ProductReviews' AS table_name, COUNT(*) AS row_count FROM "ProductReviews";

\connect InventoryDb
SELECT 'InventoryDb.Warehouses' AS table_name, COUNT(*) AS row_count FROM "Warehouses";
SELECT 'InventoryDb.WarehouseStocks' AS table_name, COUNT(*) AS row_count FROM "WarehouseStocks";
SELECT 'InventoryDb.InventoryEntries' AS table_name, COUNT(*) AS row_count FROM "InventoryEntries";

\connect OrderDb
SELECT 'OrderDb.Orders' AS table_name, COUNT(*) AS row_count FROM "Orders";

\connect PaymentDb
SELECT 'PaymentDb.PaymentTransactions' AS table_name, COUNT(*) AS row_count FROM "PaymentTransactions";

\connect FlashSaleDb
SELECT 'FlashSaleDb.FlashSaleSessions' AS table_name, COUNT(*) AS row_count FROM "FlashSaleSessions";
SELECT 'FlashSaleDb.FlashSaleItems' AS table_name, COUNT(*) AS row_count FROM "FlashSaleItems";
SELECT 'FlashSaleDb.FlashSaleOrders' AS table_name, COUNT(*) AS row_count FROM "FlashSaleOrders";

\connect GroupBuyDb
SELECT 'GroupBuyDb.GroupBuyCampaigns' AS table_name, COUNT(*) AS row_count FROM "GroupBuyCampaigns";
SELECT 'GroupBuyDb.GroupBuySessions' AS table_name, COUNT(*) AS row_count FROM "GroupBuySessions";
SELECT 'GroupBuyDb.GroupBuyParticipants' AS table_name, COUNT(*) AS row_count FROM "GroupBuyParticipants";

\connect HangfireDb
SELECT 'HangfireDb.Job' AS table_name, COUNT(*) AS row_count FROM "Job";
SELECT 'HangfireDb.State' AS table_name, COUNT(*) AS row_count FROM "State";
SELECT 'HangfireDb.Server' AS table_name, COUNT(*) AS row_count FROM "Server";

\echo '[AUDIT] Row count audit completed'
