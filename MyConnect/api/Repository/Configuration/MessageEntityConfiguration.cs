using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MyConnect.Model;

namespace MyConnect.Repository
{
    public class MessageEntityConfiguration : IEntityTypeConfiguration<Message>
    {
        public void Configure(EntityTypeBuilder<Message> builder)
        {
            builder.ToTable("Message");
            builder.HasKey(q => q.Id);
            builder.Property(q => q.CreatedTime).ValueGeneratedOnAdd().HasDefaultValueSql("CURRENT_TIMESTAMP(6)");
            builder.Property(q => q.Type).IsRequired().HasMaxLength(50);
            builder.Property(q => q.MediaUrl).HasMaxLength(500);
            builder.Property(q => q.Status).HasMaxLength(50);
            builder.HasOne(q => q.Contact).WithMany(q => q.Messages).HasForeignKey(q => q.ContactId).IsRequired().OnDelete(DeleteBehavior.Cascade);
            builder.HasOne(q => q.Conversation).WithMany(q => q.Messages).HasForeignKey(q => q.ConversationId).IsRequired().OnDelete(DeleteBehavior.Cascade);
        }
    }
}