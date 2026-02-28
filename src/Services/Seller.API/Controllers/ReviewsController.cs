using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Seller.API.Entities;
using Seller.API.Repositories.Interfaces;
using Shared.DTOs.Seller;

namespace Seller.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReviewsController : ControllerBase
    {
        private readonly IProductReviewRepository _reviewRepository;
        private readonly ISellerProductRepository _productRepository;
        private readonly IMapper _mapper;

        public ReviewsController(
            IProductReviewRepository reviewRepository,
            ISellerProductRepository productRepository,
            IMapper mapper)
        {
            _reviewRepository = reviewRepository;
            _productRepository = productRepository;
            _mapper = mapper;
        }

        /// <summary>
        /// Get all reviews for a product
        /// </summary>
        [HttpGet("product/{productId:long}")]
        public async Task<IActionResult> GetReviewsByProduct(long productId)
        {
            var reviews = await _reviewRepository.GetReviewsByProduct(productId);
            var result = _mapper.Map<IEnumerable<ProductReviewDto>>(reviews);
            return Ok(result);
        }

        /// <summary>
        /// Get review summary (average rating + distribution)
        /// </summary>
        [HttpGet("product/{productId:long}/summary")]
        public async Task<IActionResult> GetReviewSummary(long productId)
        {
            var reviews = (await _reviewRepository.GetReviewsByProduct(productId)).ToList();

            var summary = new ReviewSummaryDto
            {
                ProductId = productId,
                AverageRating = reviews.Any() ? reviews.Average(r => r.Rating) : 0,
                TotalReviews = reviews.Count,
                RatingDistribution = Enumerable.Range(1, 5)
                    .ToDictionary(r => r, r => reviews.Count(rev => rev.Rating == r))
            };

            return Ok(summary);
        }

        /// <summary>
        /// Get reviews by user
        /// </summary>
        [HttpGet("user/{userName}")]
        public async Task<IActionResult> GetReviewsByUser(string userName)
        {
            var reviews = await _reviewRepository.GetReviewsByUser(userName);
            var result = _mapper.Map<IEnumerable<ProductReviewDto>>(reviews);
            return Ok(result);
        }

        /// <summary>
        /// Create a new review
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> CreateReview([FromBody] CreateReviewDto dto, [FromHeader(Name = "X-User-Name")] string userName, [FromHeader(Name = "X-Display-Name")] string? displayName)
        {
            if (string.IsNullOrEmpty(userName))
                return BadRequest("UserName is required");

            if (dto.Rating < 1 || dto.Rating > 5)
                return BadRequest("Rating must be between 1 and 5");

            // Check product exists
            var product = await _productRepository.GetProduct(dto.ProductId);
            if (product == null)
                return NotFound($"Product with ID {dto.ProductId} not found");

            // Check duplicate review
            var existing = await _reviewRepository.GetUserReviewForProduct(dto.ProductId, userName, dto.OrderId);
            if (existing != null)
                return Conflict("You have already reviewed this product for this order");

            var review = new ProductReview
            {
                ProductId = dto.ProductId,
                UserName = userName,
                DisplayName = displayName ?? userName,
                OrderId = dto.OrderId,
                Rating = dto.Rating,
                Comment = dto.Comment,
                IsVerifiedPurchase = dto.OrderId.HasValue
            };

            await _reviewRepository.CreateReview(review);
            await _reviewRepository.SaveChangesAsync();

            var result = _mapper.Map<ProductReviewDto>(review);
            return CreatedAtAction(nameof(GetReviewsByProduct), new { productId = dto.ProductId }, result);
        }

        /// <summary>
        /// Seller replies to a review
        /// </summary>
        [HttpPost("{reviewId:long}/reply")]
        public async Task<IActionResult> ReplyToReview(long reviewId, [FromBody] SellerReplyDto dto)
        {
            var review = await _reviewRepository.GetByIdAsync(reviewId);
            if (review == null) return NotFound();

            review.SellerReply = dto.Reply;
            review.SellerReplyDate = DateTimeOffset.UtcNow;

            await _reviewRepository.SaveChangesAsync();

            var result = _mapper.Map<ProductReviewDto>(review);
            return Ok(result);
        }
    }
}
