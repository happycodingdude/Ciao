namespace Domain.Features;

public class FriendEntityConfiguration : IEntityTypeConfiguration<Friend>
{
    public void Configure(EntityTypeBuilder<Friend> builder)
    {
        builder.ToTable("Friend");
        builder.HasKey(q => q.Id);
        builder.Property(q => q.CreatedTime).ValueGeneratedOnAdd().HasDefaultValueSql("CURRENT_TIMESTAMP(6)");
        builder.HasOne(q => q.FromContact).WithMany().HasForeignKey(q => q.FromContactId).IsRequired().OnDelete(DeleteBehavior.Cascade);
        builder.HasOne(q => q.ToContact).WithMany().HasForeignKey(q => q.ToContactId).IsRequired().OnDelete(DeleteBehavior.Cascade);
    }
}