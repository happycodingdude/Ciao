using Microsoft.EntityFrameworkCore;
using MyDockerWebAPI.Model;

namespace MyDockerWebAPI.Repository
{
    public class MigrationContext : LibraryContext
    {
        public MigrationContext(DbContextOptions<LibraryContext> option) : base(option)
        {
        }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            Console.WriteLine("MigrationContext OnConfiguring calling");
            base.OnConfiguring(optionsBuilder);
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            Console.WriteLine("MigrationContext OnModelCreating calling");
            base.OnModelCreating(modelBuilder);

            Seed(modelBuilder);
        }

        private void Seed(ModelBuilder modelBuilder)
        {
            DataGenerator.InitBogusData();
            modelBuilder.Entity<Publisher>().HasData(DataGenerator.Publishers);
            modelBuilder.Entity<Category>().HasData(DataGenerator.Categories);
            modelBuilder.Entity<Book>().HasData(DataGenerator.Books);
            modelBuilder.Entity<User>().HasData(DataGenerator.Users);
        }
    }
}