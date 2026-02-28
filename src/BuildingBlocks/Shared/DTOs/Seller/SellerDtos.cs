namespace Shared.DTOs.Seller
{
    public class SellerProductDto
    {
        public long Id { get; set; }
        public string SellerUserName { get; set; } = default!;
        public string No { get; set; } = default!;
        public string Name { get; set; } = default!;
        public string? Summary { get; set; }
        public string? Description { get; set; }
        public decimal Price { get; set; }
        public string? Category { get; set; }
        public string? ImageUrl { get; set; }
        public string? Attributes { get; set; }
        public string? SeoTitle { get; set; }
        public string? SeoDescription { get; set; }
        public string? SeoKeywords { get; set; }
        public string? Highlights { get; set; }
        public int StockQuantity { get; set; }
        public string Status { get; set; } = default!;
        public double AverageRating { get; set; }
        public int ReviewCount { get; set; }
        public DateTimeOffset CreatedDate { get; set; }
    }

    public class CreateSellerProductDto
    {
        public string No { get; set; } = default!;
        public string Name { get; set; } = default!;
        public string? Summary { get; set; }
        public string? BasicDescription { get; set; }
        public decimal Price { get; set; }
        public string? Category { get; set; }
        public string? ImageUrl { get; set; }
        public int StockQuantity { get; set; }
        public bool UseAI { get; set; } = true;
    }

    public class UpdateSellerProductDto
    {
        public string Name { get; set; } = default!;
        public string? Summary { get; set; }
        public string? Description { get; set; }
        public decimal Price { get; set; }
        public string? Category { get; set; }
        public string? ImageUrl { get; set; }
        public string? SeoTitle { get; set; }
        public string? SeoDescription { get; set; }
        public string? SeoKeywords { get; set; }
        public string? Highlights { get; set; }
        public int StockQuantity { get; set; }
    }

    public class AIContentRequestDto
    {
        public string ProductName { get; set; } = default!;
        public string? Category { get; set; }
        public string? BasicDescription { get; set; }
        public decimal Price { get; set; }
    }

    public class AIContentResponseDto
    {
        public string Description { get; set; } = default!;
        public string SeoTitle { get; set; } = default!;
        public string SeoDescription { get; set; } = default!;
        public string SeoKeywords { get; set; } = default!;
        public string Highlights { get; set; } = default!;
    }

    public class ProductReviewDto
    {
        public long Id { get; set; }
        public long ProductId { get; set; }
        public string UserName { get; set; } = default!;
        public string DisplayName { get; set; } = default!;
        public long? OrderId { get; set; }
        public int Rating { get; set; }
        public string? Comment { get; set; }
        public string? SellerReply { get; set; }
        public DateTimeOffset? SellerReplyDate { get; set; }
        public bool IsVerifiedPurchase { get; set; }
        public DateTimeOffset CreatedDate { get; set; }
    }

    public class CreateReviewDto
    {
        public long ProductId { get; set; }
        public long? OrderId { get; set; }
        public int Rating { get; set; }
        public string? Comment { get; set; }
    }

    public class SellerReplyDto
    {
        public string Reply { get; set; } = default!;
    }

    public class ReviewSummaryDto
    {
        public long ProductId { get; set; }
        public double AverageRating { get; set; }
        public int TotalReviews { get; set; }
        public Dictionary<int, int> RatingDistribution { get; set; } = new();
    }

    public class SellerDashboardDto
    {
        public int TotalProducts { get; set; }
        public int ActiveProducts { get; set; }
        public int TotalReviews { get; set; }
        public double AverageRating { get; set; }
        public decimal TotalRevenue { get; set; }
        public int PendingProducts { get; set; }
        public List<SellerProductDto> RecentProducts { get; set; } = new();
        public List<ProductReviewDto> RecentReviews { get; set; } = new();
    }
}
