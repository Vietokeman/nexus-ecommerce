using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Ordering.Domain.Entities;
using Ordering.Domain.Enums;
using Serilog;

namespace Ordering.Infrastructure.Persistence
{
    public class OrderContextSeed
    {
        private readonly ILogger _logger;
        private readonly OrderContext _context;
        public OrderContextSeed(ILogger logger, OrderContext context)
        {
            _logger = logger;
            _context = context;
        }
        public async Task InitialiseAsync()
        {
            try
            {
                if (_context.Database.IsNpgsql())
                {
                    // Use EnsureCreatedAsync since no EF migrations exist yet
                await _context.Database.EnsureCreatedAsync();
                }
            }
            catch (Exception ex)
            {
                _logger.Error(ex, "An error occurred while initialising the database");
                throw;
            }
        }
        public async Task SeedAsync()
        {
            try
            {
                if (!_context.Orders.Any())
                {
                    _logger.Information("Seeding default orders");
                     _context.Orders.AddRange(GetPreconfiguredOrders());
                    await _context.SaveChangesAsync();
                }
                else
                {
                    _logger.Information("Orders already exist in the database");
                }
            }
            catch (Exception ex)
            {
                _logger.Error(ex, "An error occurred while seeding the database with orders");
            }
        }

        public IEnumerable<Order> GetPreconfiguredOrders()
        {
            return new List<Order>()
            {
                new Order
                {
                    UserName = "customer1",
                    FirstName = "customer1",
                    LastName = "customer1",
                    EmailAdress = "customer1@local.com",
                    ShipppingAdress = "123 Main St, Ho Chi Minh City",
                    InvoiceAdress = "123 Main St, Ho Chi Minh City, Vietnam",
                    TotalPrice = 350,
                    Status = EOrderStatus.New
                },
                new Order
                {
                    UserName = "customer2",
                    FirstName = "customer2",
                    LastName = "customer2",
                    EmailAdress = "customer2@local.com",
                    ShipppingAdress = "456 Oak Ave, Hanoi",
                    InvoiceAdress = "456 Oak Ave, Hanoi, Vietnam",
                    TotalPrice = 450,
                    Status = EOrderStatus.Pending
                },
                new Order
                {
                    UserName = "demo",
                    FirstName = "Demo",
                    LastName = "User",
                    EmailAdress = "demo@gmail.com",
                    ShipppingAdress = "789 Elm St, Da Nang",
                    InvoiceAdress = "789 Elm St, Da Nang, Vietnam",
                    TotalPrice = 1249,
                    Status = EOrderStatus.Shipping
                },
                new Order
                {
                    UserName = "demo",
                    FirstName = "Demo",
                    LastName = "User",
                    EmailAdress = "demo@gmail.com",
                    ShipppingAdress = "789 Elm St, Da Nang",
                    InvoiceAdress = "789 Elm St, Da Nang, Vietnam",
                    TotalPrice = 549,
                    Status = EOrderStatus.Paid
                },
                new Order
                {
                    UserName = "rishibakshi",
                    FirstName = "Rishi",
                    LastName = "Bakshi",
                    EmailAdress = "demo2@gmail.com",
                    ShipppingAdress = "101 Pine Rd, Can Tho",
                    InvoiceAdress = "101 Pine Rd, Can Tho, Vietnam",
                    TotalPrice = 280,
                    Status = EOrderStatus.New
                },
                new Order
                {
                    UserName = "johndoe",
                    FirstName = "John",
                    LastName = "Doe",
                    EmailAdress = "john.doe@example.com",
                    ShipppingAdress = "555 Nguyen Hue, Ho Chi Minh City",
                    InvoiceAdress = "555 Nguyen Hue, District 1, Ho Chi Minh City, Vietnam",
                    TotalPrice = 1749,
                    Status = EOrderStatus.Paid
                },
                new Order
                {
                    UserName = "janesmith",
                    FirstName = "Jane",
                    LastName = "Smith",
                    EmailAdress = "jane.smith@example.com",
                    ShipppingAdress = "88 Le Loi, Ho Chi Minh City",
                    InvoiceAdress = "88 Le Loi, District 1, Ho Chi Minh City, Vietnam",
                    TotalPrice = 2598,
                    Status = EOrderStatus.Shipping
                },
                new Order
                {
                    UserName = "nguyenviet",
                    FirstName = "Nguyen",
                    LastName = "Viet",
                    EmailAdress = "vietbmt19@gmail.com",
                    ShipppingAdress = "12 Tran Phu, Da Nang",
                    InvoiceAdress = "12 Tran Phu, Hai Chau, Da Nang, Vietnam",
                    TotalPrice = 3499,
                    Status = EOrderStatus.Paid
                },
                new Order
                {
                    UserName = "alice_w",
                    FirstName = "Alice",
                    LastName = "Williams",
                    EmailAdress = "alice.w@example.com",
                    ShipppingAdress = "77 Hai Ba Trung, Hanoi",
                    InvoiceAdress = "77 Hai Ba Trung, Hoan Kiem, Hanoi, Vietnam",
                    TotalPrice = 175,
                    Status = EOrderStatus.New
                },
                new Order
                {
                    UserName = "bob_martin",
                    FirstName = "Bob",
                    LastName = "Martin",
                    EmailAdress = "bob.martin@example.com",
                    ShipppingAdress = "33 Pasteur, Ho Chi Minh City",
                    InvoiceAdress = "33 Pasteur, District 3, Ho Chi Minh City, Vietnam",
                    TotalPrice = 899,
                    Status = EOrderStatus.Pending
                }
            };
        }
    }
}
