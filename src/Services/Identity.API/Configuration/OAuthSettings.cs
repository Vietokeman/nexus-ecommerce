namespace Identity.API.Configuration;

public class OAuthSettings
{
    public GoogleSettings Google { get; set; } = new();
    public GitHubSettings GitHub { get; set; } = new();
}

public class GoogleSettings
{
    public string ClientId { get; set; } = string.Empty;
    public string ClientSecret { get; set; } = string.Empty;
}

public class GitHubSettings
{
    public string ClientId { get; set; } = string.Empty;
    public string ClientSecret { get; set; } = string.Empty;
}
