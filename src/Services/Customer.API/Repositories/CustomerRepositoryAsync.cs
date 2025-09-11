using Contracts.Common.Interfaces;
using Customer.API.Persistence;
using Customer.API.Repositories.Interfaces;
using Infrastructure.Common;
using Microsoft.EntityFrameworkCore;

namespace Customer.API.Repositories
{
    public class CustomerRepositoryAsync : RepositoryBaseAsync<Entities.Customer, int, Persistence.CustomerContext>, ICustomerRepository
    {
        public CustomerRepositoryAsync(CustomerContext context, IUnitOfWork<CustomerContext> unitOfWork) : base(context, unitOfWork)
        {

        }

        public async Task<IEnumerable<Entities.Customer>> GetAllCustomersAsync() => await FindAll().ToListAsync();

        public async Task<Entities.Customer?> GetByUserNameAsync(string userName) => await FindByCondition(c => c.UserName == userName).FirstOrDefaultAsync();

    }
}
