using FlashSale.API.Entities;
using Microsoft.EntityFrameworkCore;
using Serilog;

namespace FlashSale.API.Persistence;

public static class FlashSaleContextSeed
{
    public static async Task SeedAsync(FlashSaleContext context, Serilog.ILogger logger)
    {
        if (!await context.FlashSaleSessions.AnyAsync())
        {
            var session = new FlashSaleSession
            {
                Name = "Grand Opening Flash Sale",
                Description = "Massive discounts on electronics and lifestyle products",
                StartTime = DateTime.UtcNow.AddDays(1),
                EndTime = DateTime.UtcNow.AddDays(1).AddHours(4),
                Status = "Draft",
                MaxConcurrentUsers = 100000,
                Items = new List<FlashSaleItem>
                {
                    new()
                    {
                        ProductNo = "Lotus",
                        ProductName = "Lotus Tea Premium",
                        OriginalPrice = 250000m,
                        FlashPrice = 99000m,
                        TotalStock = 500,
                        MaxPerUser = 2,
                        ImageUrl = "/images/lotus-tea.jpg"
                    },
                    new()
                    {
                        ProductNo = "Jasmine",
                        ProductName = "Jasmine Rice 5kg",
                        OriginalPrice = 180000m,
                        FlashPrice = 79000m,
                        TotalStock = 1000,
                        MaxPerUser = 3,
                        ImageUrl = "/images/jasmine-rice.jpg"
                    }
                }
            };

            await context.FlashSaleSessions.AddAsync(session);
            await context.SaveChangesAsync();
            logger.Information("Seeded FlashSale database with {Count} sessions", 1);
        }
    }
}
