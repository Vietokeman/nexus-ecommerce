using Customer.API.Repositories.Interfaces;
using Customer.API.Services.Interfaces;

namespace Customer.API.Controllers
{
    public static class CustomerController
    {
        public static void MapCustomerEndpoints(this WebApplication app)
        {

            app.MapGet("/", () => "Welcome to Customer Api");
            app.MapGet("/api/customers", async (ICustomerService customerService) => await customerService.GetAllCustomerAsync()).WithTags("Customers")
            .WithName("GetAllCustomers")
            .Produces(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status404NotFound); ;
            app.MapGet("/api/customer/{username}", async (string username, ICustomerService customerService) =>
            {

                var customer = await customerService.GetByUserNameAsync(username);
                if (customer == null)
                {
                    return Results.NotFound();
                }
                return Results.Ok(customer);
            }).WithTags("Customers")
            .WithName("GetCustomerByUserName")
            .Produces(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status404NotFound); ;

            app.MapPost("/api/customer", async (Customer.API.Entities.Customer customer, ICustomerRepository customerRepository) =>
            {
                await customerRepository.CreateAsync(customer);
                await customerRepository.SaveChangesAsync();
            });

            app.MapDelete("/api/customer", async (int id, ICustomerRepository customerRepository) =>
            {
                var customer = await customerRepository.GetByIdAsync(id);
                if (customer == null)
                {
                    return Results.NotFound();
                }
                await customerRepository.DeleteAsync(customer);
                await customerRepository.SaveChangesAsync();
                return Results.Ok(customer);
            });

        }

    }
}
