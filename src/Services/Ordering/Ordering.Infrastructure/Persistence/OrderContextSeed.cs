using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Ordering.Domain.Entities;
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
                if (_context.Database.IsSqlServer())
                {
                    await _context.Database.MigrateAsync();
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
                new Order{
                UserName = "customer1",
                FirstName = "customer1",
                LastName = "customer1",
                EmailAdress = "customer1@local.com",
                ShipppingAdress = "123 Main St",
                InvoiceAdress = "Vietnam",
                TotalPrice = 350}
            };
        }
    }
}
