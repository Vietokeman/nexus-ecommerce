using Microsoft.EntityFrameworkCore;
using Seller.API.Entities;
using ILogger = Serilog.ILogger;

namespace Seller.API.Persistence
{
    public class SellerContextSeed
    {
        public static async Task SeedSellerAsync(SellerContext context, ILogger logger)
        {
            if (!await context.SellerProducts.AnyAsync())
            {
                context.AddRange(GetSeedProducts());
                await context.SaveChangesAsync();
                logger.Information("Seeded Seller database with {Count} products", GetSeedProducts().Count());
            }
        }

        private static IEnumerable<SellerProduct> GetSeedProducts()
        {
            return new List<SellerProduct>
            {
                new()
                {
                    No = "SELLER-001",
                    SellerUserName = "seller_demo",
                    Name = "Áo Sơ Mi Nam Oxford Cao Cấp",
                    Summary = "Áo sơ mi nam chất liệu Oxford cotton 100%",
                    Description = "Áo sơ mi nam Oxford cao cấp, chất liệu cotton 100% thoáng mát, form regular fit phù hợp mọi dáng người. Thiết kế cổ button-down trẻ trung, phù hợp đi làm và đi chơi.",
                    Price = 299000,
                    Category = "Thời trang nam",
                    ImageUrl = "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=500",
                    SeoTitle = "Áo Sơ Mi Nam Oxford Cotton - Cao Cấp Thoáng Mát",
                    SeoDescription = "Mua áo sơ mi nam Oxford cotton 100% cao cấp, form regular fit thoáng mát. Giao hàng nhanh, đổi trả miễn phí.",
                    SeoKeywords = "áo sơ mi nam,oxford,cotton,cao cấp",
                    Highlights = "Cotton 100% thoáng mát|Form regular fit|Cổ button-down trẻ trung|Đổi trả miễn phí 30 ngày",
                    StockQuantity = 150,
                    Status = "Active"
                },
                new()
                {
                    No = "SELLER-002",
                    SellerUserName = "seller_demo",
                    Name = "Váy Đầm Maxi Đi Biển Hoa Nhí",
                    Summary = "Váy đầm maxi dáng xòe phong cách boho",
                    Description = "Váy đầm maxi đi biển họa tiết hoa nhí phong cách boho chic, chất liệu voan lụa mềm mại. Thiết kế dáng xòe nữ tính, có dây buộc eo tạo dáng.",
                    Price = 459000,
                    Category = "Thời trang nữ",
                    ImageUrl = "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500",
                    SeoTitle = "Váy Đầm Maxi Đi Biển Hoa Nhí - Boho Chic",
                    SeoDescription = "Váy đầm maxi đi biển hoa nhí phong cách boho chic. Chất voan lụa mềm mại, dáng xòe nữ tính. Freeship.",
                    SeoKeywords = "váy đầm,maxi,đi biển,boho,hoa nhí",
                    Highlights = "Voan lụa mềm mại|Phong cách Boho Chic|Dáng xòe nữ tính|Phù hợp đi biển, dự tiệc",
                    StockQuantity = 80,
                    Status = "Active"
                },
                new()
                {
                    No = "SELLER-003",
                    SellerUserName = "seller_demo",
                    Name = "Tai Nghe Bluetooth TWS Pro Max",
                    Summary = "Tai nghe không dây chống ồn chủ động ANC",
                    Description = "Tai nghe Bluetooth TWS Pro Max với công nghệ chống ồn chủ động ANC, pin 30 giờ, kháng nước IPX5. Âm bass mạnh mẽ, kết nối Bluetooth 5.3 siêu ổn định.",
                    Price = 890000,
                    Category = "Điện tử",
                    ImageUrl = "https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=500",
                    SeoTitle = "Tai Nghe Bluetooth TWS Pro Max - ANC Chống Ồn",
                    SeoDescription = "Tai nghe Bluetooth TWS Pro Max chống ồn ANC, pin 30h, kháng nước IPX5. Bluetooth 5.3 siêu ổn định.",
                    SeoKeywords = "tai nghe,bluetooth,tws,chống ồn,ANC",
                    Highlights = "Chống ồn chủ động ANC|Pin 30 giờ|Kháng nước IPX5|Bluetooth 5.3",
                    StockQuantity = 200,
                    Status = "Active"
                }
            };
        }
    }
}
