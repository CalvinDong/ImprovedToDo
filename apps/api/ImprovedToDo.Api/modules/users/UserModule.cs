
public class UserModule : IModule {

  public IServiceCollection RegisterModule(IServiceCollection services)
  {
    services.AddScoped<IDummy, Dummy>();
    return services;
  }
  
  public IEndpointRouteBuilder MapEndpoints(IEndpointRouteBuilder endpoints)
  {
    throw new NotImplementedException();
  }

  
}