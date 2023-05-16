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
            base.OnConfiguring(optionsBuilder);
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            Console.WriteLine("OnModelCreating calling");
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Book>(entity =>
            {
                entity.HasOne(q => q.Publisher).WithMany(q => q.Books).HasForeignKey(q => q.PublisherId).OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(q => q.Category).WithMany(q => q.Books).HasForeignKey(q => q.CategoryId).OnDelete(DeleteBehavior.Cascade);
                entity.Property(q => q.create_time).ValueGeneratedOnAdd().HasDefaultValueSql("CURRENT_TIMESTAMP(6)");
                entity.Metadata.AddAnnotation("MySql:CreateTrigger", @"
                        CREATE TRIGGER [dbo].[Book_UPDATE] ON [dbo].[Book]
                        AFTER UPDATE
                        AS
                        BEGIN
                            SET NOCOUNT ON;

                            IF ((SELECT TRIGGER_NESTLEVEL()) > 1) RETURN;

                            DECLARE @Id INT

                            SELECT @Id = INSERTED.Id
                            FROM INSERTED

                            UPDATE dbo.Book
                            SET modify_time = CURRENT_TIMESTAMP()
                            WHERE Id = @Id
                        END"
                );
            });
            modelBuilder.Entity<Category>(entity =>
            {
                entity.Property(q => q.create_time).ValueGeneratedOnAdd().HasDefaultValueSql("CURRENT_TIMESTAMP(6)");
            });
            modelBuilder.Entity<Publisher>(entity =>
            {
                entity.Property(q => q.create_time).ValueGeneratedOnAdd().HasDefaultValueSql("CURRENT_TIMESTAMP(6)");
            });

            if (!DataGenerator.Books.Any())
                DataGenerator.InitBogusData();
            modelBuilder.Entity<Publisher>().HasData(DataGenerator.Publishers);
            modelBuilder.Entity<Category>().HasData(DataGenerator.Categories);
            modelBuilder.Entity<Book>().HasData(DataGenerator.Books);
        }

        public DbSet<Book>? Books { get; set; }
        public DbSet<Publisher>? Publishers { get; set; }
        public DbSet<Category>? Categories { get; set; }
    }
}