using Contracts.Common.Interfaces;
using Seller.API.Entities;
using Seller.API.Persistence;

namespace Seller.API.Repositories.Interfaces
{
    public interface ISellerProductRepository : IRepositoryBaseAsync<SellerProduct, long, SellerContext>
    {
        Task<SellerProduct?> GetProduct(long id);
        Task<IEnumerable<SellerProduct>> GetProducts();
        Task<IEnumerable<SellerProduct>> GetProductsBySeller(string sellerUserName);
        Task<IEnumerable<SellerProduct>> GetProductsByCategory(string category);
        Task<SellerProduct?> GetProductByNo(string productNo);
        Task CreateProduct(SellerProduct product);
        Task UpdateProduct(SellerProduct product);
        Task DeleteProduct(long id);
    }
}
