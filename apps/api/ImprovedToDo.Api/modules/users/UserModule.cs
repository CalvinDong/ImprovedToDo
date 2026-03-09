using Microsoft.EntityFrameworkCore;

public class UserModule : IModule {

  public IServiceCollection RegisterModule(IServiceCollection services)
  {
    //services.AddScoped<IDummy, Dummy>();
    return services;
  }
  
  public IEndpointRouteBuilder MapEndpoints(IEndpointRouteBuilder endpoints)
  {
    var group = endpoints.MapGroup("/todos");

        // GET /todos
        group.MapGet("/", async (AppDbContext db) =>
        {
            var todos = await db.Todos.ToListAsync();
            return Results.Ok(todos);
        });

        // GET /todos/{id}
        group.MapGet("/{id:int}", async (int id, AppDbContext db) =>
        {
            var todo = await db.Todos.FindAsync(id);

            if (todo == null)
                return Results.NotFound();

            return Results.Ok(todo);
        });
    
        

    return endpoints;
  }

  
}