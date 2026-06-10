using Contracts.Common.Interfaces;
using Customer.API.Persistence;
using Shared.SeedWork;

namespace Customer.API.Repositories.Interfaces
{
    public interface ICustomerRepository : IRepositoryBaseAsync<Entities.Customer, int, CustomerContext>
    {
        Task<Entities.Customer?> GetByUserNameAsync(string userName);
        Task<IEnumerable<Entities.Customer>> GetAllCustomersAsync();
        Task<PagedList<Entities.Customer>> GetPagedCustomersAsync(PagingRequestParameters requestParameters);
    }
}
