namespace Domain.Features;

public class ParticipantEntityConfiguration : IEntityTypeConfiguration<Participant>
{
    public void Configure(EntityTypeBuilder<Participant> builder)
    {
        builder.ToTable("Participant");
        builder.HasKey(q => q.Id);
        builder.Property(q => q.CreatedTime).ValueGeneratedOnAdd().HasDefaultValueSql("CURRENT_TIMESTAMP(6)");
        builder.Property(q => q.IsDeleted).IsRequired();
        builder.Property(q => q.IsModerator).IsRequired();
        builder.Property(q => q.IsNotifying).IsRequired();
        builder.HasOne(q => q.Conversation).WithMany(q => q.Participants).HasForeignKey(q => q.ConversationId).IsRequired().OnDelete(DeleteBehavior.Cascade);
        builder.HasOne(q => q.Contact).WithMany(q => q.Participants).HasForeignKey(q => q.ContactId).IsRequired().OnDelete(DeleteBehavior.Cascade);
    }
}