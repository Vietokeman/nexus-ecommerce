namespace Basket.API.Entities
{
    public class CartItem
    {
        public int Quantity { get; set; }
        public decimal ProductPrice { get; set; }
        public string ItemNo { get; set; }
        public string ItemName { get; set; }
    }
}
