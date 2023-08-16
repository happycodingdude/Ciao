using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MyDockerWebAPI.Model;

namespace MyDockerWebAPI.Repository
{
    public class SubmissionEntityConfiguration : IEntityTypeConfiguration<Submission>
    {
        public void Configure(EntityTypeBuilder<Submission> builder)
        {
            builder.ToTable("Submission");
            builder.HasKey(q => q.Id);
            builder.HasOne(q => q.Form).WithMany(q => q.Submissions).HasForeignKey(q => q.FormId).IsRequired().OnDelete(DeleteBehavior.Cascade);
            builder.HasOne(q => q.Location).WithMany(q => q.Submissions).HasForeignKey(q => q.LocationId).IsRequired().OnDelete(DeleteBehavior.Cascade);
            builder.Property(q => q.CreateTime).ValueGeneratedOnAdd().HasDefaultValueSql("CURRENT_TIMESTAMP(6)");
            builder.Property(q => q.FromTime).IsRequired();
            builder.Property(q => q.ToTime).IsRequired();
            builder.Property(q => q.Status).IsRequired().HasMaxLength(10);
            builder.Property(q => q.Participants).HasMaxLength(100);
        }
    }
}