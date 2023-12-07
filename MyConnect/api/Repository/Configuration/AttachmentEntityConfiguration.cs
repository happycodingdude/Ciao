using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MyConnect.Model;

namespace MyConnect.Repository
{
    public class AttachmentEntityConfiguration : IEntityTypeConfiguration<Attachment>
    {
        public void Configure(EntityTypeBuilder<Attachment> builder)
        {
            builder.ToTable("Attachment");
            builder.HasKey(q => q.Id);
            builder.Property(q => q.CreatedTime).ValueGeneratedOnAdd().HasDefaultValueSql("CURRENT_TIMESTAMP(6)");
            builder.Property(q => q.MediaUrl).HasMaxLength(500);
            builder.HasOne(q => q.Message).WithMany(q => q.Attachments).HasForeignKey(q => q.MessageId).IsRequired().OnDelete(DeleteBehavior.Cascade);
        }
    }
}