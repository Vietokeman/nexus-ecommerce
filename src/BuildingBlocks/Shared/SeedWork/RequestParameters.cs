namespace Shared.SeedWork;

public class RequestParameters
{
    public string? SearchTerm { get; set; }
    public string? OrderBy { get; set; }
    public Dictionary<string, string>? Filters { get; set; }

    public RequestParameters()
    {
        Filters = new Dictionary<string, string>();
    }

    public void AddFilter(string key, string value)
    {
        if (Filters == null)
            Filters = new Dictionary<string, string>();

        Filters[key] = value;
    }

    public string? GetFilter(string key)
    {
        if (Filters == null || !Filters.ContainsKey(key))
            return null;

        return Filters[key];
    }
}
