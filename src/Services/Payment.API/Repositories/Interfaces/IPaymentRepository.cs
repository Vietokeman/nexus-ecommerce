using Payment.API.Entities;

namespace Payment.API.Repositories.Interfaces;

public interface IPaymentRepository
{
    Task<PaymentTransaction> CreateAsync(PaymentTransaction transaction);
    Task<PaymentTransaction?> GetByIdAsync(Guid id);
    Task<PaymentTransaction?> GetByOrderNoAsync(string orderNo);
    Task<PaymentTransaction?> GetByOrderCodeAsync(long orderCode);
    Task<List<PaymentTransaction>> GetByUserIdAsync(string userId);
    Task UpdateAsync(PaymentTransaction transaction);
}
