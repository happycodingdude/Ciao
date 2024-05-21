namespace Chat.API.Repository;

public class AttachmentEntityConfiguration : IEntityTypeConfiguration<Attachment>
{
    public void Configure(EntityTypeBuilder<Attachment> builder)
    {
        builder.ToTable("Attachment");
        builder.HasKey(q => q.Id);
        builder.Property(q => q.CreatedTime).ValueGeneratedOnAdd().HasDefaultValueSql("CURRENT_TIMESTAMP(6)");
        builder.Property(q => q.MediaUrl).IsRequired().HasMaxLength(500);
        builder.Property(q => q.MediaName).HasMaxLength(100);
        builder.Property(q => q.Type).HasMaxLength(20);
        builder.HasOne(q => q.Message).WithMany(q => q.Attachments).HasForeignKey(q => q.MessageId).IsRequired().OnDelete(DeleteBehavior.Cascade);
    }
}