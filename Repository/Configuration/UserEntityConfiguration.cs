using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MyDockerWebAPI.Model;

namespace MyDockerWebAPI.Repository
{
    public class UserEntityConfiguration : IEntityTypeConfiguration<User>
    {
        public void Configure(EntityTypeBuilder<User> builder)
        {
            builder.ToTable("User");
            builder.HasKey(q => q.Id);
            builder.Property(q => q.CreateTime).ValueGeneratedOnAdd().HasDefaultValueSql("CURRENT_TIMESTAMP(6)");
        }
    }
}