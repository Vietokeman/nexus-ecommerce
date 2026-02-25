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
            },

            // ==================== ADDITIONAL SMARTPHONES ====================
            new()
            {
                No = "GALAXY_S21",
                Name = "Samsung Galaxy S21",
                Summary = "Samsung flagship 2021",
                Description = "Samsung Galaxy S21 5G with Dynamic AMOLED 2X, 120Hz display, triple camera system, and Snapdragon 888 processor.",
                Price = 799m,
                Category = "smartphones",
                ImageUrl = "https://cdn.dummyjson.com/product-images/3/thumbnail.jpg",
                Attributes = "{\"brand\": \"Samsung\", \"discountPercentage\": 8.5, \"stockQuantity\": 45, \"rating\": 4.55}"
            },
            new()
            {
                No = "IPHONE14PRO",
                Name = "iPhone 14 Pro",
                Summary = "Apple iPhone 14 Pro with Dynamic Island",
                Description = "Apple iPhone 14 Pro featuring Dynamic Island, Always-On display, 48MP camera system, and A16 Bionic chip.",
                Price = 1299m,
                Category = "smartphones",
                ImageUrl = "https://cdn.dummyjson.com/product-images/1/thumbnail.jpg",
                Attributes = "{\"brand\": \"Apple\", \"discountPercentage\": 5.15, \"stockQuantity\": 58, \"rating\": 4.82}"
            },

            // ==================== ADDITIONAL FRAGRANCES ====================
            new()
            {
                No = "ROYALMIRAGE",
                Name = "Royal Mirage Deluxe",
                Summary = "Royal Mirage premium fragrance",
                Description = "Royal Mirage Crystal Deodorant Body Spray. Long-lasting premium body spray with subtle and elegant notes.",
                Price = 25m,
                Category = "fragrances",
                ImageUrl = "https://cdn.dummyjson.com/product-images/14/thumbnail.jpg",
                Attributes = "{\"brand\": \"Royal Mirage\", \"discountPercentage\": 5.0, \"stockQuantity\": 48, \"rating\": 4.35}"
            },
            new()
            {
                No = "ALDREHABOIL",
                Name = "Lord Concentrated Perfume Oil",
                Summary = "Lord Al-Rehab perfume oil",
                Description = "Lord - Loss One-lined Free-flowing Double-breasted Top Coat. Premium Arabian concentrated perfume oil with long lasting fragrance.",
                Price = 30m,
                Category = "fragrances",
                ImageUrl = "https://cdn.dummyjson.com/product-images/15/thumbnail.jpg",
                Attributes = "{\"brand\": \"Lord Al-Rehab\", \"discountPercentage\": 12.15, \"stockQuantity\": 35, \"rating\": 4.59}"
            },
            new()
            {
                No = "ACQUADIGIO",
                Name = "Impression of Acqua Di Gio",
                Summary = "Acqua Di Gio inspired perfume",
                Description = "Our Impression of Acqua Di Gio for Men. Fresh aquatic fragrance with notes of marine accords, citrus and woods.",
                Price = 20m,
                Category = "fragrances",
                ImageUrl = "https://cdn.dummyjson.com/product-images/11/thumbnail.jpg",
                Attributes = "{\"brand\": \"Acqua Di Gio\", \"discountPercentage\": 7.0, \"stockQuantity\": 55, \"rating\": 4.26}"
            },

            // ==================== ADDITIONAL SKINCARE ====================
            new()
            {
                No = "RICESERUM",
                Name = "White Rice Skin Beauty Serum",
                Summary = "Rice extract skin serum",
                Description = "ROREC White Rice Skin Beauty Serum For Face Whitening, Anti-aging, Moisturizing, Oil Control. Natural ingredients for radiant skin.",
                Price = 18m,
                Category = "skincare",
                ImageUrl = "https://cdn.dummyjson.com/product-images/19/thumbnail.jpg",
                Attributes = "{\"brand\": \"ROREC White Rice\", \"discountPercentage\": 10.68, \"stockQuantity\": 65, \"rating\": 4.31}"
            },
            new()
            {
                No = "LOREAL01",
                Name = "L'Oreal Paris Skin Perfect",
                Summary = "L'Oreal daily skincare",
                Description = "L'Oréal Paris Skin Perfect 30+ Day Cream. Anti-fine lines, Whitening, Even tone, UV protection.",
                Price = 35m,
                Category = "skincare",
                ImageUrl = "https://cdn.dummyjson.com/product-images/16/thumbnail.jpg",
                Attributes = "{\"brand\": \"L'Oreal Paris\", \"discountPercentage\": 5.0, \"stockQuantity\": 40, \"rating\": 4.60}"
            },
            new()
            {
                No = "FAIRCLEAR",
                Name = "Fair & Clear Cream 35ml",
                Summary = "Fair & Clear Anti Cream",
                Description = "Fair & Clear Face Cream by Fair & Clear Antl Cream. Dark spots removal cream for brighter, clearer skin.",
                Price = 12m,
                Category = "skincare",
                ImageUrl = "https://cdn.dummyjson.com/product-images/20/thumbnail.jpg",
                Attributes = "{\"brand\": \"Fair & Clear\", \"discountPercentage\": 3.45, \"stockQuantity\": 33, \"rating\": 4.12}"
            },

            // ==================== ADDITIONAL GROCERIES ====================
            new()
            {
                No = "MULTIGRAIN",
                Name = "Multi Grain Flour",
                Summary = "Baking flour multi grain",
                Description = "Multi Grain Flour Package Of Two Premium Quality. Perfect for baking bread, cookies, and pastries.",
                Price = 8m,
                Category = "groceries",
                ImageUrl = "https://cdn.dummyjson.com/product-images/23/thumbnail.jpg",
                Attributes = "{\"brand\": \"Bake Parlor Big\", \"discountPercentage\": 6.11, \"stockQuantity\": 95, \"rating\": 4.44}"
            },
            new()
            {
                No = "CEREAL01",
                Name = "Whole Grain Cereals",
                Summary = "Healthy whole grain cereals",
                Description = "Fauji Whole Grain Cereals – 250g pack. Nutritious breakfast cereal with vitamins and minerals.",
                Price = 5m,
                Category = "groceries",
                ImageUrl = "https://cdn.dummyjson.com/product-images/24/thumbnail.jpg",
                Attributes = "{\"brand\": \"Fauji\", \"discountPercentage\": 2.85, \"stockQuantity\": 150, \"rating\": 4.19}"
            },
            new()
            {
                No = "DRIEDROSE",
                Name = "Dried Rose Flowers",
                Summary = "Natural dried rose flowers",
                Description = "Saaf & Khaas Dried Rose Flowers 50g. Perfect for tea, skincare, and aromatherapy. 100% natural.",
                Price = 7m,
                Category = "groceries",
                ImageUrl = "https://cdn.dummyjson.com/product-images/25/thumbnail.jpg",
                Attributes = "{\"brand\": \"Saaf & Khaas\", \"discountPercentage\": 4.30, \"stockQuantity\": 72, \"rating\": 4.38}"
            },

            // ==================== ADDITIONAL HOME DECORATION ====================
            new()
            {
                No = "LEDLIGHT01",
                Name = "LED Fairy String Lights",
                Summary = "Decorative LED lights",
                Description = "3D Illusion LED Night Light With 7 Color Change. Neon LED light perfect for home decoration and gifting.",
                Price = 15m,
                Category = "home-decoration",
                ImageUrl = "https://cdn.dummyjson.com/product-images/26/thumbnail.jpg",
                Attributes = "{\"brand\": \"LED Lights\", \"discountPercentage\": 9.25, \"stockQuantity\": 85, \"rating\": 4.52}"
            },
            new()
            {
                No = "BOHODECOR",
                Name = "Bohemian Wall Hanging",
                Summary = "Boho macramé wall decor",
                Description = "Boho Decor Macramé Wall Hanging. Handmade cotton rope design perfect for living rooms and bedrooms.",
                Price = 45m,
                Category = "home-decoration",
                ImageUrl = "https://cdn.dummyjson.com/product-images/27/thumbnail.jpg",
                Attributes = "{\"brand\": \"Boho Decor\", \"discountPercentage\": 6.40, \"stockQuantity\": 28, \"rating\": 4.68}"
            },

            // ==================== ADDITIONAL FASHION ====================
            new()
            {
                No = "SHIRT02",
                Name = "Men's Slim Fit Shirt",
                Summary = "Professional slim fit shirt",
                Description = "Men's Slim Fit Professional Shirt with Spread Collar. Premium cotton blend fabric for office and casual wear.",
                Price = 35m,
                Category = "mens-shirts",
                ImageUrl = "https://cdn.dummyjson.com/product-images/43/thumbnail.jpg",
                Attributes = "{\"brand\": \"Professional Wear\", \"discountPercentage\": 7.12, \"stockQuantity\": 55, \"rating\": 4.33}"
            },
            new()
            {
                No = "SHIRT03",
                Name = "Cotton Casual Tee",
                Summary = "Soft cotton casual T-shirt",
                Description = "Digital Printed Soft Cotton Casual T-Shirt. Lightweight, breathable, and perfect for everyday styling.",
                Price = 18m,
                Category = "mens-shirts",
                ImageUrl = "https://cdn.dummyjson.com/product-images/44/thumbnail.jpg",
                Attributes = "{\"brand\": \"Digital Printed\", \"discountPercentage\": 15.20, \"stockQuantity\": 88, \"rating\": 4.18}"
            },
            new()
            {
                No = "DRESS02",
                Name = "Floral Print Maxi Dress",
                Summary = "Elegant floral maxi dress",
                Description = "Women's Floral Print Maxi Dress with V-neckline and flowy skirt. Perfect for summer outings and parties.",
                Price = 55m,
                Category = "womens-dresses",
                ImageUrl = "https://cdn.dummyjson.com/product-images/29/thumbnail.jpg",
                Attributes = "{\"brand\": \"Ghazi Fabric\", \"discountPercentage\": 9.80, \"stockQuantity\": 37, \"rating\": 4.55}"
            },
            new()
            {
                No = "TOP01",
                Name = "Knit Sweater Top",
                Summary = "Women's knit sweater top",
                Description = "Top Sweater Women knitted O-Neck Long Sleeve. Warm and stylish for autumn and winter seasons.",
                Price = 40m,
                Category = "tops",
                ImageUrl = "https://cdn.dummyjson.com/product-images/30/thumbnail.jpg",
                Attributes = "{\"brand\": \"Top Sweater\", \"discountPercentage\": 8.50, \"stockQuantity\": 42, \"rating\": 4.40}"
            },

            // ==================== ADDITIONAL FOOTWEAR ====================
            new()
            {
                No = "SNEAKER01",
                Name = "Running Sports Sneakers",
                Summary = "Lightweight running sneakers",
                Description = "Men's Lightweight Running Sports Sneakers with Breathable Mesh Upper and Cushioned Sole. Ideal for jogging and gym.",
                Price = 75m,
                Category = "mens-shoes",
                ImageUrl = "https://cdn.dummyjson.com/product-images/59/thumbnail.jpg",
                Attributes = "{\"brand\": \"Sneakers\", \"discountPercentage\": 11.20, \"stockQuantity\": 67, \"rating\": 4.51}"
            },
            new()
            {
                No = "SHOES02",
                Name = "Maasai Leather Sandals",
                Summary = "Handmade Maasai sandals",
                Description = "Handmade Maasai Leather Sandals with intricate beadwork. Durable and comfortable for everyday wear.",
                Price = 45m,
                Category = "womens-shoes",
                ImageUrl = "https://cdn.dummyjson.com/product-images/33/thumbnail.jpg",
                Attributes = "{\"brand\": \"Maasai Sandals\", \"discountPercentage\": 5.45, \"stockQuantity\": 31, \"rating\": 4.62}"
            },

            // ==================== ADDITIONAL WATCHES ====================
            new()
            {
                No = "WATCH03",
                Name = "Naviforce Military Watch",
                Summary = "Military style automatic watch",
                Description = "Naviforce Military Style Automatic Watch with Leather Strap. Water-resistant, luminous hands, and date display.",
                Price = 95m,
                Category = "mens-watches",
                ImageUrl = "https://cdn.dummyjson.com/product-images/61/thumbnail.jpg",
                Attributes = "{\"brand\": \"Naviforce\", \"discountPercentage\": 7.85, \"stockQuantity\": 44, \"rating\": 4.47}"
            },
            new()
            {
                No = "WATCH04",
                Name = "SKMEI Digital Watch",
                Summary = "SKMEI digital sports watch",
                Description = "SKMEI 9117 Digital Sports Watch with LED Display, Alarm, and Stopwatch. Waterproof and durable.",
                Price = 55m,
                Category = "mens-watches",
                ImageUrl = "https://cdn.dummyjson.com/product-images/62/thumbnail.jpg",
                Attributes = "{\"brand\": \"SKMEI\", \"discountPercentage\": 13.50, \"stockQuantity\": 78, \"rating\": 4.22}"
            },
            new()
            {
                No = "WATCH05",
                Name = "Rose Gold Bracelet Watch",
                Summary = "Women's rose gold bracelet watch",
                Description = "Women's Luxury Rose Gold Bracelet Watch with Diamond Accents. Elegant design for both casual and formal occasions.",
                Price = 150m,
                Category = "womens-watches",
                ImageUrl = "https://cdn.dummyjson.com/product-images/63/thumbnail.jpg",
                Attributes = "{\"brand\": \"Watch Pearls\", \"discountPercentage\": 6.20, \"stockQuantity\": 19, \"rating\": 4.72}"
            },

            // ==================== ADDITIONAL ACCESSORIES ====================
            new()
            {
                No = "JEWEL01",
                Name = "Gold Plated Necklace Set",
                Summary = "Gold plated jewelry set",
                Description = "Fashion Jewellery Gold Plated Necklace Set with Earrings. Elegant design perfect for weddings and celebrations.",
                Price = 35m,
                Category = "womens-jewellery",
                ImageUrl = "https://cdn.dummyjson.com/product-images/64/thumbnail.jpg",
                Attributes = "{\"brand\": \"Fashion Jewellery\", \"discountPercentage\": 8.75, \"stockQuantity\": 52, \"rating\": 4.38}"
            },
            new()
            {
                No = "JEWEL02",
                Name = "Butterfly Cuff Bracelet",
                Summary = "Crystal butterfly bracelet",
                Description = "Cuff Butterfly Crystal Bracelet with Silver-tone Finish. Adjustable size with sparkling crystal accents.",
                Price = 28m,
                Category = "womens-jewellery",
                ImageUrl = "https://cdn.dummyjson.com/product-images/65/thumbnail.jpg",
                Attributes = "{\"brand\": \"Cuff Butterfly\", \"discountPercentage\": 4.90, \"stockQuantity\": 41, \"rating\": 4.56}"
            },
            new()
            {
                No = "BAG02",
                Name = "LouisWill Crossbody Bag",
                Summary = "Stylish crossbody handbag",
                Description = "LouisWill Women's Luxury Crossbody Bag with Gold Hardware. PU Leather with multiple compartments.",
                Price = 85m,
                Category = "womens-bags",
                ImageUrl = "https://cdn.dummyjson.com/product-images/71/thumbnail.jpg",
                Attributes = "{\"brand\": \"LouisWill\", \"discountPercentage\": 11.50, \"stockQuantity\": 33, \"rating\": 4.45}"
            },
            new()
            {
                No = "SUNGLASS02",
                Name = "Vintage Round Sunglasses",
                Summary = "Retro round frame sunglasses",
                Description = "Vintage Round Frame Sunglasses with UV400 Protection. Classic design suitable for men and women.",
                Price = 45m,
                Category = "sunglasses",
                ImageUrl = "https://cdn.dummyjson.com/product-images/83/thumbnail.jpg",
                Attributes = "{\"brand\": \"Steal Frame\", \"discountPercentage\": 7.30, \"stockQuantity\": 63, \"rating\": 4.35}"
            },

            // ==================== ADDITIONAL AUTOMOTIVE ====================
            new()
            {
                No = "AUTO01",
                Name = "Car Aux Cable Bluetooth",
                Summary = "Bluetooth aux adapter for car",
                Description = "Car Aux Cable Bluetooth Adapter with Hands-Free Calling. Works with all car stereo systems via AUX port.",
                Price = 22m,
                Category = "automotive",
                ImageUrl = "https://cdn.dummyjson.com/product-images/85/thumbnail.jpg",
                Attributes = "{\"brand\": \"Car Aux\", \"discountPercentage\": 5.60, \"stockQuantity\": 90, \"rating\": 4.15}"
            },
            new()
            {
                No = "AUTO02",
                Name = "Shock Absorber Spring Set",
                Summary = "Heavy duty shock absorbers",
                Description = "Heavy Duty Shock Absorber Spring Set for Off-Road Vehicles. Improved ride comfort and handling.",
                Price = 180m,
                Category = "automotive",
                ImageUrl = "https://cdn.dummyjson.com/product-images/86/thumbnail.jpg",
                Attributes = "{\"brand\": \"Shock Absorber\", \"discountPercentage\": 3.20, \"stockQuantity\": 25, \"rating\": 4.58}"
            },

            // ==================== MOTORCYCLE ====================
            new()
            {
                No = "MOTO01",
                Name = "METRO 70cc Motorcycle",
                Summary = "METRO 70cc basic motorcycle",
                Description = "METRO 70cc Motorcycle - MR70. Economical fuel consumption, reliable 4-stroke engine, perfect for daily commute.",
                Price = 750m,
                Category = "motorcycle",
                ImageUrl = "https://cdn.dummyjson.com/product-images/91/thumbnail.jpg",
                Attributes = "{\"brand\": \"METRO\", \"discountPercentage\": 2.50, \"stockQuantity\": 12, \"rating\": 4.30}"
            },
            new()
            {
                No = "MOTO02",
                Name = "BRAVE BULL Sport Bike",
                Summary = "Sport motorcycle 150cc",
                Description = "BRAVE BULL 150cc Sport Bike with digital dashboard, disc brakes, and aerodynamic design. Thrilling riding experience.",
                Price = 1850m,
                Category = "motorcycle",
                ImageUrl = "https://cdn.dummyjson.com/product-images/92/thumbnail.jpg",
                Attributes = "{\"brand\": \"BRAVE BULL\", \"discountPercentage\": 4.80, \"stockQuantity\": 8, \"rating\": 4.42}"
            },

            // ==================== LIGHTING ====================
            new()
            {
                No = "LIGHT01",
                Name = "Smart LED Ceiling Light",
                Summary = "Dimmable smart ceiling light",
                Description = "Smart LED Ceiling Light with Remote Control and App integration. Adjustable color temperature and brightness.",
                Price = 65m,
                Category = "lighting",
                ImageUrl = "https://cdn.dummyjson.com/product-images/93/thumbnail.jpg",
                Attributes = "{\"brand\": \"Xiangle\", \"discountPercentage\": 8.15, \"stockQuantity\": 55, \"rating\": 4.48}"
            },
            new()
            {
                No = "LIGHT02",
                Name = "Neon LED Sign Light",
                Summary = "Decorative neon LED sign",
                Description = "Neon LED Light Sign for Room Decoration. USB powered, energy efficient, and perfect for bedrooms, cafes, or parties.",
                Price = 25m,
                Category = "lighting",
                ImageUrl = "https://cdn.dummyjson.com/product-images/94/thumbnail.jpg",
                Attributes = "{\"brand\": \"Neon LED Light\", \"discountPercentage\": 12.00, \"stockQuantity\": 72, \"rating\": 4.55}"
            },

            // ==================== ADDITIONAL LAPTOPS ====================
            new()
            {
                No = "THINKPAD",
                Name = "Lenovo ThinkPad X1 Carbon",
                Summary = "Lenovo business ultrabook",
                Description = "Lenovo ThinkPad X1 Carbon Gen 10 with Intel 12th Gen, 14\" 2.8K OLED display, 16GB RAM, 512GB SSD. Ultimate business laptop.",
                Price = 1899m,
                Category = "laptops",
                ImageUrl = "https://cdn.dummyjson.com/product-images/8/thumbnail.jpg",
                Attributes = "{\"brand\": \"Lenovo\", \"discountPercentage\": 6.50, \"stockQuantity\": 40, \"rating\": 4.62}"
            },
            new()
            {
                No = "DELLXPS",
                Name = "Dell XPS 15",
                Summary = "Dell premium 15-inch laptop",
                Description = "Dell XPS 15 with Intel Core i7, 15.6\" 3.5K OLED, 32GB RAM, 1TB SSD, NVIDIA GeForce RTX 3050 Ti. Creation powerhouse.",
                Price = 2199m,
                Category = "laptops",
                ImageUrl = "https://cdn.dummyjson.com/product-images/9/thumbnail.jpg",
                Attributes = "{\"brand\": \"Dell\", \"discountPercentage\": 5.25, \"stockQuantity\": 28, \"rating\": 4.55}"
            },

            // ==================== KITCHEN & HOME ====================
            new()
            {
                No = "SHELF01",
                Name = "Kitchen Storage Shelf",
                Summary = "Multi-tier kitchen organizer",
                Description = "Kitchen Shelf Multi Purpose Rack with 3 tiers. Stainless steel construction, perfect for organizing spices, utensils, and cookware.",
                Price = 45m,
                Category = "furniture",
                ImageUrl = "https://cdn.dummyjson.com/product-images/27/thumbnail.jpg",
                Attributes = "{\"brand\": \"Kitchen Shelf\", \"discountPercentage\": 5.80, \"stockQuantity\": 48, \"rating\": 4.32}"
            }
        };
    }
}
