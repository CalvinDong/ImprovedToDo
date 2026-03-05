public interface IRepository<TRegister, TView> where TRegister : class
{
  Task<IEnumerable<TRegister>> GetAllAsync();
  Task<TView?> GetByIdAsync(Guid id);
  Task AddAsync(TRegister entity);
  Task<TRegister?> Update(TRegister entity);
  Task<bool> Delete(Guid id);
  Task SaveAsync();
  void DetachEntity(TRegister entity);
}