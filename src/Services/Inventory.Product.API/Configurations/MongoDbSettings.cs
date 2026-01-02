namespace Inventory.API.Configurations
{
    /// <summary>
    /// MongoDB database settings
    /// </summary>
    public class MongoDbSettings
    {
        public const string SectionName = "MongoDbSettings";
        
        public string ConnectionString { get; set; } = string.Empty;
        public string DatabaseName { get; set; } = string.Empty;
        public string CollectionName { get; set; } = "InventoryEntries";
    }
}
