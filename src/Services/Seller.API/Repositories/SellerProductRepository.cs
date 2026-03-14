using Contracts.Common.Interfaces;
using Infrastructure.Common;
using Microsoft.EntityFrameworkCore;
using Seller.API.Entities;
using Seller.API.Persistence;
using Seller.API.Repositories.Interfaces;

namespace Seller.API.Repositories
{
    public class SellerProductRepository : RepositoryBaseAsync<SellerProduct, long, SellerContext>, ISellerProductRepository
    {
        public SellerProductRepository(SellerContext dbContext, IUnitOfWork<SellerContext> unitOfWork) : base(dbContext, unitOfWork)
        {
        }

        public async Task<SellerProduct?> GetProduct(long id) =>
            await GetByIdAsync(id);

        public async Task<IEnumerable<SellerProduct>> GetProducts() =>
            await FindAll().ToListAsync();

        public async Task<IEnumerable<SellerProduct>> GetProductsBySeller(string sellerUserName) =>
            await FindByCondition(x => x.SellerUserName == sellerUserName)
                .OrderByDescending(x => x.CreatedDate)
                .ToListAsync();

        public async Task<IEnumerable<SellerProduct>> GetProductsByCategory(string category) =>
            await FindByCondition(x => x.Category == category && x.Status == "Active")
                .OrderByDescending(x => x.CreatedDate)
                .ToListAsync();

        public async Task<SellerProduct?> GetProductByNo(string productNo) =>
            await FindByCondition(x => x.No == productNo)
                .SingleOrDefaultAsync();

        public async Task CreateProduct(SellerProduct product) =>
            await CreateAsync(product);

        public async Task UpdateProduct(SellerProduct product) =>
            await UpdateAsync(product);

        public async Task DeleteProduct(long id)
        {
            var product = await GetByIdAsync(id);
            if (product != null)
                await DeleteAsync(product);
        }
    }
}
