namespace Chat.API.Repository;

public class ScheduleContactEntityConfiguration : IEntityTypeConfiguration<ScheduleContact>
{
    public void Configure(EntityTypeBuilder<ScheduleContact> builder)
    {
        builder.ToTable("ScheduleContact");
        builder.HasKey(q => q.Id);
        builder.Property(q => q.CreatedTime).ValueGeneratedOnAdd().HasDefaultValueSql("CURRENT_TIMESTAMP(6)");
        builder.Property(q => q.IsDeleted).IsRequired();
        builder.HasOne(q => q.Schedule).WithMany(q => q.ScheduleContacts).HasForeignKey(q => q.ScheduleId).IsRequired().OnDelete(DeleteBehavior.Cascade);
        builder.HasOne(q => q.Contact).WithMany(q => q.ScheduleContacts).HasForeignKey(q => q.ContactId).IsRequired().OnDelete(DeleteBehavior.Cascade);
    }
}