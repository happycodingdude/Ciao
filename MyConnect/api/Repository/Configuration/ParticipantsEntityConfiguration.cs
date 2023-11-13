using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MyConnect.Model;

namespace MyConnect.Repository
{
    public class ParticipantsEntityConfiguration : IEntityTypeConfiguration<Participants>
    {
        public void Configure(EntityTypeBuilder<Participants> builder)
        {
            builder.ToTable("Participants");
            builder.HasKey(q => q.Id);
            builder.Property(q => q.CreatedTime).ValueGeneratedOnAdd().HasDefaultValueSql("CURRENT_TIMESTAMP(6)");
            builder.HasOne(q => q.Conversation).WithMany(q => q.Participants).HasForeignKey(q => q.ConversationId).IsRequired().OnDelete(DeleteBehavior.Cascade);
            builder.HasOne(q => q.Contact).WithMany(q => q.Participants).HasForeignKey(q => q.ContactId).IsRequired().OnDelete(DeleteBehavior.Cascade);
        }
    }
}