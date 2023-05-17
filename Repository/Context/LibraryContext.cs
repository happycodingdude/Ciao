using Microsoft.EntityFrameworkCore;
using MyDockerWebAPI.Model;

namespace MyDockerWebAPI.Repository
{
    public class LibraryContext : DbContext
    {
        public LibraryContext(DbContextOptions<LibraryContext> option) : base(option)
        {
        }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            Console.WriteLine("LibraryContext OnConfiguring calling");
            base.OnConfiguring(optionsBuilder);
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            Console.WriteLine("LibraryContext OnModelCreating calling");
            base.OnModelCreating(modelBuilder);

            modelBuilder.ApplyConfiguration(new BookEntityConfiguration());
            modelBuilder.ApplyConfiguration(new CategoryEntityConfiguration());
            modelBuilder.ApplyConfiguration(new PublisherEntityConfiguration());
        }

        public DbSet<Book>? Books { get; set; }
        public DbSet<Publisher>? Publishers { get; set; }
        public DbSet<Category>? Categories { get; set; }
    }
}