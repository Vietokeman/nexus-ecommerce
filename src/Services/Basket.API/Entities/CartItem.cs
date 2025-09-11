namespace Basket.API.Entities
{
    public class CartItem
    {
        public int Quantity { get; set; }
        public decimal ItemPrice { get; set; }
        public string ItemNo { get; set; } = string.Empty;
        public string ItemName { get; set; } = string.Empty;
    }
}
