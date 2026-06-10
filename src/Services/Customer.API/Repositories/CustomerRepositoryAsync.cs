using Contracts.Common.Interfaces;
using Customer.API.Persistence;
using Customer.API.Repositories.Interfaces;
using Infrastructure.Common;
using Microsoft.EntityFrameworkCore;
using Shared.SeedWork;

namespace Customer.API.Repositories
{
    public class CustomerRepositoryAsync : RepositoryBaseAsync<Entities.Customer, int, Persistence.CustomerContext>, ICustomerRepository
    {
        public CustomerRepositoryAsync(CustomerContext context, IUnitOfWork<CustomerContext> unitOfWork) : base(context, unitOfWork)
        {

        }

        public async Task<IEnumerable<Entities.Customer>> GetAllCustomersAsync() => await FindAll().ToListAsync();

        public async Task<PagedList<Entities.Customer>> GetPagedCustomersAsync(PagingRequestParameters requestParameters)
        {
            var query = FindAll(); // Uses AsNoTracking() automatically from Base
            if (!string.IsNullOrWhiteSpace(requestParameters.SearchTerm))
            {
                var search = requestParameters.SearchTerm.Trim().ToLower();
                query = query.Where(c => c.UserName.ToLower().Contains(search) || c.EmailAddress.ToLower().Contains(search) || c.FirstName.ToLower().Contains(search) || c.LastName.ToLower().Contains(search));
            }

            var totalCount = await query.CountAsync();
            var items = await query
                .Skip((requestParameters.PageNumber - 1) * requestParameters.PageSize)
                .Take(requestParameters.PageSize)
                .ToListAsync();

            return new PagedList<Entities.Customer>(items, totalCount, requestParameters.PageNumber, requestParameters.PageSize);
        }

        public async Task<Entities.Customer?> GetByUserNameAsync(string userName) => await FindByCondition(c => c.UserName == userName).FirstOrDefaultAsync();

    }
}
