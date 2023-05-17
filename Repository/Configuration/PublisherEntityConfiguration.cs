using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MyDockerWebAPI.Model;

namespace MyDockerWebAPI.Repository
{
    public class PublisherEntityConfiguration : IEntityTypeConfiguration<Publisher>
    {
        public void Configure(EntityTypeBuilder<Publisher> builder)
        {
            builder.ToTable("Publisher");
            builder.HasKey(q => q.Id);
            builder.Property(q => q.CreateTime).ValueGeneratedOnAdd().HasDefaultValueSql("CURRENT_TIMESTAMP(6)");
        }
    }
}