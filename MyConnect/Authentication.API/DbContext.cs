namespace Authentication.API;

public class AppUser : IdentityUser { }
public class AppDbContext : IdentityDbContext<AppUser>
{
    public AppDbContext(DbContextOptions options) : base(options) { }
}