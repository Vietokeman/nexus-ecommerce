\set ON_ERROR_STOP on
\echo '[PHASE 04] Ordering + Payment seeding started'
\echo '[PHASE 04] Basket.API uses Redis and is intentionally skipped in SQL phase.'

\connect OrderDb
BEGIN;
SET session_replication_role = replica;

TRUNCATE TABLE "Orders" RESTART IDENTITY CASCADE;

INSERT INTO "Orders" (
    "Id", "UserName", "TotalPrice", "FirstName", "LastName", "EmailAdress",
    "ShipppingAdress", "InvoiceAdress", "Status", "CreatedDate", "LastModifiedDate"
) VALUES
(1, 'nguyenviet', 2380000, 'Nguyen', 'Viet', 'nguyenviet@nexus.local',
 '12 Le Loi, Quan 1, Ho Chi Minh', '12 Le Loi, Quan 1, Ho Chi Minh', 3, NOW() AT TIME ZONE 'UTC' - INTERVAL '2 days', NOW() AT TIME ZONE 'UTC' - INTERVAL '2 days'),
(2, 'alice_w', 1790000, 'Alice', 'Wong', 'alice@nexus.local',
 '66 Tran Hung Dao, Hoan Kiem, Ha Noi', '66 Tran Hung Dao, Hoan Kiem, Ha Noi', 4, NOW() AT TIME ZONE 'UTC' - INTERVAL '1 day', NOW() AT TIME ZONE 'UTC' - INTERVAL '20 hours'),
(3, 'bob_martin', 998000, 'Bob', 'Martin', 'bob@nexus.local',
 '5 Nguyen Van Linh, Hai Chau, Da Nang', '5 Nguyen Van Linh, Hai Chau, Da Nang', 2, NOW() AT TIME ZONE 'UTC' - INTERVAL '6 hours', NOW() AT TIME ZONE 'UTC' - INTERVAL '2 hours'),
(4, 'charlie_b', 1250000, 'Charlie', 'Bui', 'charlie@nexus.local',
 '88 Phan Dinh Phung, Da Lat', '88 Phan Dinh Phung, Da Lat', 7, NOW() AT TIME ZONE 'UTC' - INTERVAL '4 days', NOW() AT TIME ZONE 'UTC' - INTERVAL '3 days'),
(5, 'emma_davis', 620000, 'Emma', 'Davis', 'emma@nexus.local',
 '21 Hai Ba Trung, Nha Trang', '21 Hai Ba Trung, Nha Trang', 6, NOW() AT TIME ZONE 'UTC' - INTERVAL '5 days', NOW() AT TIME ZONE 'UTC' - INTERVAL '4 days');

SET session_replication_role = DEFAULT;
COMMIT;

SELECT 'OrderDb.Orders' AS table_name, COUNT(*) AS row_count FROM "Orders";

\connect PaymentDb
BEGIN;
SET session_replication_role = replica;

TRUNCATE TABLE "PaymentTransactions" RESTART IDENTITY CASCADE;

INSERT INTO "PaymentTransactions" (
    "Id", "OrderCode", "OrderNo", "UserId", "Amount", "Currency", "Status",
    "PaymentUrl", "PayOSTransactionId", "PaymentMethod", "Description", "CreatedAt",
    "PaidAt", "CancelledAt", "CancellationReason", "WebhookData"
) VALUES
('00000000-0000-0000-0000-000000000001', 260000001, 'ORD-260001', 'nguyenviet', 2380000, 'VND', 2,
 'https://pay.local/checkout/260000001', 'POS-TX-0001', 'PayOS-QR', 'Thanh toan don hang ORD-260001', NOW() AT TIME ZONE 'UTC' - INTERVAL '2 days', NOW() AT TIME ZONE 'UTC' - INTERVAL '2 days', NULL, NULL, '{"status":"PAID"}'),
('00000000-0000-0000-0000-000000000002', 260000002, 'ORD-260002', 'alice_w', 1790000, 'VND', 1,
 'https://pay.local/checkout/260000002', NULL, 'PayOS-Link', 'Don hang dang xu ly thanh toan', NOW() AT TIME ZONE 'UTC' - INTERVAL '1 day', NULL, NULL, NULL, '{"status":"PROCESSING"}'),
('00000000-0000-0000-0000-000000000003', 260000003, 'ORD-260003', 'bob_martin', 998000, 'VND', 0,
 'https://pay.local/checkout/260000003', NULL, 'PayOS-QR', 'Cho khach hang thanh toan', NOW() AT TIME ZONE 'UTC' - INTERVAL '6 hours', NULL, NULL, NULL, '{"status":"PENDING"}'),
('00000000-0000-0000-0000-000000000004', 260000004, 'ORD-260004', 'charlie_b', 1250000, 'VND', 3,
 NULL, 'POS-TX-0004', 'Wallet', 'Don hang bi huy boi nguoi dung', NOW() AT TIME ZONE 'UTC' - INTERVAL '4 days', NULL, NOW() AT TIME ZONE 'UTC' - INTERVAL '3 days', 'User cancelled before shipment', '{"status":"CANCELLED"}'),
('00000000-0000-0000-0000-000000000005', 260000005, 'ORD-260005', 'emma_davis', 620000, 'VND', 5,
 NULL, 'POS-TX-0005', 'Card', 'Hoan tien do group-buy failed', NOW() AT TIME ZONE 'UTC' - INTERVAL '5 days', NOW() AT TIME ZONE 'UTC' - INTERVAL '5 days', NOW() AT TIME ZONE 'UTC' - INTERVAL '4 days', 'Auto refund due to failed campaign', '{"status":"REFUNDED"}');

SET session_replication_role = DEFAULT;
COMMIT;

SELECT 'PaymentDb.PaymentTransactions' AS table_name, COUNT(*) AS row_count FROM "PaymentTransactions";

\echo '[PHASE 04] Completed'
