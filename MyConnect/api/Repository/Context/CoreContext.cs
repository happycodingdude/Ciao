using Microsoft.EntityFrameworkCore;
using MyConnect.Model;

namespace MyConnect.Repository
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

            modelBuilder.ApplyConfiguration(new ContactEntityConfiguration());
            modelBuilder.ApplyConfiguration(new ConversationEntityConfiguration());
            modelBuilder.ApplyConfiguration(new MessageEntityConfiguration());
            modelBuilder.ApplyConfiguration(new ParticipantsEntityConfiguration());
            modelBuilder.ApplyConfiguration(new ScheduleEntityConfiguration());
            modelBuilder.ApplyConfiguration(new ScheduleContactEntityConfiguration());
        }

        public DbSet<Contact>? Contacts { get; set; }
        public DbSet<Conversation>? Conversations { get; set; }
        public DbSet<Message>? Messages { get; set; }
        public DbSet<Participants>? Participants { get; set; }
        public DbSet<Schedule>? Schedules { get; set; }
        public DbSet<ScheduleContact>? ScheduleContacts { get; set; }
    }
}