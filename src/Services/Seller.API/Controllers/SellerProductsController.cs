using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Seller.API.Entities;
using Seller.API.Repositories.Interfaces;
using Seller.API.Services;
using Shared.DTOs.Seller;

namespace Seller.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SellerProductsController : ControllerBase
    {
        private readonly ISellerProductRepository _repository;
        private readonly IProductReviewRepository _reviewRepository;
        private readonly IAIContentService _aiContentService;
        private readonly IMapper _mapper;

        public SellerProductsController(
            ISellerProductRepository repository,
            IProductReviewRepository reviewRepository,
            IAIContentService aiContentService,
            IMapper mapper)
        {
            _repository = repository;
            _reviewRepository = reviewRepository;
            _aiContentService = aiContentService;
            _mapper = mapper;
        }

        /// <summary>
        /// Get all active seller products (public storefront)
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetProducts()
        {
            var products = await _repository.GetProducts();
            var activeProducts = products.Where(p => p.Status == "Active");
            var result = _mapper.Map<IEnumerable<SellerProductDto>>(activeProducts);

            // Enrich with review data
            foreach (var dto in result)
            {
                dto.AverageRating = await _reviewRepository.GetAverageRating(dto.Id);
                dto.ReviewCount = await _reviewRepository.GetReviewCount(dto.Id);
            }

            return Ok(result);
        }

        /// <summary>
        /// Get single product detail
        /// </summary>
        [HttpGet("{id:long}")]
        public async Task<IActionResult> GetProduct(long id)
        {
            var product = await _repository.GetProduct(id);
            if (product == null) return NotFound();

            var result = _mapper.Map<SellerProductDto>(product);
            result.AverageRating = await _reviewRepository.GetAverageRating(id);
            result.ReviewCount = await _reviewRepository.GetReviewCount(id);

            return Ok(result);
        }

        /// <summary>
        /// Get products by seller username
        /// </summary>
        [HttpGet("by-seller/{sellerUserName}")]
        public async Task<IActionResult> GetProductsBySeller(string sellerUserName)
        {
            var products = await _repository.GetProductsBySeller(sellerUserName);
            var result = _mapper.Map<IEnumerable<SellerProductDto>>(products);
            return Ok(result);
        }

        /// <summary>
        /// Get products by category
        /// </summary>
        [HttpGet("by-category/{category}")]
        public async Task<IActionResult> GetProductsByCategory(string category)
        {
            var products = await _repository.GetProductsByCategory(category);
            var result = _mapper.Map<IEnumerable<SellerProductDto>>(products);
            return Ok(result);
        }

        /// <summary>
        /// Preview AI-generated content before creating product
        /// </summary>
        [HttpPost("preview-ai")]
        public async Task<IActionResult> PreviewAIContent([FromBody] AIContentRequestDto request)
        {
            var content = await _aiContentService.GenerateProductContentAsync(request);
            return Ok(content);
        }

        /// <summary>
        /// Create product with optional AI content generation
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> CreateProduct([FromBody] CreateSellerProductDto dto)
        {
            // Check duplicate No
            var existing = await _repository.GetProductByNo(dto.No);
            if (existing != null)
                return BadRequest($"Product with No '{dto.No}' already exists.");

            var product = _mapper.Map<SellerProduct>(dto);

            // AI content generation
            if (dto.UseAI)
            {
                var aiContent = await _aiContentService.GenerateProductContentAsync(new AIContentRequestDto
                {
                    ProductName = dto.Name,
                    Category = dto.Category,
                    BasicDescription = dto.BasicDescription,
                    Price = dto.Price
                });

                product.Description = aiContent.Description;
                product.SeoTitle = aiContent.SeoTitle;
                product.SeoDescription = aiContent.SeoDescription;
                product.SeoKeywords = aiContent.SeoKeywords;
                product.Highlights = aiContent.Highlights;
            }

            product.Status = "Active";
            await _repository.CreateProduct(product);
            await _repository.SaveChangesAsync();

            var result = _mapper.Map<SellerProductDto>(product);
            return CreatedAtAction(nameof(GetProduct), new { id = result.Id }, result);
        }

        /// <summary>
        /// Update existing product
        /// </summary>
        [HttpPut("{id:long}")]
        public async Task<IActionResult> UpdateProduct(long id, [FromBody] UpdateSellerProductDto dto)
        {
            var product = await _repository.GetProduct(id);
            if (product == null) return NotFound();

            _mapper.Map(dto, product);
            await _repository.UpdateProduct(product);
            await _repository.SaveChangesAsync();

            var result = _mapper.Map<SellerProductDto>(product);
            return Ok(result);
        }

        /// <summary>
        /// Delete product
        /// </summary>
        [HttpDelete("{id:long}")]
        public async Task<IActionResult> DeleteProduct(long id)
        {
            var product = await _repository.GetProduct(id);
            if (product == null) return NotFound();

            await _repository.DeleteProduct(id);
            await _repository.SaveChangesAsync();

            return NoContent();
        }

        /// <summary>
        /// Get seller dashboard data
        /// </summary>
        [HttpGet("dashboard/{sellerUserName}")]
        public async Task<IActionResult> GetDashboard(string sellerUserName)
        {
            var products = (await _repository.GetProductsBySeller(sellerUserName)).ToList();
            var allReviews = new List<ProductReviewDto>();

            foreach (var product in products)
            {
                var reviews = await _reviewRepository.GetReviewsByProduct(product.Id);
                allReviews.AddRange(_mapper.Map<IEnumerable<ProductReviewDto>>(reviews));
            }

            var dashboard = new SellerDashboardDto
            {
                TotalProducts = products.Count,
                ActiveProducts = products.Count(p => p.Status == "Active"),
                PendingProducts = products.Count(p => p.Status == "PendingReview"),
                TotalReviews = allReviews.Count,
                AverageRating = allReviews.Any() ? allReviews.Average(r => r.Rating) : 0,
                TotalRevenue = products.Where(p => p.Status == "Active").Sum(p => p.Price),
                RecentProducts = _mapper.Map<List<SellerProductDto>>(products.Take(5)),
                RecentReviews = allReviews.OrderByDescending(r => r.CreatedDate).Take(10).ToList()
            };

            return Ok(dashboard);
        }
    }
}
