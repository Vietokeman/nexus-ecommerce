using Inventory.API.Entities;
using Serilog;

namespace Inventory.API.Persistence;

public static class InventoryContextSeed
{
    public static async Task SeedInventoryAsync(InventoryContext context)
    {
        if (!context.Warehouses.Any())
        {
            Log.Information("Seeding warehouses and inventory data...");

            // Seed warehouses
            var warehouses = new List<Warehouse>
            {
                new()
                {
                    Code = "WH-HCM-01",
                    Name = "Ho Chi Minh City Main Warehouse",
                    Address = "123 Nguyen Van Linh, District 7",
                    City = "Ho Chi Minh City",
                    Province = "Ho Chi Minh",
                    IsActive = true,
                    Capacity = 50000
                },
                new()
                {
                    Code = "WH-HN-01",
                    Name = "Hanoi Central Warehouse",
                    Address = "456 Pham Van Dong, Bac Tu Liem",
                    City = "Hanoi",
                    Province = "Hanoi",
                    IsActive = true,
                    Capacity = 35000
                },
                new()
                {
                    Code = "WH-DN-01",
                    Name = "Da Nang Distribution Center",
                    Address = "789 Tran Dai Nghia, Ngu Hanh Son",
                    City = "Da Nang",
                    Province = "Da Nang",
                    IsActive = true,
                    Capacity = 20000
                }
            };

            context.Warehouses.AddRange(warehouses);
            await context.SaveChangesAsync();

            Log.Information("Seeded {Count} warehouses", warehouses.Count);
        }

        if (!context.WarehouseStocks.Any())
        {
            var warehouses = context.Warehouses.ToList();
            var hcmWarehouse = warehouses.First(w => w.Code == "WH-HCM-01");
            var hnWarehouse = warehouses.First(w => w.Code == "WH-HN-01");
            var dnWarehouse = warehouses.First(w => w.Code == "WH-DN-01");

            // Seed stock for products (mapped from Product.API seed ItemNos)
            var stockItems = new List<WarehouseStock>
            {
                // Smartphones
                new() { WarehouseId = hcmWarehouse.Id, ItemNo = "IPHONE9", AvailableQuantity = 50, ReservedQuantity = 5 },
                new() { WarehouseId = hnWarehouse.Id, ItemNo = "IPHONE9", AvailableQuantity = 30, ReservedQuantity = 3 },
                new() { WarehouseId = hcmWarehouse.Id, ItemNo = "GALAXY9", AvailableQuantity = 20, ReservedQuantity = 2 },
                new() { WarehouseId = hnWarehouse.Id, ItemNo = "GALAXY9", AvailableQuantity = 15, ReservedQuantity = 1 },
                new() { WarehouseId = hcmWarehouse.Id, ItemNo = "OPPOF19", AvailableQuantity = 80, ReservedQuantity = 8 },
                new() { WarehouseId = dnWarehouse.Id, ItemNo = "OPPOF19", AvailableQuantity = 40, ReservedQuantity = 3 },
                new() { WarehouseId = hcmWarehouse.Id, ItemNo = "HUAWEIP30", AvailableQuantity = 18, ReservedQuantity = 2 },
                new() { WarehouseId = hcmWarehouse.Id, ItemNo = "GALAXY_S21", AvailableQuantity = 25, ReservedQuantity = 5 },
                new() { WarehouseId = hnWarehouse.Id, ItemNo = "GALAXY_S21", AvailableQuantity = 15, ReservedQuantity = 3 },
                new() { WarehouseId = hcmWarehouse.Id, ItemNo = "IPHONE14PRO", AvailableQuantity = 35, ReservedQuantity = 8 },
                new() { WarehouseId = hnWarehouse.Id, ItemNo = "IPHONE14PRO", AvailableQuantity = 20, ReservedQuantity = 5 },

                // Laptops
                new() { WarehouseId = hcmWarehouse.Id, ItemNo = "MACBOOKPRO", AvailableQuantity = 45, ReservedQuantity = 10 },
                new() { WarehouseId = hnWarehouse.Id, ItemNo = "MACBOOKPRO", AvailableQuantity = 30, ReservedQuantity = 5 },
                new() { WarehouseId = hcmWarehouse.Id, ItemNo = "GALAXYBOOK", AvailableQuantity = 30, ReservedQuantity = 4 },
                new() { WarehouseId = hcmWarehouse.Id, ItemNo = "SURFACE4", AvailableQuantity = 40, ReservedQuantity = 6 },
                new() { WarehouseId = hcmWarehouse.Id, ItemNo = "INFINIX", AvailableQuantity = 55, ReservedQuantity = 8 },
                new() { WarehouseId = dnWarehouse.Id, ItemNo = "INFINIX", AvailableQuantity = 35, ReservedQuantity = 4 },
                new() { WarehouseId = hcmWarehouse.Id, ItemNo = "HPPAVILION", AvailableQuantity = 50, ReservedQuantity = 7 },
                new() { WarehouseId = hnWarehouse.Id, ItemNo = "HPPAVILION", AvailableQuantity = 35, ReservedQuantity = 4 },
                new() { WarehouseId = hcmWarehouse.Id, ItemNo = "THINKPAD", AvailableQuantity = 22, ReservedQuantity = 5 },
                new() { WarehouseId = hcmWarehouse.Id, ItemNo = "DELLXPS", AvailableQuantity = 16, ReservedQuantity = 4 },

                // Fragrances
                new() { WarehouseId = hcmWarehouse.Id, ItemNo = "PERFUME100", AvailableQuantity = 40, ReservedQuantity = 2 },
                new() { WarehouseId = dnWarehouse.Id, ItemNo = "PERFUME100", AvailableQuantity = 22, ReservedQuantity = 1 },
                new() { WarehouseId = hcmWarehouse.Id, ItemNo = "ROYALMIRAGE", AvailableQuantity = 30, ReservedQuantity = 3 },
                new() { WarehouseId = hcmWarehouse.Id, ItemNo = "ALDREHABOIL", AvailableQuantity = 20, ReservedQuantity = 2 },
                new() { WarehouseId = hcmWarehouse.Id, ItemNo = "ACQUADIGIO", AvailableQuantity = 35, ReservedQuantity = 4 },

                // Skincare
                new() { WarehouseId = hcmWarehouse.Id, ItemNo = "TREEOIL", AvailableQuantity = 50, ReservedQuantity = 3 },
                new() { WarehouseId = hnWarehouse.Id, ItemNo = "TREEOIL", AvailableQuantity = 25, ReservedQuantity = 2 },
                new() { WarehouseId = hcmWarehouse.Id, ItemNo = "OILFREE", AvailableQuantity = 55, ReservedQuantity = 5 },
                new() { WarehouseId = hcmWarehouse.Id, ItemNo = "RICESERUM", AvailableQuantity = 40, ReservedQuantity = 3 },
                new() { WarehouseId = hcmWarehouse.Id, ItemNo = "LOREAL01", AvailableQuantity = 25, ReservedQuantity = 3 },
                new() { WarehouseId = hcmWarehouse.Id, ItemNo = "FAIRCLEAR", AvailableQuantity = 18, ReservedQuantity = 2 },

                // Groceries
                new() { WarehouseId = hcmWarehouse.Id, ItemNo = "STRAWBERRY", AvailableQuantity = 70, ReservedQuantity = 10 },
                new() { WarehouseId = hnWarehouse.Id, ItemNo = "STRAWBERRY", AvailableQuantity = 35, ReservedQuantity = 5 },
                new() { WarehouseId = hcmWarehouse.Id, ItemNo = "ORANGE", AvailableQuantity = 15, ReservedQuantity = 2 },
                new() { WarehouseId = hcmWarehouse.Id, ItemNo = "MULTIGRAIN", AvailableQuantity = 60, ReservedQuantity = 5 },
                new() { WarehouseId = hcmWarehouse.Id, ItemNo = "CEREAL01", AvailableQuantity = 100, ReservedQuantity = 8 },
                new() { WarehouseId = hcmWarehouse.Id, ItemNo = "DRIEDROSE", AvailableQuantity = 45, ReservedQuantity = 3 },

                // Home Decoration
                new() { WarehouseId = hcmWarehouse.Id, ItemNo = "VASE", AvailableQuantity = 5, ReservedQuantity = 1 },
                new() { WarehouseId = hcmWarehouse.Id, ItemNo = "FLOWER", AvailableQuantity = 35, ReservedQuantity = 4 },
                new() { WarehouseId = hcmWarehouse.Id, ItemNo = "LEDLIGHT01", AvailableQuantity = 55, ReservedQuantity = 6 },
                new() { WarehouseId = hnWarehouse.Id, ItemNo = "LEDLIGHT01", AvailableQuantity = 28, ReservedQuantity = 3 },
                new() { WarehouseId = hcmWarehouse.Id, ItemNo = "BOHODECOR", AvailableQuantity = 18, ReservedQuantity = 2 },

                // Fashion
                new() { WarehouseId = hcmWarehouse.Id, ItemNo = "SHIRT01", AvailableQuantity = 40, ReservedQuantity = 5 },
                new() { WarehouseId = hnWarehouse.Id, ItemNo = "SHIRT01", AvailableQuantity = 18, ReservedQuantity = 3 },
                new() { WarehouseId = hcmWarehouse.Id, ItemNo = "SHIRT02", AvailableQuantity = 35, ReservedQuantity = 4 },
                new() { WarehouseId = hcmWarehouse.Id, ItemNo = "SHIRT03", AvailableQuantity = 55, ReservedQuantity = 6 },
                new() { WarehouseId = hcmWarehouse.Id, ItemNo = "DRESS01", AvailableQuantity = 28, ReservedQuantity = 3 },
                new() { WarehouseId = hcmWarehouse.Id, ItemNo = "DRESS02", AvailableQuantity = 22, ReservedQuantity = 4 },
                new() { WarehouseId = hcmWarehouse.Id, ItemNo = "TOP01", AvailableQuantity = 28, ReservedQuantity = 3 },

                // Footwear
                new() { WarehouseId = hcmWarehouse.Id, ItemNo = "SHOES01", AvailableQuantity = 48, ReservedQuantity = 5 },
                new() { WarehouseId = hcmWarehouse.Id, ItemNo = "SHOES02", AvailableQuantity = 20, ReservedQuantity = 2 },
                new() { WarehouseId = hcmWarehouse.Id, ItemNo = "SANDAL01", AvailableQuantity = 65, ReservedQuantity = 8 },
                new() { WarehouseId = dnWarehouse.Id, ItemNo = "SANDAL01", AvailableQuantity = 32, ReservedQuantity = 4 },
                new() { WarehouseId = hcmWarehouse.Id, ItemNo = "SNEAKER01", AvailableQuantity = 42, ReservedQuantity = 6 },

                // Watches & Accessories
                new() { WarehouseId = hcmWarehouse.Id, ItemNo = "WATCH01", AvailableQuantity = 20, ReservedQuantity = 2 },
                new() { WarehouseId = hcmWarehouse.Id, ItemNo = "WATCH02", AvailableQuantity = 14, ReservedQuantity = 2 },
                new() { WarehouseId = hcmWarehouse.Id, ItemNo = "WATCH03", AvailableQuantity = 28, ReservedQuantity = 4 },
                new() { WarehouseId = hcmWarehouse.Id, ItemNo = "WATCH04", AvailableQuantity = 50, ReservedQuantity = 5 },
                new() { WarehouseId = hcmWarehouse.Id, ItemNo = "WATCH05", AvailableQuantity = 12, ReservedQuantity = 2 },
                new() { WarehouseId = hcmWarehouse.Id, ItemNo = "SUNGLASS01", AvailableQuantity = 32, ReservedQuantity = 4 },
                new() { WarehouseId = hcmWarehouse.Id, ItemNo = "SUNGLASS02", AvailableQuantity = 40, ReservedQuantity = 5 },
                new() { WarehouseId = hcmWarehouse.Id, ItemNo = "BAG01", AvailableQuantity = 16, ReservedQuantity = 3 },
                new() { WarehouseId = hcmWarehouse.Id, ItemNo = "BAG02", AvailableQuantity = 20, ReservedQuantity = 3 },
                new() { WarehouseId = hcmWarehouse.Id, ItemNo = "JEWEL01", AvailableQuantity = 35, ReservedQuantity = 4 },
                new() { WarehouseId = hcmWarehouse.Id, ItemNo = "JEWEL02", AvailableQuantity = 26, ReservedQuantity = 3 },

                // Automotive & Motorcycle
                new() { WarehouseId = hcmWarehouse.Id, ItemNo = "FILTER01", AvailableQuantity = 40, ReservedQuantity = 5 },
                new() { WarehouseId = hcmWarehouse.Id, ItemNo = "AUTO01", AvailableQuantity = 60, ReservedQuantity = 6 },
                new() { WarehouseId = hcmWarehouse.Id, ItemNo = "AUTO02", AvailableQuantity = 15, ReservedQuantity = 2 },
                new() { WarehouseId = hcmWarehouse.Id, ItemNo = "MOTO01", AvailableQuantity = 8, ReservedQuantity = 1 },
                new() { WarehouseId = hcmWarehouse.Id, ItemNo = "MOTO02", AvailableQuantity = 5, ReservedQuantity = 1 },

                // Furniture
                new() { WarehouseId = hcmWarehouse.Id, ItemNo = "TABLE01", AvailableQuantity = 10, ReservedQuantity = 2 },
                new() { WarehouseId = hcmWarehouse.Id, ItemNo = "CHAIR01", AvailableQuantity = 6, ReservedQuantity = 1 },
                new() { WarehouseId = hcmWarehouse.Id, ItemNo = "SHELF01", AvailableQuantity = 30, ReservedQuantity = 4 },

                // Lighting
                new() { WarehouseId = hcmWarehouse.Id, ItemNo = "LIGHT01", AvailableQuantity = 35, ReservedQuantity = 5 },
                new() { WarehouseId = hnWarehouse.Id, ItemNo = "LIGHT01", AvailableQuantity = 18, ReservedQuantity = 2 },
                new() { WarehouseId = hcmWarehouse.Id, ItemNo = "LIGHT02", AvailableQuantity = 48, ReservedQuantity = 6 },
            };

            context.WarehouseStocks.AddRange(stockItems);
            await context.SaveChangesAsync();

            Log.Information("Seeded {Count} warehouse stock entries", stockItems.Count);
        }

        if (!context.InventoryEntries.Any())
        {
            var warehouses = context.Warehouses.ToList();
            var hcmWarehouse = warehouses.First(w => w.Code == "WH-HCM-01");
            var hnWarehouse = warehouses.First(w => w.Code == "WH-HN-01");

            // Seed sample inventory entries (purchase orders that created initial stock)
            var entries = new List<InventoryEntry>
            {
                new() { DocumentNo = "PO-2024-001", ItemNo = "IPHONE9", Quantity = 80, DocumentType = "Purchase", WarehouseId = hcmWarehouse.Id },
                new() { DocumentNo = "PO-2024-001", ItemNo = "GALAXY9", Quantity = 36, DocumentType = "Purchase", WarehouseId = hcmWarehouse.Id },
                new() { DocumentNo = "PO-2024-001", ItemNo = "MACBOOKPRO", Quantity = 83, DocumentType = "Purchase", WarehouseId = hcmWarehouse.Id },
                new() { DocumentNo = "PO-2024-002", ItemNo = "IPHONE9", Quantity = 33, DocumentType = "Purchase", WarehouseId = hnWarehouse.Id },
                new() { DocumentNo = "PO-2024-002", ItemNo = "OPPOF19", Quantity = 123, DocumentType = "Purchase", WarehouseId = hcmWarehouse.Id },
                new() { DocumentNo = "SO-2024-001", ItemNo = "IPHONE9", Quantity = -5, DocumentType = "Sales", ExternalDocumentNo = "ORD-001", WarehouseId = hcmWarehouse.Id },
                new() { DocumentNo = "SO-2024-002", ItemNo = "MACBOOKPRO", Quantity = -2, DocumentType = "Sales", ExternalDocumentNo = "ORD-002", WarehouseId = hcmWarehouse.Id },
                new() { DocumentNo = "ADJ-2024-001", ItemNo = "GALAXY9", Quantity = -1, DocumentType = "Adjustment", WarehouseId = hcmWarehouse.Id },
            };

            context.InventoryEntries.AddRange(entries);
            await context.SaveChangesAsync();

            Log.Information("Seeded {Count} inventory entries", entries.Count);
        }
    }
}
