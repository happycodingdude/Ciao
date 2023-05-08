using Microsoft.EntityFrameworkCore;

namespace MyDockerWebAPI.Repository
{
    public class LibraryContext : DbContext
    {
        public LibraryContext(DbContextOptions<LibraryContext> option) : base(option)
        {
        }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // base.OnModelCreating(modelBuilder);

            // modelBuilder.Entity<Publisher>(entity =>
            // {
            //     entity.HasKey(e => e.Id);
            //     entity.Property(e => e.Name).IsRequired();
            // });

            // modelBuilder.Entity<Book>(entity =>
            // {
            //     entity.HasKey(e => e.Id);
            //     entity.Property(e => e.Title).IsRequired();
            //     entity.HasOne(d => d.Publisher)
            //     .WithMany(p => p.Books);
            // });
        }

        public DbSet<BookMigration>? Books { get; set; }

        public DbSet<PublisherMigration>? Publishers { get; set; }
    }
}