using Product.API.Entities;
using ILogger = Serilog.ILogger;

namespace Product.API.Persistence;

public class ProductContextSeed
{
    public static async Task SeedProductAsync(ProductContext productContext, ILogger logger)
    {
        if (!productContext.Products.Any())
        {
            productContext.AddRange(getCatalogProducts());
            await productContext.SaveChangesAsync();
            logger.Information(messageTemplate: "Seeded data for Product DB associated with context {DbContextName}",
                propertyValue: nameof(ProductContext));
        }
    }

    private static IEnumerable<CatalogProduct> getCatalogProducts()
    {
        return new List<CatalogProduct>
        {
            new()
            {
                No = "Lotus",
                Name = "Esprit",
                Summary = "Nondisplaced fracture of greater trochanter of right femur",
                Description = "Nondisplaced fracture of greater trochanter of right femur",
                Price = (decimal)177946.49
            }
        };
    }
}