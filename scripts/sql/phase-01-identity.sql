\set ON_ERROR_STOP on
\echo '[PHASE 01] Identity + Customer + Seller seeding started'

\connect IdentityDb
BEGIN;
SET session_replication_role = replica;

TRUNCATE TABLE
    "AspNetUserTokens",
    "AspNetUserLogins",
    "AspNetUserClaims",
    "AspNetUserRoles",
    "AspNetRoleClaims",
    "Permissions",
    "Users",
    "AspNetRoles"
RESTART IDENTITY CASCADE;

INSERT INTO "AspNetRoles" ("Id", "Name", "NormalizedName", "ConcurrencyStamp") VALUES
('role-admin', 'Admin', 'ADMIN', 'seed-role-admin'),
('role-user', 'User', 'USER', 'seed-role-user'),
('role-seller', 'Seller', 'SELLER', 'seed-role-seller'),
('role-operator', 'Operator', 'OPERATOR', 'seed-role-operator');

INSERT INTO "Users" (
    "Id", "UserName", "NormalizedUserName", "Email", "NormalizedEmail",
    "EmailConfirmed", "PasswordHash", "SecurityStamp", "ConcurrencyStamp",
    "PhoneNumber", "PhoneNumberConfirmed", "TwoFactorEnabled", "LockoutEnd",
    "LockoutEnabled", "AccessFailedCount", "FirstName", "LastName", "IsAdmin",
    "CreatedAt", "LastLoginAt"
) VALUES
('user-admin-001', 'admin', 'ADMIN', 'admin@nexus.local', 'ADMIN@NEXUS.LOCAL', TRUE,
 'AQAAAAIAAYagAAAAEM0iPKDl1JxowoFdKSRacmWGeHZhv1HBzFmpgmdsc1TEW1P6U117msm+7DnzXpdFpA==',
 'sec-admin-001', 'cc-admin-001', NULL, FALSE, FALSE, NULL, TRUE, 0,
 'System', 'Admin', TRUE, NOW() AT TIME ZONE 'UTC', NOW() AT TIME ZONE 'UTC'),
('user-customer-001', 'nguyenviet', 'NGUYENVIET', 'nguyenviet@nexus.local', 'NGUYENVIET@NEXUS.LOCAL', TRUE,
 'AQAAAAIAAYagAAAAEM0iPKDl1JxowoFdKSRacmWGeHZhv1HBzFmpgmdsc1TEW1P6U117msm+7DnzXpdFpA==',
 'sec-customer-001', 'cc-customer-001', NULL, FALSE, FALSE, NULL, TRUE, 0,
 'Nguyen', 'Viet', FALSE, NOW() AT TIME ZONE 'UTC', NOW() AT TIME ZONE 'UTC'),
('user-customer-002', 'alice_w', 'ALICE_W', 'alice@nexus.local', 'ALICE@NEXUS.LOCAL', TRUE,
 'AQAAAAIAAYagAAAAEM0iPKDl1JxowoFdKSRacmWGeHZhv1HBzFmpgmdsc1TEW1P6U117msm+7DnzXpdFpA==',
 'sec-customer-002', 'cc-customer-002', NULL, FALSE, FALSE, NULL, TRUE, 0,
 'Alice', 'Wong', FALSE, NOW() AT TIME ZONE 'UTC', NOW() AT TIME ZONE 'UTC'),
('user-seller-001', 'tet.gourmet', 'TET.GOURMET', 'seller1@nexus.local', 'SELLER1@NEXUS.LOCAL', TRUE,
 'AQAAAAIAAYagAAAAEM0iPKDl1JxowoFdKSRacmWGeHZhv1HBzFmpgmdsc1TEW1P6U117msm+7DnzXpdFpA==',
 'sec-seller-001', 'cc-seller-001', NULL, FALSE, FALSE, NULL, TRUE, 0,
 'Tet', 'Gourmet', FALSE, NOW() AT TIME ZONE 'UTC', NOW() AT TIME ZONE 'UTC'),
('user-seller-002', 'luxegift.vn', 'LUXEGIFT.VN', 'seller2@nexus.local', 'SELLER2@NEXUS.LOCAL', TRUE,
 'AQAAAAIAAYagAAAAEM0iPKDl1JxowoFdKSRacmWGeHZhv1HBzFmpgmdsc1TEW1P6U117msm+7DnzXpdFpA==',
 'sec-seller-002', 'cc-seller-002', NULL, FALSE, FALSE, NULL, TRUE, 0,
 'Luxe', 'Gift', FALSE, NOW() AT TIME ZONE 'UTC', NOW() AT TIME ZONE 'UTC');

INSERT INTO "AspNetUserRoles" ("UserId", "RoleId") VALUES
('user-admin-001', 'role-admin'),
('user-customer-001', 'role-user'),
('user-customer-002', 'role-user'),
('user-seller-001', 'role-seller'),
('user-seller-002', 'role-seller');

INSERT INTO "Permissions" ("Id", "Function", "Command", "RoleId") VALUES
(1, 'catalog', 'read', 'role-user'),
(2, 'order', 'create', 'role-user'),
(3, 'seller-product', 'write', 'role-seller'),
(4, 'seller-order', 'read', 'role-seller'),
(5, 'admin-dashboard', 'read', 'role-admin'),
(6, 'admin-user', 'manage', 'role-admin');

SET session_replication_role = DEFAULT;
COMMIT;

SELECT 'IdentityDb.Users' AS table_name, COUNT(*) AS row_count FROM "Users";
SELECT 'IdentityDb.AspNetRoles' AS table_name, COUNT(*) AS row_count FROM "AspNetRoles";
SELECT 'IdentityDb.Permissions' AS table_name, COUNT(*) AS row_count FROM "Permissions";

\connect CustomerDb
BEGIN;
SET session_replication_role = replica;

TRUNCATE TABLE "Customers" RESTART IDENTITY CASCADE;

INSERT INTO "Customers" (
    "Id", "UserName", "FirstName", "LastName", "EmailAddress", "CreatedDate", "LastModifiedDate"
) VALUES
(1, 'nguyenviet', 'Nguyen', 'Viet', 'nguyenviet@nexus.local', NOW() AT TIME ZONE 'UTC', NULL),
(2, 'alice_w', 'Alice', 'Wong', 'alice@nexus.local', NOW() AT TIME ZONE 'UTC', NULL),
(3, 'bob_martin', 'Bob', 'Martin', 'bob@nexus.local', NOW() AT TIME ZONE 'UTC', NULL),
(4, 'charlie_b', 'Charlie', 'Bui', 'charlie@nexus.local', NOW() AT TIME ZONE 'UTC', NULL),
(5, 'emma_davis', 'Emma', 'Davis', 'emma@nexus.local', NOW() AT TIME ZONE 'UTC', NULL),
(6, 'john_doe', 'John', 'Doe', 'john@nexus.local', NOW() AT TIME ZONE 'UTC', NULL),
(7, 'jane_smith', 'Jane', 'Smith', 'jane@nexus.local', NOW() AT TIME ZONE 'UTC', NULL),
(8, 'phuong.mai', 'Phuong', 'Mai', 'phuong@nexus.local', NOW() AT TIME ZONE 'UTC', NULL),
(9, 'duc.tran', 'Duc', 'Tran', 'duc@nexus.local', NOW() AT TIME ZONE 'UTC', NULL),
(10, 'linh.ngo', 'Linh', 'Ngo', 'linh@nexus.local', NOW() AT TIME ZONE 'UTC', NULL);

SET session_replication_role = DEFAULT;
COMMIT;

SELECT 'CustomerDb.Customers' AS table_name, COUNT(*) AS row_count FROM "Customers";

\connect SellerDb
BEGIN;
SET session_replication_role = replica;

TRUNCATE TABLE "ProductReviews", "SellerProducts" RESTART IDENTITY CASCADE;

INSERT INTO "SellerProducts" (
    "Id", "SellerUserName", "No", "Name", "Summary", "Description", "Price", "Category",
    "ImageUrl", "Attributes", "SeoTitle", "SeoDescription", "SeoKeywords", "Highlights",
    "StockQuantity", "Status", "CreatedDate", "LastModifiedDate"
) VALUES
(1, 'tet.gourmet', 'TET-HAMPER-01', 'Hop Qua Tet Vang Phuc Loc', 'Hop qua cao cap cho doanh nghiep.',
 'Ket hop banh nhap khau, tra oolong va hat dinh duong cho dip Tet.', 1490000, 'Gio qua doanh nghiep',
 'https://picsum.photos/seed/tet-hamper-01/1200/900',
 '{"tier":"premium","brand":"Nexus Tet","weight":"3.2kg"}',
 'Hop Qua Tet Vang Phuc Loc Cao Cap', 'Lua chon qua Tet doanh nghiep sang trong va tinh te.',
 'qua tet cao cap,gio qua doanh nghiep,qua bieu tet', 'Dong goi thu cong;Van chuyen lanh;In logo doanh nghiep',
 180, 'Active', NOW() AT TIME ZONE 'UTC', NOW() AT TIME ZONE 'UTC'),
(2, 'luxegift.vn', 'TET-WINE-02', 'Set Ruou Vang Phap Mau Do', 'Set ruou vang + ly pha le cho tiec tet.',
 'Ruou vang Phap ket hop phu kien cao cap, hop cho tiec chiêu dai.', 2290000, 'Ruou vang va ruou manh cao cap',
 'https://picsum.photos/seed/tet-wine-02/1200/900',
 '{"tier":"luxury","volume":"750ml","origin":"France"}',
 'Set Ruou Vang Phap Cao Cap Dip Tet', 'Mon qua cho tiec tat nien va doi tac cao cap.',
 'ruou vang tet,qua tet sang trong,qua bieu doi tac', 'Ruou nhap khau;Hop go son mai;Kem ly pha le',
 90, 'Active', NOW() AT TIME ZONE 'UTC', NOW() AT TIME ZONE 'UTC'),
(3, 'tet.gourmet', 'TET-TEA-03', 'Bo Tra Oolong Son Mai', 'Tra oolong dac san dong hop son mai.',
 'Huong vi thanh tao, thich hop bieu tang gia dinh va nguoi lon tuoi.', 890000, 'Tra va cafe dac san',
 'https://picsum.photos/seed/tet-tea-03/1200/900',
 '{"tier":"premium","origin":"Bao Loc","netWeight":"500g"}',
 'Bo Tra Oolong Son Mai Tet', 'Mon qua thanh lich cho Tet truyen thong.',
 'tra tet,qua tet cha me,qua tet premium', 'La tra chon loc;Hop son mai;Huong vi diu nhe',
 260, 'Active', NOW() AT TIME ZONE 'UTC', NOW() AT TIME ZONE 'UTC');

SET session_replication_role = DEFAULT;
COMMIT;

SELECT 'SellerDb.SellerProducts' AS table_name, COUNT(*) AS row_count FROM "SellerProducts";
SELECT 'SellerDb.ProductReviews' AS table_name, COUNT(*) AS row_count FROM "ProductReviews";

\echo '[PHASE 01] Completed'
