\set ON_ERROR_STOP on
\echo '[PHASE 02] Catalog + Inventory seeding started'

\connect ProductDb
BEGIN;
SET session_replication_role = replica;

TRUNCATE TABLE "CatalogProducts" RESTART IDENTITY CASCADE;

INSERT INTO "CatalogProducts" (
    "Id", "No", "Name", "Summary", "Description", "Price", "Attributes", "Category", "ImageUrl", "CreatedDate", "LastModifiedDate"
) VALUES
(1, 'TET-HAMPER-01', 'Hop Qua Tet Vang Phuc Loc', 'Hop qua doanh nghiep premium', 'Gio qua gom banh, mut, tra cao cap.', 1490000,
 '{"brand":"Nexus Tet","discount":12,"rating":4.8,"stock":180}', 'Gio qua doanh nghiep', 'https://picsum.photos/seed/TET-HAMPER-01/1200/900', NOW() AT TIME ZONE 'UTC', NULL),
(2, 'TET-WINE-02', 'Set Ruou Vang Phap Mau Do', 'Ruou vang nhap khau cho tiec tet', 'Set ruou vang + ly pha le dong bo.', 2290000,
 '{"brand":"Maison Rouge","discount":15,"rating":4.9,"stock":90}', 'Ruou vang va ruou manh cao cap', 'https://picsum.photos/seed/TET-WINE-02/1200/900', NOW() AT TIME ZONE 'UTC', NULL),
(3, 'TET-TEA-03', 'Bo Tra Oolong Son Mai', 'Tra dac san phien ban tet', 'Tra oolong dong hop son mai, huong vi diu nhe.', 890000,
 '{"brand":"Bao Loc Tea","discount":10,"rating":4.7,"stock":260}', 'Tra va cafe dac san', 'https://picsum.photos/seed/TET-TEA-03/1200/900', NOW() AT TIME ZONE 'UTC', NULL),
(4, 'TET-NUT-04', 'Hop Hat Dinh Duong Ngoc Loc', 'Hat cao cap mix 5 loai', 'Hat oc cho, hanh nhan, macca, de cuoi va hat bi.', 690000,
 '{"brand":"NutriTet","discount":8,"rating":4.6,"stock":340}', 'Hat dinh duong qua tet', 'https://picsum.photos/seed/TET-NUT-04/1200/900', NOW() AT TIME ZONE 'UTC', NULL),
(5, 'TET-TRAD-05', 'Gio Qua Truyen Thong An Khang', 'Set qua truyen thong', 'Ket hop mut gung, mut dua, banh quy bo va tra sen.', 590000,
 '{"brand":"Nexus Tet","discount":6,"rating":4.5,"stock":400}', 'Gio qua truyen thong', 'https://picsum.photos/seed/TET-TRAD-05/1200/900', NOW() AT TIME ZONE 'UTC', NULL),
(6, 'TET-FENG-06', 'Linh Vat Ranh Rong Phong Thuy', 'Vat pham phong thuy gioi han', 'Linh vat ma vang kem de go cho ban lam viec.', 1290000,
 '{"brand":"OrientCraft","discount":5,"rating":4.7,"stock":120}', 'Vat pham phong thuy tet', 'https://picsum.photos/seed/TET-FENG-06/1200/900', NOW() AT TIME ZONE 'UTC', NULL),
(7, 'TET-DECOR-07', 'Bo Trang Tri Cua Xuan', 'Bo decor cua va phong khach', 'Doi cau doi, den long mini va day treo may man.', 450000,
 '{"brand":"HomeSpring","discount":9,"rating":4.4,"stock":520}', 'Do trang tri nha tet', 'https://picsum.photos/seed/TET-DECOR-07/1200/900', NOW() AT TIME ZONE 'UTC', NULL),
(8, 'TET-COFFEE-08', 'Set Ca Phe Chon Loc Dak Lak', 'Ca phe rang xay premium', 'Bo qua tang ca phe kem phin inox cao cap.', 520000,
 '{"brand":"DakLak Reserve","discount":11,"rating":4.6,"stock":280}', 'Tra va cafe dac san', 'https://picsum.photos/seed/TET-COFFEE-08/1200/900', NOW() AT TIME ZONE 'UTC', NULL),
(9, 'TET-HAMPER-09', 'Gio Qua Doanh Nghiep Kim Long', 'Hop qua quy cach lon', 'Gio qua cao cap danh cho doi tac VIP.', 3190000,
 '{"brand":"Nexus Corporate","discount":13,"rating":4.9,"stock":70}', 'Gio qua doanh nghiep', 'https://picsum.photos/seed/TET-HAMPER-09/1200/900', NOW() AT TIME ZONE 'UTC', NULL),
(10, 'TET-WINE-10', 'Ruou Vang Y Duong Kim', 'Ruou vang y phien ban tet', 'Ruou vang Y ket hop socola den nhap khau.', 1980000,
 '{"brand":"Torino Reserve","discount":12,"rating":4.7,"stock":110}', 'Ruou vang va ruou manh cao cap', 'https://picsum.photos/seed/TET-WINE-10/1200/900', NOW() AT TIME ZONE 'UTC', NULL),
(11, 'TET-JAM-11', 'Bo Mut Tet Thu Cong', 'Mut dua, mut gung, mut vo buoi', 'Mut thu cong it ngot, hop cho nguoi lon tuoi.', 320000,
 '{"brand":"AnNhiên","discount":7,"rating":4.3,"stock":460}', 'Gio qua truyen thong', 'https://picsum.photos/seed/TET-JAM-11/1200/900', NOW() AT TIME ZONE 'UTC', NULL),
(12, 'TET-TEA-12', 'Tra Sen Tay Ho Thuong Hang', 'Tra sen uop bong thu cong', 'Mui thom thanh tao, dong hop theu tay.', 780000,
 '{"brand":"TayHo Tea","discount":8,"rating":4.8,"stock":210}', 'Tra va cafe dac san', 'https://picsum.photos/seed/TET-TEA-12/1200/900', NOW() AT TIME ZONE 'UTC', NULL);

SET session_replication_role = DEFAULT;
COMMIT;

SELECT 'ProductDb.CatalogProducts' AS table_name, COUNT(*) AS row_count FROM "CatalogProducts";

\connect InventoryDb
BEGIN;
SET session_replication_role = replica;

TRUNCATE TABLE "InventoryEntries", "WarehouseStocks", "Warehouses" RESTART IDENTITY CASCADE;

INSERT INTO "Warehouses" (
    "Id", "Code", "Name", "Address", "City", "Province", "Location", "IsActive", "Capacity", "CreatedDate", "LastModifiedDate"
) VALUES
(1, 'WH-HCM', 'Kho Tong Ho Chi Minh', '12 Nguyen Van Linh, Quan 7', 'Ho Chi Minh City', 'Ho Chi Minh', ST_GeogFromText('SRID=4326;POINT(106.70098 10.77689)'), TRUE, 60000, NOW() AT TIME ZONE 'UTC', NULL),
(2, 'WH-HN', 'Kho Tong Ha Noi', '88 Pham Van Dong, Bac Tu Liem', 'Ha Noi', 'Ha Noi', ST_GeogFromText('SRID=4326;POINT(105.83416 21.02776)'), TRUE, 45000, NOW() AT TIME ZONE 'UTC', NULL),
(3, 'WH-DN', 'Kho Tong Da Nang', '102 Nguyen Huu Tho, Cam Le', 'Da Nang', 'Da Nang', ST_GeogFromText('SRID=4326;POINT(108.22083 16.04708)'), TRUE, 30000, NOW() AT TIME ZONE 'UTC', NULL);

INSERT INTO "WarehouseStocks" ("WarehouseId", "ItemNo", "AvailableQuantity", "ReservedQuantity", "LastUpdated") VALUES
(1, 'TET-HAMPER-01', 140, 12, NOW() AT TIME ZONE 'UTC'),
(1, 'TET-WINE-02', 68, 7, NOW() AT TIME ZONE 'UTC'),
(1, 'TET-TEA-03', 210, 15, NOW() AT TIME ZONE 'UTC'),
(1, 'TET-NUT-04', 260, 20, NOW() AT TIME ZONE 'UTC'),
(2, 'TET-HAMPER-01', 90, 10, NOW() AT TIME ZONE 'UTC'),
(2, 'TET-WINE-10', 84, 9, NOW() AT TIME ZONE 'UTC'),
(2, 'TET-DECOR-07', 310, 18, NOW() AT TIME ZONE 'UTC'),
(2, 'TET-COFFEE-08', 190, 12, NOW() AT TIME ZONE 'UTC'),
(3, 'TET-HAMPER-09', 45, 5, NOW() AT TIME ZONE 'UTC'),
(3, 'TET-TRAD-05', 260, 16, NOW() AT TIME ZONE 'UTC'),
(3, 'TET-JAM-11', 300, 22, NOW() AT TIME ZONE 'UTC'),
(3, 'TET-TEA-12', 150, 11, NOW() AT TIME ZONE 'UTC');

INSERT INTO "InventoryEntries" (
    "DocumentNo", "ItemNo", "Quantity", "DocumentType", "ExternalDocumentNo", "WarehouseId", "CreatedDate", "CreatedBy"
) VALUES
('PO-2026-0001', 'TET-HAMPER-01', 180, 'Purchase', 'SUP-TET-001', 1, NOW() AT TIME ZONE 'UTC', 'seed-script'),
('PO-2026-0002', 'TET-WINE-02', 90, 'Purchase', 'SUP-WINE-002', 1, NOW() AT TIME ZONE 'UTC', 'seed-script'),
('PO-2026-0003', 'TET-HAMPER-09', 70, 'Purchase', 'SUP-CORP-003', 3, NOW() AT TIME ZONE 'UTC', 'seed-script'),
('SO-2026-0001', 'TET-HAMPER-01', -8, 'Sales', 'ORD-260001', 1, NOW() AT TIME ZONE 'UTC', 'seed-script'),
('SO-2026-0002', 'TET-WINE-10', -6, 'Sales', 'ORD-260002', 2, NOW() AT TIME ZONE 'UTC', 'seed-script'),
('ADJ-2026-0001', 'TET-DECOR-07', 15, 'Adjustment', 'QC-2601', 2, NOW() AT TIME ZONE 'UTC', 'seed-script');

SET session_replication_role = DEFAULT;
COMMIT;

SELECT 'InventoryDb.Warehouses' AS table_name, COUNT(*) AS row_count FROM "Warehouses";
SELECT 'InventoryDb.WarehouseStocks' AS table_name, COUNT(*) AS row_count FROM "WarehouseStocks";
SELECT 'InventoryDb.InventoryEntries' AS table_name, COUNT(*) AS row_count FROM "InventoryEntries";

\echo '[PHASE 02] Completed'
