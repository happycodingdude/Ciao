namespace Domain.Features;

public class NotificationEntityConfiguration : IEntityTypeConfiguration<Notification>
{
    public void Configure(EntityTypeBuilder<Notification> builder)
    {
        builder.ToTable("Notification");
        builder.HasKey(q => q.Id);
        builder.Property(q => q.CreatedTime).ValueGeneratedOnAdd().HasDefaultValueSql("CURRENT_TIMESTAMP(6)");
        builder.Property(q => q.SourceId).IsRequired();
        builder.Property(q => q.SourceType).IsRequired().HasMaxLength(20);
        builder.Property(q => q.Content).IsRequired();
        builder.Property(q => q.Read).IsRequired();
        builder.HasOne(q => q.Contact).WithMany().HasForeignKey(q => q.ContactId).IsRequired().OnDelete(DeleteBehavior.Cascade);
    }
}