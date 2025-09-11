using Customer.API.Repositories.Interfaces;
using Customer.API.Services.Interfaces;

namespace Customer.API.Services
{
    public class CustomerService : ICustomerService
    {
        private readonly ICustomerRepository _repository;
        public CustomerService(ICustomerRepository repository)
        {
            _repository = repository;
        }

        public async Task<IResult> GetAllCustomerAsync() => Results.Ok(await _repository.GetAllCustomersAsync());

        public async Task<IResult> GetByUserNameAsync(string userName) => Results.Ok(await _repository.GetByUserNameAsync(userName));
    }
}
