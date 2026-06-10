using Shared.SeedWork;

namespace Customer.API.Services.Interfaces
{
    public interface ICustomerService
    {
        Task<IResult> GetByUserNameAsync(string userName);
        Task<IResult> GetAllCustomerAsync();
        Task<IResult> GetPagedCustomersAsync(PagingRequestParameters requestParameters);
    }
}
