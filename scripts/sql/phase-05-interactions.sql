\set ON_ERROR_STOP on
\echo '[PHASE 05] Interaction seeding started (reviews + sentiment)'
\echo '[PHASE 05] Admin notifications/audit are in-memory in Admin.API and are skipped in SQL phase.'

\connect SellerDb
BEGIN;
SET session_replication_role = replica;

TRUNCATE TABLE "ProductReviews" RESTART IDENTITY CASCADE;

INSERT INTO "ProductReviews" (
    "ProductId", "UserName", "DisplayName", "OrderId", "Rating", "Comment", "SellerReply", "SellerReplyDate",
    "IsVerifiedPurchase", "CreatedDate", "LastModifiedDate"
) VALUES
(1, 'nguyenviet', 'Nguyen Viet', 1, 5, 'Dong goi qua dep, doi tac nhan xet rat tot.', 'Cam on ban da tin tuong gio qua doanh nghiep cua shop.', NOW() AT TIME ZONE 'UTC' - INTERVAL '1 day', TRUE, NOW() AT TIME ZONE 'UTC' - INTERVAL '2 days', NOW() AT TIME ZONE 'UTC' - INTERVAL '1 day'),
(1, 'alice_w', 'Alice Wong', 2, 4, 'Mau sac sang trong, van chuyen dung hen.', NULL, NULL, TRUE, NOW() AT TIME ZONE 'UTC' - INTERVAL '1 day', NOW() AT TIME ZONE 'UTC' - INTERVAL '1 day'),
(1, 'bob_martin', 'Bob Martin', 3, 5, 'Phu hop lam qua doi tac dip Tet.', 'Shop se bo sung mau hop moi trong dot sau.', NOW() AT TIME ZONE 'UTC' - INTERVAL '8 hours', TRUE, NOW() AT TIME ZONE 'UTC' - INTERVAL '10 hours', NOW() AT TIME ZONE 'UTC' - INTERVAL '8 hours'),
(2, 'charlie_b', 'Charlie Bui', 4, 5, 'Ruou ngon, hop go chat luong cao.', 'Cam on ban, hy vong tiep tuc phuc vu mua sau.', NOW() AT TIME ZONE 'UTC' - INTERVAL '3 days', TRUE, NOW() AT TIME ZONE 'UTC' - INTERVAL '4 days', NOW() AT TIME ZONE 'UTC' - INTERVAL '3 days'),
(2, 'emma_davis', 'Emma Davis', 5, 3, 'Chat luong tot nhung gia hoi cao.', NULL, NULL, TRUE, NOW() AT TIME ZONE 'UTC' - INTERVAL '3 days', NOW() AT TIME ZONE 'UTC' - INTERVAL '3 days'),
(2, 'john_doe', 'John Doe', 6, 4, 'Hop qua dep, ruou dong chai ky.', NULL, NULL, TRUE, NOW() AT TIME ZONE 'UTC' - INTERVAL '2 days', NOW() AT TIME ZONE 'UTC' - INTERVAL '2 days'),
(3, 'jane_smith', 'Jane Smith', 7, 5, 'Mui tra thom, rat de uong.', 'Cam on ban, shop co them dong tra huu co moi.', NOW() AT TIME ZONE 'UTC' - INTERVAL '12 hours', TRUE, NOW() AT TIME ZONE 'UTC' - INTERVAL '1 day', NOW() AT TIME ZONE 'UTC' - INTERVAL '12 hours'),
(3, 'duc.tran', 'Duc Tran', 8, 4, 'Hop son mai dep, phu hop tang gia dinh.', NULL, NULL, TRUE, NOW() AT TIME ZONE 'UTC' - INTERVAL '14 hours', NOW() AT TIME ZONE 'UTC' - INTERVAL '14 hours'),
(3, 'linh.ngo', 'Linh Ngo', 9, 2, 'Giao hang cham 1 ngay.', 'Shop xin loi va gui voucher cho don tiep theo.', NOW() AT TIME ZONE 'UTC' - INTERVAL '6 hours', TRUE, NOW() AT TIME ZONE 'UTC' - INTERVAL '7 hours', NOW() AT TIME ZONE 'UTC' - INTERVAL '6 hours'),
(1, 'phuong.mai', 'Phuong Mai', 10, 5, 'Dich vu cham soc khach hang rat nhanh.', NULL, NULL, FALSE, NOW() AT TIME ZONE 'UTC' - INTERVAL '5 hours', NOW() AT TIME ZONE 'UTC' - INTERVAL '5 hours');

SET session_replication_role = DEFAULT;
COMMIT;

SELECT 'SellerDb.ProductReviews' AS table_name, COUNT(*) AS row_count FROM "ProductReviews";
SELECT 'SellerDb.ReviewAvgRating' AS metric, ROUND(AVG("Rating")::numeric, 2) AS value FROM "ProductReviews";

\echo '[PHASE 05] Completed'
