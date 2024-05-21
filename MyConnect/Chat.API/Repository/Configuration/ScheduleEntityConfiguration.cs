namespace Chat.API.Repository;

public class ScheduleEntityConfiguration : IEntityTypeConfiguration<Schedule>
{
    public void Configure(EntityTypeBuilder<Schedule> builder)
    {
        builder.ToTable("Schedule");
        builder.HasKey(q => q.Id);
        builder.Property(q => q.CreatedTime).ValueGeneratedOnAdd().HasDefaultValueSql("CURRENT_TIMESTAMP(6)");
        builder.Property(q => q.Content).IsRequired();
        builder.Property(q => q.StartDate).IsRequired();
        builder.Property(q => q.EndDate).IsRequired();
        builder.Property(q => q.Status).HasMaxLength(20);
    }
}