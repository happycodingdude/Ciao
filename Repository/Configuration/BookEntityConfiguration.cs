using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MyDockerWebAPI.Model;

namespace MyDockerWebAPI.Repository
{
    public class BookEntityConfiguration : IEntityTypeConfiguration<Book>
    {
        public void Configure(EntityTypeBuilder<Book> builder)
        {
            builder.ToTable("Book");
            builder.HasKey(q => q.Id);
            builder.HasOne(q => q.Publisher).WithMany(q => q.Books).HasForeignKey(q => q.PublisherId).OnDelete(DeleteBehavior.Cascade);
            builder.HasOne(q => q.Category).WithMany(q => q.Books).HasForeignKey(q => q.CategoryId).OnDelete(DeleteBehavior.Cascade);
            builder.Property(q => q.CreateTime).ValueGeneratedOnAdd().HasDefaultValueSql("CURRENT_TIMESTAMP(6)");
        }
    }
}