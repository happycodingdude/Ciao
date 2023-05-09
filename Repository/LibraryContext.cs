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
            Console.WriteLine("OnConfiguring calling");
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            Console.WriteLine("OnModelCreating calling");

            //modelBuilder.Entity<Publisher>().HasKey(q => q.Id);
            //modelBuilder.Entity<Category>().HasKey(q => q.Id);
            modelBuilder.Entity<Book>(entity =>
            {
                //entity.HasKey(q => q.Id);
                entity.HasOne(q => q.Publisher).WithMany(q => q.Books).HasForeignKey(q => q.PublisherId).OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(q => q.Category).WithMany(q => q.Books).HasForeignKey(q => q.CategoryId).OnDelete(DeleteBehavior.Cascade);
                //entity.Property(q => q.create_time).HasDefaultValueSql("now()");
            });
            modelBuilder.Entity<Book>().Property(q => q.create_time).HasDefaultValueSql("getdate()");

            if (!DataGenerator.Books.Any())
                DataGenerator.InitBogusData();
            var publishers = DataGenerator.Publishers;
            var categories = DataGenerator.Categories;
            var books = DataGenerator.Books;
            modelBuilder.Entity<Publisher>().HasData(publishers);
            modelBuilder.Entity<Category>().HasData(categories);
            modelBuilder.Entity<Book>().HasData(books);
        }

        public DbSet<Book>? Books { get; set; }
        public DbSet<Publisher>? Publishers { get; set; }
        public DbSet<Category>? Categories { get; set; }
    }
}