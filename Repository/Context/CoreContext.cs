using Microsoft.EntityFrameworkCore;
using MyDockerWebAPI.Model;

namespace MyDockerWebAPI.Repository
{
    public class CoreContext : DbContext
    {
        public CoreContext(DbContextOptions<CoreContext> option) : base(option)
        {
        }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            Console.WriteLine("CoreContext OnConfiguring calling");
            base.OnConfiguring(optionsBuilder);
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            Console.WriteLine("CoreContext OnModelCreating calling");
            base.OnModelCreating(modelBuilder);

            modelBuilder.ApplyConfiguration(new UserEntityConfiguration());
            modelBuilder.ApplyConfiguration(new FormEntityConfiguration());
            modelBuilder.ApplyConfiguration(new ParticipantiEntityConfiguration());
            modelBuilder.ApplyConfiguration(new LocationEntityConfiguration());
            modelBuilder.ApplyConfiguration(new SubmissionEntityConfiguration());
        }

        public DbSet<User>? Users { get; set; }
        public DbSet<Participant>? Participants { get; set; }
        public DbSet<Location>? Locations { get; set; }
        public DbSet<Form>? Forms { get; set; }
        public DbSet<Submission>? Submissions { get; set; }
    }
}