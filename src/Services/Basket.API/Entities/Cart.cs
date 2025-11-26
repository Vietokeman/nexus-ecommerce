using System.ComponentModel.DataAnnotations;

namespace Basket.API.Entities
{
    public class Cart
    {
        [Required(ErrorMessage = "Username is required.")]
        public string? Username { get; set; }
        public List<CartItem> Items { get; set; } = new();
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
                return Items.Sum(i => i.ItemPrice * i.Quantity);
            }
        }
    }
}
