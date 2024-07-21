namespace Infrastructure.Databases;

public class AuthenticationUser : IdentityUser { }

public class AuthenticationDbContext : IdentityDbContext<AuthenticationUser>
{
    public AuthenticationDbContext(DbContextOptions options) : base(options) { }
}