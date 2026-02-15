using Microsoft.EntityFrameworkCore;
using Payment.API.Entities;
using Payment.API.Persistence;
using Payment.API.Repositories.Interfaces;

namespace Payment.API.Repositories;

public class PaymentRepository : IPaymentRepository
{
    private readonly PaymentDbContext _context;

    public PaymentRepository(PaymentDbContext context)
    {
        _context = context;
    }

    public async Task<PaymentTransaction> CreateAsync(PaymentTransaction transaction)
    {
        await _context.PaymentTransactions.AddAsync(transaction);
        await _context.SaveChangesAsync();
        return transaction;
    }

    public async Task<PaymentTransaction?> GetByIdAsync(Guid id)
    {
        return await _context.PaymentTransactions.FindAsync(id);
    }

    public async Task<PaymentTransaction?> GetByOrderNoAsync(string orderNo)
    {
        return await _context.PaymentTransactions
            .FirstOrDefaultAsync(x => x.OrderNo == orderNo);
    }

    public async Task<PaymentTransaction?> GetByOrderCodeAsync(long orderCode)
    {
        return await _context.PaymentTransactions
            .FirstOrDefaultAsync(x => x.OrderCode == orderCode);
    }

    public async Task<List<PaymentTransaction>> GetByUserIdAsync(string userId)
    {
        return await _context.PaymentTransactions
            .Where(x => x.UserId == userId)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync();
    }

    public async Task UpdateAsync(PaymentTransaction transaction)
    {
        _context.PaymentTransactions.Update(transaction);
        await _context.SaveChangesAsync();
    }
}
