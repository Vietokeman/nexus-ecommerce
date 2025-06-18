using Contracts.Common.Interfaces;
using Product.API.Entities;
using Product.API.Persistence;

namespace Product.API.Repositories.Interfaces
{
    public interface IProducRepository : IRepositoryBaseAsync<CatalogProduct, long, ProductContext>
    {
        Task<CatalogProduct> GetProduct(long id);
        Task<IEnumerable<CatalogProduct>> GetProducts();
        Task<IEnumerable<CatalogProduct>> GetProducByNo(string productNo);

        Task CreateProduct(CatalogProduct product);
        Task UpdateProduct(CatalogProduct product);
        Task DeleteProduct(long id);
    }
}
