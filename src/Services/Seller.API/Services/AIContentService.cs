using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Shared.DTOs.Seller;

namespace Seller.API.Services
{
    /// <summary>
    /// AI Content Generation Service using OpenAI GPT-4o-mini.
    /// Generates SEO-optimized product descriptions for Nexus marketplace.
    /// </summary>
    public interface IAIContentService
    {
        Task<AIContentResponseDto> GenerateProductContentAsync(AIContentRequestDto request);
    }

    public class AIContentService : IAIContentService
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;
        private readonly ILogger<AIContentService> _logger;

        public AIContentService(
            HttpClient httpClient,
            IConfiguration configuration,
            ILogger<AIContentService> logger)
        {
            _httpClient = httpClient;
            _configuration = configuration;
            _logger = logger;
        }

        public async Task<AIContentResponseDto> GenerateProductContentAsync(AIContentRequestDto request)
        {
            var apiKey = _configuration["OpenAI:ApiKey"];

            // Fallback khi không có API key (dev mode)
            if (string.IsNullOrEmpty(apiKey) || apiKey == "your-api-key-here")
            {
                _logger.LogWarning("OpenAI API key not configured. Using fallback content generation.");
                return GenerateFallbackContent(request);
            }

            try
            {
                _httpClient.DefaultRequestHeaders.Clear();
                _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);

                var prompt = BuildPrompt(request);

                var payload = new
                {
                    model = "gpt-4o-mini",
                    messages = new object[]
                    {
                        new
                        {
                            role = "system",
                            content = @"Bạn là chuyên gia viết mô tả sản phẩm ecommerce và SEO cho sàn Nexus Commerce.
Viết bằng tiếng Việt, phong cách giống Shopee/Lazada.
Output phải là JSON hợp lệ với format:
{
    ""description"": ""Mô tả chi tiết sản phẩm, hấp dẫn, có emoji và bullet points dạng text"",
    ""seoTitle"": ""Tiêu đề SEO tối ưu (50-60 ký tự)"",
    ""seoDescription"": ""Meta description (140-160 ký tự)"",
    ""seoKeywords"": ""keyword1,keyword2,keyword3 (phân cách bằng dấu phẩy)"",
    ""highlights"": ""Điểm nổi bật 1|Điểm nổi bật 2|Điểm nổi bật 3 (phân cách bằng dấu |)""
}
CHỈ trả về JSON, không có text thêm."
                        },
                        new
                        {
                            role = "user",
                            content = prompt
                        }
                    },
                    temperature = 0.7,
                    max_tokens = 1500
                };

                var jsonContent = JsonSerializer.Serialize(payload);
                var httpContent = new StringContent(jsonContent, Encoding.UTF8, "application/json");

                var response = await _httpClient.PostAsync("https://api.openai.com/v1/chat/completions", httpContent);
                response.EnsureSuccessStatusCode();

                var responseBody = await response.Content.ReadAsStringAsync();
                using var doc = JsonDocument.Parse(responseBody);

                var content = doc.RootElement
                    .GetProperty("choices")[0]
                    .GetProperty("message")
                    .GetProperty("content")
                    .GetString();

                if (string.IsNullOrEmpty(content))
                    return GenerateFallbackContent(request);

                // Parse JSON from AI response
                var jsonStart = content.IndexOf('{');
                var jsonEnd = content.LastIndexOf('}') + 1;
                if (jsonStart < 0 || jsonEnd <= jsonStart)
                    return GenerateFallbackContent(request);

                var jsonContent2 = content[jsonStart..jsonEnd];

                var result = JsonSerializer.Deserialize<AIContentResponseDto>(jsonContent2, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                return result ?? GenerateFallbackContent(request);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to generate AI content for product {ProductName}", request.ProductName);
                return GenerateFallbackContent(request);
            }
        }

        private static string BuildPrompt(AIContentRequestDto request)
        {
            return $@"Viết mô tả sản phẩm ecommerce cho:
- Tên sản phẩm: {request.ProductName}
- Danh mục: {request.Category ?? "Chung"}
- Thông tin cơ bản: {request.BasicDescription ?? "không có"}
- Giá: {request.Price:N0} VNĐ

Viết mô tả hấp dẫn, chuẩn SEO, phong cách sàn thương mại điện tử Việt Nam (Shopee/Lazada).";
        }

        private static AIContentResponseDto GenerateFallbackContent(AIContentRequestDto request)
        {
            var name = request.ProductName;
            var category = request.Category ?? "Sản phẩm";
            var price = request.Price;

            return new AIContentResponseDto
            {
                Description = $"🌟 {name} - Sản phẩm chất lượng cao từ Nexus Commerce\n\n" +
                    $"📦 Thông tin sản phẩm:\n" +
                    $"{request.BasicDescription ?? $"Sản phẩm {name} thuộc danh mục {category}, được thiết kế với chất lượng cao và giá cả hợp lý."}\n\n" +
                    $"💰 Giá chỉ: {price:N0}₫\n\n" +
                    $"✅ Cam kết chính hãng 100%\n" +
                    $"🚚 Giao hàng nhanh toàn quốc\n" +
                    $"🔄 Đổi trả miễn phí trong 30 ngày\n" +
                    $"💳 Thanh toán an toàn, bảo mật",
                SeoTitle = name.Length > 60 ? name[..57] + "..." : name,
                SeoDescription = $"Mua {name} giá tốt tại Nexus Commerce. {category}. Cam kết chính hãng, giao hàng nhanh, đổi trả miễn phí.",
                SeoKeywords = $"{name.ToLower()},{category.ToLower()},nexus commerce,mua online",
                Highlights = $"Chất lượng cao cấp|Giá tốt nhất thị trường|Giao hàng nhanh|Đổi trả miễn phí 30 ngày"
            };
        }
    }
}
