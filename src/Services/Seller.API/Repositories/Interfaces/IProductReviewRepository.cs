using Contracts.Common.Interfaces;
using Seller.API.Entities;
using Seller.API.Persistence;

namespace Seller.API.Repositories.Interfaces
{
    public interface IProductReviewRepository : IRepositoryBaseAsync<ProductReview, long, SellerContext>
    {
        Task<IEnumerable<ProductReview>> GetReviewsByProduct(long productId);
        Task<IEnumerable<ProductReview>> GetReviewsByUser(string userName);
        Task<ProductReview?> GetUserReviewForProduct(long productId, string userName, long? orderId);
        Task<double> GetAverageRating(long productId);
        Task<int> GetReviewCount(long productId);
        Task CreateReview(ProductReview review);
    }
}
