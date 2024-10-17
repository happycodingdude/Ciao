namespace Domain.Features;

public class MessageEntityConfiguration : IEntityTypeConfiguration<Message>
{
    public void Configure(EntityTypeBuilder<Message> builder)
    {
        builder.ToTable("Message");
        builder.HasKey(q => q.Id);
        builder.Property(q => q.CreatedTime).ValueGeneratedOnAdd().HasDefaultValueSql("CURRENT_TIMESTAMP(6)");
        builder.Property(q => q.Type).IsRequired().HasMaxLength(20);
        builder.Property(q => q.Status).HasMaxLength(20);
        builder.Property(q => q.IsPinned).IsRequired();
        builder.Property(q => q.IsLike).IsRequired();
        builder.Property(q => q.LikeCount).IsRequired();
        // builder.HasOne(q => q.Contact).WithMany(q => q.Messages).HasForeignKey(q => q.ContactId).IsRequired().OnDelete(DeleteBehavior.Cascade);
        // builder.HasOne(q => q.Conversation).WithMany(q => q.Messages).HasForeignKey(q => q.ConversationId).IsRequired().OnDelete(DeleteBehavior.Cascade);
    }
}