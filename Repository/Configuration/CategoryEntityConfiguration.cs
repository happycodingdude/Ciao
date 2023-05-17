using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MyDockerWebAPI.Model;

namespace MyDockerWebAPI.Repository
{
    public class CategoryEntityConfiguration : IEntityTypeConfiguration<Category>
    {
        public void Configure(EntityTypeBuilder<Category> builder)
        {
            builder.ToTable("Category");
            builder.HasKey(q => q.Id);
            builder.Property(q => q.CreateTime).ValueGeneratedOnAdd().HasDefaultValueSql("CURRENT_TIMESTAMP(6)");
        }
    }
}