namespace Infrastructure.Databases;

public class AuthenticationDbContext : IdentityDbContext<AuthenticationUser>
{
    public AuthenticationDbContext(DbContextOptions options) : base(options) { }
}