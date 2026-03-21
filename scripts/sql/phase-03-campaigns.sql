\set ON_ERROR_STOP on
\echo '[PHASE 03] FlashSale + GroupBuy seeding started'

\connect FlashSaleDb
BEGIN;
SET session_replication_role = replica;

TRUNCATE TABLE "FlashSaleOrders", "FlashSaleItems", "FlashSaleSessions" RESTART IDENTITY CASCADE;

INSERT INTO "FlashSaleSessions" (
    "Id", "Name", "Description", "StartTime", "EndTime", "Status", "MaxConcurrentUsers", "CreatedAt", "UpdatedAt"
) VALUES
(1, 'Tet Midnight Deal', 'Khung gio gia soc truoc giao thua.', NOW() AT TIME ZONE 'UTC' - INTERVAL '2 hours', NOW() AT TIME ZONE 'UTC' + INTERVAL '10 hours', 'Active', 100000, NOW() AT TIME ZONE 'UTC', NOW() AT TIME ZONE 'UTC'),
(2, 'Tet Morning Rush', 'Gio vang buoi sang mung 1.', NOW() AT TIME ZONE 'UTC' + INTERVAL '1 day', NOW() AT TIME ZONE 'UTC' + INTERVAL '1 day 12 hours', 'Draft', 80000, NOW() AT TIME ZONE 'UTC', NULL),
(3, 'Tet Last Chance', 'Chot deal cuoi mua tet.', NOW() AT TIME ZONE 'UTC' - INTERVAL '3 days', NOW() AT TIME ZONE 'UTC' - INTERVAL '1 day', 'Ended', 60000, NOW() AT TIME ZONE 'UTC', NOW() AT TIME ZONE 'UTC');

INSERT INTO "FlashSaleItems" (
    "Id", "SessionId", "ProductNo", "ProductName", "OriginalPrice", "FlashPrice",
    "TotalStock", "SoldQuantity", "MaxPerUser", "ImageUrl", "CreatedAt"
) VALUES
(1, 1, 'TET-HAMPER-01', 'Hop Qua Tet Vang Phuc Loc', 1490000, 1190000, 120, 74, 2, 'https://picsum.photos/seed/fs-1/1200/900', NOW() AT TIME ZONE 'UTC'),
(2, 1, 'TET-WINE-02', 'Set Ruou Vang Phap Mau Do', 2290000, 1790000, 60, 52, 1, 'https://picsum.photos/seed/fs-2/1200/900', NOW() AT TIME ZONE 'UTC'),
(3, 1, 'TET-NUT-04', 'Hop Hat Dinh Duong Ngoc Loc', 690000, 499000, 180, 118, 3, 'https://picsum.photos/seed/fs-3/1200/900', NOW() AT TIME ZONE 'UTC'),
(4, 2, 'TET-TEA-03', 'Bo Tra Oolong Son Mai', 890000, 699000, 150, 0, 2, 'https://picsum.photos/seed/fs-4/1200/900', NOW() AT TIME ZONE 'UTC'),
(5, 3, 'TET-DECOR-07', 'Bo Trang Tri Cua Xuan', 450000, 299000, 200, 200, 4, 'https://picsum.photos/seed/fs-5/1200/900', NOW() AT TIME ZONE 'UTC');

INSERT INTO "FlashSaleOrders" (
    "ItemId", "UserName", "Quantity", "UnitPrice", "Status", "CreatedAt"
) VALUES
(1, 'nguyenviet', 2, 1190000, 'Confirmed', NOW() AT TIME ZONE 'UTC' - INTERVAL '30 minutes'),
(2, 'alice_w', 1, 1790000, 'Confirmed', NOW() AT TIME ZONE 'UTC' - INTERVAL '25 minutes'),
(3, 'bob_martin', 3, 499000, 'Pending', NOW() AT TIME ZONE 'UTC' - INTERVAL '15 minutes'),
(5, 'charlie_b', 2, 299000, 'Confirmed', NOW() AT TIME ZONE 'UTC' - INTERVAL '2 days');

SET session_replication_role = DEFAULT;
COMMIT;

SELECT 'FlashSaleDb.FlashSaleSessions' AS table_name, COUNT(*) AS row_count FROM "FlashSaleSessions";
SELECT 'FlashSaleDb.FlashSaleItems' AS table_name, COUNT(*) AS row_count FROM "FlashSaleItems";
SELECT 'FlashSaleDb.FlashSaleOrders' AS table_name, COUNT(*) AS row_count FROM "FlashSaleOrders";

\connect GroupBuyDb
BEGIN;
SET session_replication_role = replica;

TRUNCATE TABLE "GroupBuyParticipants", "GroupBuySessions", "GroupBuyCampaigns" RESTART IDENTITY CASCADE;

INSERT INTO "GroupBuyCampaigns" (
    "Id", "Name", "Description", "ProductNo", "ProductName", "ImageUrl", "OriginalPrice", "GroupPrice",
    "MinParticipants", "MaxParticipants", "SessionDurationHours", "Status", "StartDate", "EndDate", "CreatedAt", "UpdatedAt"
) VALUES
(1, 'Nhom Mua Hop Qua Vang', 'Campaign hop qua tet doanh nghiep voi gia nhom.', 'TET-HAMPER-01', 'Hop Qua Tet Vang Phuc Loc', 'https://picsum.photos/seed/gb-1/1200/900', 1490000, 1250000, 3, 30, 24, 'Active', NOW() AT TIME ZONE 'UTC' - INTERVAL '1 day', NOW() AT TIME ZONE 'UTC' + INTERVAL '7 days', NOW() AT TIME ZONE 'UTC', NOW() AT TIME ZONE 'UTC'),
(2, 'Nhom Mua Ruou Vang Tet', 'Campaign ruou vang cho tiec tat nien.', 'TET-WINE-10', 'Ruou Vang Y Duong Kim', 'https://picsum.photos/seed/gb-2/1200/900', 1980000, 1680000, 4, 20, 18, 'Active', NOW() AT TIME ZONE 'UTC' - INTERVAL '2 days', NOW() AT TIME ZONE 'UTC' + INTERVAL '5 days', NOW() AT TIME ZONE 'UTC', NOW() AT TIME ZONE 'UTC'),
(3, 'Nhom Mua Tra Sen Thuong Hang', 'Campaign da ket thuc de test state.', 'TET-TEA-12', 'Tra Sen Tay Ho Thuong Hang', 'https://picsum.photos/seed/gb-3/1200/900', 780000, 620000, 5, 40, 20, 'Ended', NOW() AT TIME ZONE 'UTC' - INTERVAL '10 days', NOW() AT TIME ZONE 'UTC' - INTERVAL '3 days', NOW() AT TIME ZONE 'UTC', NOW() AT TIME ZONE 'UTC');

INSERT INTO "GroupBuySessions" (
    "Id", "CampaignId", "LeaderUserName", "CurrentParticipants", "Deadline", "Status", "InviteCode", "CreatedAt", "CompletedAt"
) VALUES
(1, 1, 'nguyenviet', 4, NOW() AT TIME ZONE 'UTC' + INTERVAL '15 hours', 'Open', 'TETVIP01', NOW() AT TIME ZONE 'UTC' - INTERVAL '9 hours', NULL),
(2, 1, 'alice_w', 3, NOW() AT TIME ZONE 'UTC' + INTERVAL '6 hours', 'Succeeded', 'TETVIP02', NOW() AT TIME ZONE 'UTC' - INTERVAL '18 hours', NOW() AT TIME ZONE 'UTC' - INTERVAL '1 hour'),
(3, 2, 'bob_martin', 2, NOW() AT TIME ZONE 'UTC' + INTERVAL '8 hours', 'Open', 'WINE2026', NOW() AT TIME ZONE 'UTC' - INTERVAL '4 hours', NULL),
(4, 3, 'charlie_b', 2, NOW() AT TIME ZONE 'UTC' - INTERVAL '2 days', 'Failed', 'TEAOLD01', NOW() AT TIME ZONE 'UTC' - INTERVAL '6 days', NOW() AT TIME ZONE 'UTC' - INTERVAL '2 days');

INSERT INTO "GroupBuyParticipants" (
    "SessionId", "UserName", "Quantity", "UnitPrice", "Status", "JoinedAt", "ConfirmedAt"
) VALUES
(1, 'nguyenviet', 1, 1250000, 'Joined', NOW() AT TIME ZONE 'UTC' - INTERVAL '9 hours', NULL),
(1, 'alice_w', 1, 1250000, 'Joined', NOW() AT TIME ZONE 'UTC' - INTERVAL '8 hours', NULL),
(1, 'duc.tran', 2, 1250000, 'Joined', NOW() AT TIME ZONE 'UTC' - INTERVAL '7 hours', NULL),
(2, 'alice_w', 1, 1250000, 'Confirmed', NOW() AT TIME ZONE 'UTC' - INTERVAL '17 hours', NOW() AT TIME ZONE 'UTC' - INTERVAL '1 hour'),
(2, 'emma_davis', 1, 1250000, 'Confirmed', NOW() AT TIME ZONE 'UTC' - INTERVAL '16 hours', NOW() AT TIME ZONE 'UTC' - INTERVAL '1 hour'),
(2, 'linh.ngo', 1, 1250000, 'Confirmed', NOW() AT TIME ZONE 'UTC' - INTERVAL '15 hours', NOW() AT TIME ZONE 'UTC' - INTERVAL '1 hour'),
(3, 'bob_martin', 1, 1680000, 'Joined', NOW() AT TIME ZONE 'UTC' - INTERVAL '4 hours', NULL),
(3, 'jane_smith', 1, 1680000, 'Joined', NOW() AT TIME ZONE 'UTC' - INTERVAL '2 hours', NULL),
(4, 'charlie_b', 1, 620000, 'Refunded', NOW() AT TIME ZONE 'UTC' - INTERVAL '5 days', NULL),
(4, 'john_doe', 1, 620000, 'Refunded', NOW() AT TIME ZONE 'UTC' - INTERVAL '5 days', NULL);

SET session_replication_role = DEFAULT;
COMMIT;

SELECT 'GroupBuyDb.GroupBuyCampaigns' AS table_name, COUNT(*) AS row_count FROM "GroupBuyCampaigns";
SELECT 'GroupBuyDb.GroupBuySessions' AS table_name, COUNT(*) AS row_count FROM "GroupBuySessions";
SELECT 'GroupBuyDb.GroupBuyParticipants' AS table_name, COUNT(*) AS row_count FROM "GroupBuyParticipants";

\echo '[PHASE 03] Completed'
