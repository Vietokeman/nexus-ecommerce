using Microsoft.EntityFrameworkCore;

namespace Customer.API.Persistence
{
    public static class CustomerContextSeed
    {
        public static async Task SeedCustomerData(this IHost host)
        {
            using var scope = host.Services.CreateScope();
            var customerContext = scope.ServiceProvider.GetRequiredService<CustomerContext>();
            // Use EnsureCreatedAsync since no EF migrations exist yet
            await customerContext.Database.EnsureCreatedAsync();

            await CreateCustomer(customerContext, "customer1", "customer1", "customer1", "customer@gmail.com");
            await CreateCustomer(customerContext, "demo", "Demo", "User", "demo@gmail.com");
            await CreateCustomer(customerContext, "rishibakshi", "Rishi", "Bakshi", "demo2@gmail.com");
            await CreateCustomer(customerContext, "admin", "Admin", "User", "admin@ecommerce.com");
            await CreateCustomer(customerContext, "johndoe", "John", "Doe", "john.doe@example.com");
            await CreateCustomer(customerContext, "janesmith", "Jane", "Smith", "jane.smith@example.com");
            await CreateCustomer(customerContext, "nguyenviet", "Nguyen", "Viet", "vietbmt19@gmail.com");
            await CreateCustomer(customerContext, "alice_w", "Alice", "Williams", "alice.w@example.com");
            await CreateCustomer(customerContext, "bob_martin", "Bob", "Martin", "bob.martin@example.com");
            await CreateCustomer(customerContext, "charlie_b", "Charlie", "Brown", "charlie.b@example.com");
            await CreateCustomer(customerContext, "emma_davis", "Emma", "Davis", "emma.davis@example.com");
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