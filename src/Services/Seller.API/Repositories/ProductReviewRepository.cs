using Contracts.Common.Interfaces;
using Infrastructure.Common;
using Microsoft.EntityFrameworkCore;
using Seller.API.Entities;
using Seller.API.Persistence;
using Seller.API.Repositories.Interfaces;

namespace Seller.API.Repositories
{
    public class ProductReviewRepository : RepositoryBaseAsync<ProductReview, long, SellerContext>, IProductReviewRepository
    {
        public ProductReviewRepository(SellerContext dbContext, IUnitOfWork<SellerContext> unitOfWork) : base(dbContext, unitOfWork)
        {
        }

        public async Task<IEnumerable<ProductReview>> GetReviewsByProduct(long productId) =>
            await FindByCondition(x => x.ProductId == productId)
                .OrderByDescending(x => x.CreatedDate)
                .ToListAsync();

        public async Task<IEnumerable<ProductReview>> GetReviewsByUser(string userName) =>
            await FindByCondition(x => x.UserName == userName)
                .OrderByDescending(x => x.CreatedDate)
                .ToListAsync();

        public async Task<ProductReview?> GetUserReviewForProduct(long productId, string userName, long? orderId) =>
            await FindByCondition(x => x.ProductId == productId && x.UserName == userName && x.OrderId == orderId)
                .SingleOrDefaultAsync();

        public async Task<double> GetAverageRating(long productId)
        {
            var reviews = await FindByCondition(x => x.ProductId == productId).ToListAsync();
            return reviews.Any() ? reviews.Average(x => x.Rating) : 0;
        }

        public async Task<int> GetReviewCount(long productId) =>
            await FindByCondition(x => x.ProductId == productId).CountAsync();

        public async Task CreateReview(ProductReview review) =>
            await CreateAsync(review);
    }
}
