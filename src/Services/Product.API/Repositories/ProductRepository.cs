using Contracts.Common.Interfaces;
using Infrastructure.Common;
using Microsoft.EntityFrameworkCore;
using Product.API.Entities;
using Product.API.Persistence;
using Product.API.Repositories.Interfaces;

namespace Product.API.Repositories
{
    public class ProductRepository : RepositoryBaseAsync<CatalogProduct, long, ProductContext>, IProducRepository
    {
        public ProductRepository(ProductContext context, IUnitOfWork<ProductContext> unitOfWork) : base(context, unitOfWork)
        {
        }

        public Task<CatalogProduct> GetProduct(long id) => GetByIdAsync(id);


        public async Task<IEnumerable<CatalogProduct>> GetProducts() => await FindAll().ToListAsync();


        public async Task<IEnumerable<CatalogProduct>> GetProductsByNo(string productNo) => await FindByCondition(x => x.No == productNo).ToListAsync();


        public Task CreateProduct(CatalogProduct product) => CreateAsync(product);


        public Task UpdateProduct(CatalogProduct product) => UpdateAsync(product);


        public async Task DeleteProduct(long id)
        {
            var product = await GetByIdAsync(id);
            if (product == null)
            {
                throw new KeyNotFoundException($"Product with id {id} not found.");
            }
            DeleteAsync(product);

        }

    }
}
