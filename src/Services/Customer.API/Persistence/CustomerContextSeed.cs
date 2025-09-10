using Microsoft.EntityFrameworkCore;

namespace Customer.API.Persistence
{
    public static class CustomerContextSeed
    {
        public static async Task SeedCustomerData(this IHost host)
        {
            using var scope = host.Services.CreateScope();
            var customerContext = scope.ServiceProvider.GetRequiredService<CustomerContext>();
            await customerContext.Database.MigrateAsync();

            await CreateCustomer(customerContext, "customer1", "customer1", "customer1", "customer@gmail.com");
        }

        private static async Task CreateCustomer(CustomerContext customerContext, string username, string firstName, string lastName, string email)
        {
            var customer = await customerContext.Customers
                .SingleOrDefaultAsync(x => x.UserName.Equals(username) ||
                                         x.EmailAddress.Equals(email));

            if (customer == null)
            {
                var newCustomer = new Entities.Customer
                {
                    UserName = username,
                    FirstName = firstName,
                    LastName = lastName,
                    EmailAddress = email
                };

                await customerContext.Customers.AddAsync(newCustomer);
                await customerContext.SaveChangesAsync();
            }
        }
    }
}