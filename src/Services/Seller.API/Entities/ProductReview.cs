using Contracts.Domains;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Seller.API.Entities
{
    /// <summary>
    /// Product review/feedback entity.
    /// Users can leave reviews after purchasing a product.
    /// </summary>
    public class ProductReview : EntityAuditBase<long>
    {
        [Required]
        public long ProductId { get; set; }

        [Required]
        [Column(TypeName = "varchar(100)")]
        public string UserName { get; set; } = default!;

        [Required]
        [Column(TypeName = "varchar(100)")]
        public string DisplayName { get; set; } = default!;

        public long? OrderId { get; set; }

        [Required]
        [Range(1, 5)]
        public int Rating { get; set; }

        [Column(TypeName = "text")]
        public string? Comment { get; set; }

        [Column(TypeName = "text")]
        public string? SellerReply { get; set; }

        public DateTimeOffset? SellerReplyDate { get; set; }

        public bool IsVerifiedPurchase { get; set; }
    }
}
