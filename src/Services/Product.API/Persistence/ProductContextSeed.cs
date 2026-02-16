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
            // ==================== SMARTPHONES ====================
            new()
            {
                No = "IPHONE9",
                Name = "iPhone 9",
                Summary = "An apple mobile which is nothing like apple",
                Description = "An apple mobile which is nothing like apple. Features a 6.1-inch display, A13 Bionic chip, and dual camera system.",
                Price = 549m,
                Category = "smartphones",
                ImageUrl = "https://cdn.dummyjson.com/product-images/1/thumbnail.jpg",
                Attributes = "{\"brand\": \"Apple\", \"discountPercentage\": 12.96, \"stockQuantity\": 94, \"rating\": 4.69}"
            },
            new()
            {
                No = "GALAXY9",
                Name = "Samsung Universe 9",
                Summary = "Samsung's new variant which goes beyond Galaxy",
                Description = "Samsung's new variant which goes beyond Galaxy to the Universe. Powered by Exynos processor with enhanced AI capabilities.",
                Price = 1249m,
                Category = "smartphones",
                ImageUrl = "https://cdn.dummyjson.com/product-images/3/thumbnail.jpg",
                Attributes = "{\"brand\": \"Samsung\", \"discountPercentage\": 15.46, \"stockQuantity\": 36, \"rating\": 4.09}"
            },
            new()
            {
                No = "OPPOF19",
                Name = "OPPO F19",
                Summary = "OPPO F19 officially announced April 2021",
                Description = "OPPO F19 is officially announced on April 2021. The device features a 6.43-inch AMOLED display, 48MP triple camera, and 5000mAh battery.",
                Price = 280m,
                Category = "smartphones",
                ImageUrl = "https://cdn.dummyjson.com/product-images/4/thumbnail.jpg",
                Attributes = "{\"brand\": \"OPPO\", \"discountPercentage\": 17.91, \"stockQuantity\": 123, \"rating\": 4.30}"
            },
            new()
            {
                No = "HUAWEIP30",
                Name = "Huawei P30",
                Summary = "Huawei's re-badged P30 Pro New Edition",
                Description = "Huawei's re-badged P30 Pro New Edition was officially unveiled yesterday in Germany and now the device has made its way to the UK. Features Leica quad camera system.",
                Price = 499m,
                Category = "smartphones",
                ImageUrl = "https://cdn.dummyjson.com/product-images/5/thumbnail.jpg",
                Attributes = "{\"brand\": \"Huawei\", \"discountPercentage\": 10.58, \"stockQuantity\": 32, \"rating\": 4.09}"
            },
            
            // ==================== LAPTOPS ====================
            new()
            {
                No = "MACBOOKPRO",
                Name = "MacBook Pro",
                Summary = "MacBook Pro 2021 with mini-LED display",
                Description = "MacBook Pro 2021 with mini-LED display may launch between September, November. Features M1 Pro/Max chip, up to 64GB RAM, and stunning Liquid Retina XDR display.",
                Price = 1749m,
                Category = "laptops",
                ImageUrl = "https://cdn.dummyjson.com/product-images/6/thumbnail.png",
                Attributes = "{\"brand\": \"Apple\", \"discountPercentage\": 11.02, \"stockQuantity\": 83, \"rating\": 4.57}"
            },
            new()
            {
                No = "GALAXYBOOK",
                Name = "Samsung Galaxy Book",
                Summary = "Samsung Galaxy Book S (2020) Laptop",
                Description = "Samsung Galaxy Book S (2020) Laptop With Intel Lakefield Chip, 8GB of RAM Launched. Ultra-portable design with all-day battery life.",
                Price = 1499m,
                Category = "laptops",
                ImageUrl = "https://cdn.dummyjson.com/product-images/7/thumbnail.jpg",
                Attributes = "{\"brand\": \"Samsung\", \"discountPercentage\": 4.15, \"stockQuantity\": 50, \"rating\": 4.25}"
            },
            new()
            {
                No = "SURFACE4",
                Name = "Microsoft Surface Laptop 4",
                Summary = "Style and speed",
                Description = "Style and speed. Stand out on HD video calls backed by Studio Mics. Capture ideas on the vibrant touchscreen. Powered by Intel Core or AMD Ryzen processors.",
                Price = 1499m,
                Category = "laptops",
                ImageUrl = "https://cdn.dummyjson.com/product-images/8/thumbnail.jpg",
                Attributes = "{\"brand\": \"Microsoft\", \"discountPercentage\": 10.23, \"stockQuantity\": 68, \"rating\": 4.43}"
            },
            new()
            {
                No = "INFINIX",
                Name = "Infinix INBOOK",
                Summary = "Infinix Inbook X1",
                Description = "Infinix Inbook X1 Ci3 10th 8GB 256GB 14 Win10 Grey – 1 Year Warranty. Perfect laptop for students and professionals.",
                Price = 1099m,
                Category = "laptops",
                ImageUrl = "https://cdn.dummyjson.com/product-images/9/thumbnail.jpg",
                Attributes = "{\"brand\": \"Infinix\", \"discountPercentage\": 11.83, \"stockQuantity\": 96, \"rating\": 4.54}"
            },
            new()
            {
                No = "HPPAVILION",
                Name = "HP Pavilion 15-DK1056WM",
                Summary = "HP Pavilion Gaming Laptop",
                Description = "HP Pavilion 15-DK1056WM Gaming Laptop 10th Gen Core i5, 8GB, 256GB SSD, GTX 1650 4GB, Windows 10. Great for gaming and productivity.",
                Price = 1099m,
                Category = "laptops",
                ImageUrl = "https://cdn.dummyjson.com/product-images/10/thumbnail.jpeg",
                Attributes = "{\"brand\": \"HP\", \"discountPercentage\": 6.18, \"stockQuantity\": 89, \"rating\": 4.43}"
            },

            // ==================== FRAGRANCES ====================
            new()
            {
                No = "PERFUME100",
                Name = "Fog Scent Xpressio Perfume",
                Summary = "Best Fog Scent Perfume 100ml For Men",
                Description = "Product details of Best Fog Scent Xpressio Perfume 100ml For Men cool long lasting perfumes for Men. Premium quality fragrance.",
                Price = 13m,
                Category = "fragrances",
                ImageUrl = "https://cdn.dummyjson.com/product-images/13/thumbnail.webp",
                Attributes = "{\"brand\": \"Fog Scent\", \"discountPercentage\": 8.14, \"stockQuantity\": 65, \"rating\": 4.26}"
            },
            
            // ==================== SKINCARE ====================
            new()
            {
                No = "TREEOIL",
                Name = "Tree Oil 30ml",
                Summary = "Tea tree oil for skin care",
                Description = "Tea tree oil is a popular choice for treating acne because of its anti-inflammatory and antimicrobial properties. It's thought to calm redness, swelling, and inflammation.",
                Price = 12m,
                Category = "skincare",
                ImageUrl = "https://cdn.dummyjson.com/product-images/17/thumbnail.jpg",
                Attributes = "{\"brand\": \"Hemani Tea\", \"discountPercentage\": 4.09, \"stockQuantity\": 78, \"rating\": 4.52}"
            },
            new()
            {
                No = "OILFREE",
                Name = "Oil Free Moisturizer 100ml",
                Summary = "Dermive Oil Free Moisturizer",
                Description = "Dermive Oil Free Moisturizer with SPF 20 is specifically formulated with ceramides, hyaluronic acid & sunscreen to provide 24 hour hydration to the skin.",
                Price = 40m,
                Category = "skincare",
                ImageUrl = "https://cdn.dummyjson.com/product-images/18/thumbnail.jpg",
                Attributes = "{\"brand\": \"Dermive\", \"discountPercentage\": 13.1, \"stockQuantity\": 88, \"rating\": 4.56}"
            },
            
            // ==================== GROCERIES ====================
            new()
            {
                No = "STRAWBERRY",
                Name = "Strawberry",
                Summary = "Fresh Strawberries",
                Description = "Strawberry is a widely grown hybrid species of the genus Fragaria. It is cultivated worldwide for its fruit. Packed with vitamins, fiber, and antioxidants.",
                Price = 9m,
                Category = "groceries",
                ImageUrl = "https://cdn.dummyjson.com/product-images/21/thumbnail.png",
                Attributes = "{\"brand\": \"Fresh Farms\", \"discountPercentage\": 4.59, \"stockQuantity\": 112, \"rating\": 4.20}"
            },
            new()
            {
                No = "ORANGE",
                Name = "Orange Essence Food Flavour",
                Summary = "Orange Essence Food Flavour",
                Description = "Specifications of Orange Essence Food Flavour For Cakes and Baking Food Item Baking Food Drink 5ml Pack of 4. Perfect for adding natural orange flavor to your recipes.",
                Price = 14m,
                Category = "groceries",
                ImageUrl = "https://cdn.dummyjson.com/product-images/22/thumbnail.jpg",
                Attributes = "{\"brand\": \"Fresh Farms\", \"discountPercentage\": 8.04, \"stockQuantity\": 26, \"rating\": 4.85}"
            },

            // ==================== HOME DECORATION ====================
            new()
            {
                No = "VASE",
                Name = "Handcraft Chinese style",
                Summary = "Chinese style art luxury ceramic vase",
                Description = "Handcraft Chinese style art luxury palace hotel villa mansion home decor ceramic vase. Features traditional Chinese patterns and premium ceramic construction.",
                Price = 60m,
                Category = "home-decoration",
                ImageUrl = "https://cdn.dummyjson.com/product-images/23/thumbnail.jpg",
                Attributes = "{\"brand\": \"Luxury Palace\", \"discountPercentage\": 15.58, \"stockQuantity\": 7, \"rating\": 4.44}"
            },
            new()
            {
                No = "FLOWER",
                Name = "Metal Ceramic Flower",
                Summary = "Metal Ceramic Flower Badge Decor",
                Description = "Metal Ceramic Flower Retro Cylinder Office Badge Decor for Home Bathroom. Unique vintage design perfect for modern homes.",
                Price = 35m,
                Category = "home-decoration",
                ImageUrl = "https://cdn.dummyjson.com/product-images/24/thumbnail.jpg",
                Attributes = "{\"brand\": \"Golden\", \"discountPercentage\": 3.15, \"stockQuantity\": 54, \"rating\": 4.21}"
            },

            // ==================== FASHION ====================
            new()
            {
                No = "SHIRT01",
                Name = "OMG Printed Tshirt",
                Summary = "Printed T-shirt for Men",
                Description = "Sleeveless Printed T-shirt for Men. Cool and comfortable cotton fabric. Perfect for casual wear.",
                Price = 20m,
                Category = "tops",
                ImageUrl = "https://cdn.dummyjson.com/product-images/28/thumbnail.jpg",
                Attributes = "{\"brand\": \"Soft Cotton\", \"discountPercentage\": 12.05, \"stockQuantity\": 61, \"rating\": 4.26}"
            },
            new()
            {
                No = "DRESS01",
                Name = "Sleeveless Midi Dress",
                Summary = "Sleeveless Midi Dress",
                Description = "Sleeveless Midi Dress Featuring Rounded Neckline. The Reason Printed Multicolour Dress Belongs To The House Of Prism.",
                Price = 45m,
                Category = "womens-dresses",
                ImageUrl = "https://cdn.dummyjson.com/product-images/30/thumbnail.jpg",
                Attributes = "{\"brand\": \"Ghazi Fabric\", \"discountPercentage\": 5.96, \"stockQuantity\": 43, \"rating\": 4.71}"
            },

            // ==================== FOOTWEAR ====================
            new()
            {
                No = "SHOES01",
                Name = "Leather Strappy Sandals",
                Summary = "Leather Strappy Sandals",
                Description = "Leather Strappy Sandals With Buckle Detail. Contrast Sole. Rounded Toe. Straps. Buckled Ankle Strap.",
                Price = 65m,
                Category = "womens-shoes",
                ImageUrl = "https://cdn.dummyjson.com/product-images/31/thumbnail.jpg",
                Attributes = "{\"brand\": \"IELGY\", \"discountPercentage\": 12.75, \"stockQuantity\": 76, \"rating\": 4.56}"
            },
            new()
            {
                No = "SANDAL01",
                Name = "Flip-Flops Sandals",
                Summary = "Beach Flip-Flops",
                Description = "Geometric Printed Flip-Flops & Beaches Slipper For Men & Women. Comfortable and durable for everyday wear.",
                Price = 15m,
                Category = "mens-shoes",
                ImageUrl = "https://cdn.dummyjson.com/product-images/32/thumbnail.jpg",
                Attributes = "{\"brand\": \"Sandals Flip Flops\", \"discountPercentage\": 10.05, \"stockQuantity\": 102, \"rating\": 4.29}"
            },

            // ==================== ACCESSORIES ====================
            new()
            {
                No = "WATCH01",
                Name = "Brown Leather Belt Watch",
                Summary = "Stylish Brown Leather Belt Watch",
                Description = "Stylish Brown Leather Belt Watch For Girls And Boys! For Casual, Amalfi By Rangoli Analog Watch - For Men & Women.",
                Price = 89m,
                Category = "womens-watches",
                ImageUrl = "https://cdn.dummyjson.com/product-images/33/thumbnail.jpg",
                Attributes = "{\"brand\": \"Amalfi\", \"discountPercentage\": 6.05, \"stockQuantity\": 32, \"rating\": 4.42}"
            },
            new()
            {
                No = "WATCH02",
                Name = "Pocket Watch Leather Pouch",
                Summary = "Luxury Pocket Watch",
                Description = "Pocket Watch Leather Pouch. Pendant Pocket Watch: The chain can be tucked into pocket watch cardholder. Suitable for gift.",
                Price = 120m,
                Category = "mens-watches",
                ImageUrl = "https://cdn.dummyjson.com/product-images/34/thumbnail.jpg",
                Attributes = "{\"brand\": \"The Warehouse\", \"discountPercentage\": 4.35, \"stockQuantity\": 22, \"rating\": 4.55}"
            },
            new()
            {
                No = "SUNGLASS01",
                Name = "Metal Sunglasses",
                Summary = "Luxury Metal Sunglasses",
                Description = "Fashion Oversized Metal Sunglasses For UV Protection At The Beach. Stylish and protective with 100% UV protection.",
                Price = 85m,
                Category = "sunglasses",
                ImageUrl = "https://cdn.dummyjson.com/product-images/37/thumbnail.jpg",
                Attributes = "{\"brand\": \"Luxury\", \"discountPercentage\": 11.92, \"stockQuantity\": 50, \"rating\": 4.70}"
            },
            new()
            {
                No = "BAG01",
                Name = "Women Handbag Black",
                Summary = "Elegant Black Handbag",
                Description = "Women Hand Bag High Quality Luxury Designer Leather Handbags. Perfect for office and casual occasions.",
                Price = 110m,
                Category = "womens-bags",
                ImageUrl = "https://cdn.dummyjson.com/product-images/46/thumbnail.jpg",
                Attributes = "{\"brand\": \"Luxury Bags\", \"discountPercentage\": 9.45, \"stockQuantity\": 27, \"rating\": 4.42}"
            },

            // ==================== AUTOMOTIVE ====================
            new()
            {
                No = "FILTER01",
                Name = "Dust Cover for Car",
                Summary = "Dustproof Car Cover",
                Description = "Dust Cover for Car Windshield Protector. UV Protection and waterproof material. Fits most vehicles.",
                Price = 55m,
                Category = "automotive",
                ImageUrl = "https://cdn.dummyjson.com/product-images/67/thumbnail.jpg",
                Attributes = "{\"brand\": \"Auto Care\", \"discountPercentage\": 4.25, \"stockQuantity\": 64, \"rating\": 4.55}"
            },

            // ==================== FURNITURE ====================
            new()
            {
                No = "TABLE01",
                Name = "Wooden Dining Table",
                Summary = "Solid Wood Dining Table",
                Description = "Solid Wood Dining Table With 6 Chairs. Premium quality wood with elegant finish. Perfect for family dining.",
                Price = 650m,
                Category = "furniture",
                ImageUrl = "https://cdn.dummyjson.com/product-images/25/thumbnail.jpg",
                Attributes = "{\"brand\": \"Furniture Bed Set\", \"discountPercentage\": 12.25, \"stockQuantity\": 15, \"rating\": 4.55}"
            },
            new()
            {
                No = "CHAIR01",
                Name = "Ratttan Outdoor Chair Set",
                Summary = "Outdoor Furniture Set",
                Description = "3 Piece Rattan Sofa Seating Group with Cushions. Weather-resistant and comfortable for outdoor use.",
                Price = 850m,
                Category = "furniture",
                ImageUrl = "https://cdn.dummyjson.com/product-images/26/thumbnail.jpg",
                Attributes = "{\"brand\": \"Ratttan Outdoor\", \"discountPercentage\": 8.95, \"stockQuantity\": 9, \"rating\": 4.75}"
            }
        };
    }
}
