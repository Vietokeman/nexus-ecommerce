using System.ComponentModel.DataAnnotations;

namespace Shared.DTOs.Product
{
    public class CreateOrUpdateProductDto
    {
        [Required]
        [MaxLength(250, ErrorMessage = "Max length is 250 character")]
        public string Name { get; set; }
        [MaxLength(255)]
        public string Summary { get; set; }

        public string Description { get; set; }

        public decimal Price { get; set; }
    }
}
