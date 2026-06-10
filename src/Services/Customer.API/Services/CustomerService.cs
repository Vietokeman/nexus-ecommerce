using Customer.API.Repositories.Interfaces;
using Customer.API.Services.Interfaces;
using Shared.SeedWork;

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

        public async Task<IResult> GetPagedCustomersAsync(PagingRequestParameters requestParameters)
        {
            var pagedCustomers = await _repository.GetPagedCustomersAsync(requestParameters);
            return Results.Ok(new ApiSuccessResult<PagedList<Entities.Customer>>(pagedCustomers));
        }

        public async Task<IResult> GetByUserNameAsync(string userName) => Results.Ok(await _repository.GetByUserNameAsync(userName));
    }
}
