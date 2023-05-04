using Microsoft.EntityFrameworkCore;
using MySql.EntityFrameworkCore.Extensions;

namespace MyDockerWebAPI.Repository
{
    public class LibraryContext : DbContext
    {
        static readonly string connectionString = "server=localhost;port=3306;database=TestDatabase;user=root;password=123456;";
        public DbSet<Book> Book { get; set; }

        public DbSet<Publisher> Publisher { get; set; }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString));
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Publisher>(entity =>
            {
                entity.HasKey(e => e.ID);
                entity.Property(e => e.Name).IsRequired();
            });

            modelBuilder.Entity<Book>(entity =>
            {
                entity.HasKey(e => e.ISBN);
                entity.Property(e => e.Title).IsRequired();
                entity.HasOne(d => d.Publisher)
                .WithMany(p => p.Books);
            });
        }
    }
}