using Contracts.Common.Interfaces;
using Contracts.Domains;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using System.Linq.Expressions;

namespace Infrastructure.Common
{
    public class RepositoryBaseAsync<T, K, TContext> : IRepositoryBaseAsync<T, K, TContext>
         where TContext : DbContext
         where T : EntityBase<K>

    {
        private readonly TContext _context;
        private readonly IUnitOfWork<TContext> _unitOfWork;
        public RepositoryBaseAsync(TContext context, IUnitOfWork<TContext> unitOfWork)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));
        }

        public IQueryable<T> FindAll(bool trackChanges = false)
        {
            IQueryable<T> items = _context.Set<T>().AsNoTracking();
            return items;
        }

        public IQueryable<T> FindAll(bool trackChanges = false, params Expression<Func<T, object>>[] includeProperties)
        {
            var items = includeProperties.Aggregate(_context.Set<T>().AsNoTracking(), (current, includeProperty) => current.Include(includeProperty));
            return items;
        }

        public IQueryable<T> FindByCondition(Expression<Func<T, bool>> expression, bool trackChanges = false)
        {
            IQueryable<T> items = _context.Set<T>().Where(expression).AsNoTracking();
            return items;
        }

        public IQueryable<T> FindByCondition(Expression<Func<T, bool>> expression, bool trackChanges = false, params Expression<Func<T, object>>[] includeProperties)
        {
            var items = includeProperties.Aggregate(_context.Set<T>().Where(expression).AsNoTracking(), (current, includeProperty) => current.Include(includeProperty));
            return items;
        }


        public async Task<T?> GetByIdAsync(K id)
        {
            return await FindByCondition(x => x.Id.Equals(id))?.FirstOrDefaultAsync(); // Task<T?>
        }

        public async Task<T?> GetByIdAsync(K id, params Expression<Func<T, object>>[] includeProperties)
        {
            return await FindByCondition(x => x.Id.Equals(id), trackChanges: false, includeProperties)?.FirstOrDefaultAsync(); // Task<T?>
        }

        public Task<IDbContextTransaction> BeginTransactionAsync() => _context.Database.BeginTransactionAsync();

        public async Task EndTransactionAsync()
        {
            await SaveChangesAsync();
            await _context.Database.CommitTransactionAsync();
        }

        public async Task RollbackTransactionAsync() => await _context.Database.RollbackTransactionAsync();

        public async Task<K> CreateAsync(T entity)
        {
            await _context.Set<T>().AddAsync(entity);
            return entity.Id;
        }

        public async Task<List<K>> CreateListAsync(IEnumerable<T> entities)
        {
            await _context.Set<T>().AddRangeAsync(entities);
            return entities.Select(x => x.Id).ToList();
        }

        public Task UpdateAsync(T entity)
        {
            if (_context.Entry(entity).State == EntityState.Unchanged) return Task.CompletedTask;
            T exist = _context.Set<T>().Find(entity.Id);
            _context.Entry(exist).CurrentValues.SetValues(entity);
            return Task.CompletedTask;
        }

        public Task UpdateListAsync(IEnumerable<T> entities) => _context.Set<T>().AddRangeAsync(entities);

        public Task DeleteAsync(T entity)
        {
            _context.Set<T>().Remove(entity);
            return Task.CompletedTask;
        }

        public Task DeleteListAsync(IEnumerable<T> entities)
        {
            _context.Set<T>().RemoveRange(entities);
            return Task.CompletedTask;
        }

        public Task<int> SaveChangesAsync() => _unitOfWork.CommitAsync();


    }

}
