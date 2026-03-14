namespace Nexus.AI.Service.Options;

public sealed class AiOptions
{
    public GoogleAiOptions Google { get; set; } = new();

    public ProductCatalogOptions ProductCatalog { get; set; } = new();

    public ChatOptions Chat { get; set; } = new();

    public SecurityOptions Security { get; set; } = new();
}

public sealed class GoogleAiOptions
{
    public string ApiKey { get; set; } = "change-me";

    public string ChatModelId { get; set; } = "gemini-2.0-flash";

    public string EmbeddingModelId { get; set; } = "text-embedding-004";

    public int? EmbeddingDimensions { get; set; } = 768;
}

public sealed class ProductCatalogOptions
{
    public string BaseUrl { get; set; } = "http://localhost:6002";

    public int SyncBatchSize { get; set; } = 50;
}

public sealed class ChatOptions
{
    public int MaxHistoryMessages { get; set; } = 16;

    public int DefaultTopK { get; set; } = 5;

    public int MaxTokens { get; set; } = 1024;

    public double Temperature { get; set; } = 0.2;

    public double TopP { get; set; } = 0.8;

    public string SystemPrompt { get; set; } = "You are Nexus AI, the shopping assistant for the Nexus commerce platform. Answer with grounded, concise guidance. Use the available plugins whenever the user asks about products, recommendations, or order support. Never invent products, prices, order states, or policies that are not supported by available context or tools.";
}

public sealed class SecurityOptions
{
    public string HeaderName { get; set; } = "X-Nexus-AI-Key";

    public string ApiKey { get; set; } = "change-me";

    public string[] ProtectedPrefixes { get; set; } = ["/api/ai/admin"];
}
