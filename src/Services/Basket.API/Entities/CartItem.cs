using System.ComponentModel.DataAnnotations;

namespace Basket.API.Entities
{
    public class CartItem
    {
        [Required]
        [Range(1, int.MaxValue, ErrorMessage = "Quantity must be at least 1.")]
        public int Quantity { get; set; }

        [Required]
        [Range(typeof(decimal), "0.01", "999999999999999999.99", ErrorMessage = "ItemPrice must be greater than 0.")]
        public decimal ItemPrice { get; set; }

        [Required(ErrorMessage = "ItemNo is required.")]
        public string ItemNo { get; set; }

        [Required(ErrorMessage = "ItemName is required.")]
        public string ItemName { get; set; }
    }
}
