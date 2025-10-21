namespace Basket.API.Entities
{
    public class Cart
    {
        public string Username { get; set; }
        public readonly List<CartItem> Items = new();
        public Cart()
        {
            
        }
        public Cart(string username)
        {
            Username = username;
        }
        public decimal TotalPrice
        {
            get
            {
                return Items.Sum(i => i.ProductPrice * i.Quantity);
            }
        }
    }
}
