using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MyConnect.Model;

namespace MyConnect.Repository
{
    public class FriendEntityConfiguration : IEntityTypeConfiguration<Friend>
    {
        public void Configure(EntityTypeBuilder<Friend> builder)
        {
            builder.ToTable("Friend");
            builder.HasKey(q => q.Id);
            builder.Property(q => q.CreatedTime).ValueGeneratedOnAdd().HasDefaultValueSql("CURRENT_TIMESTAMP(6)");
            builder.Property(q => q.Status).HasMaxLength(10);
            builder.HasOne(q => q.Contact1).WithMany().HasForeignKey(q => q.ContactId1).IsRequired().OnDelete(DeleteBehavior.Cascade);
            builder.HasOne(q => q.Contact2).WithMany().HasForeignKey(q => q.ContactId2).IsRequired().OnDelete(DeleteBehavior.Cascade);
        }
    }
}