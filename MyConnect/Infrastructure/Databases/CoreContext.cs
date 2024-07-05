namespace Infrastructure.Database;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> option) : base(option)
    {
    }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        Console.WriteLine("AppDbContext OnConfiguring calling");
        base.OnConfiguring(optionsBuilder);
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        Console.WriteLine("AppDbContext OnModelCreating calling");
        base.OnModelCreating(modelBuilder);

        modelBuilder.ApplyConfiguration(new ContactEntityConfiguration());
        modelBuilder.ApplyConfiguration(new ConversationEntityConfiguration());
        modelBuilder.ApplyConfiguration(new MessageEntityConfiguration());
        modelBuilder.ApplyConfiguration(new ParticipantEntityConfiguration());
        modelBuilder.ApplyConfiguration(new ScheduleEntityConfiguration());
        modelBuilder.ApplyConfiguration(new ScheduleContactEntityConfiguration());
        modelBuilder.ApplyConfiguration(new AttachmentEntityConfiguration());
        modelBuilder.ApplyConfiguration(new FriendEntityConfiguration());
        modelBuilder.ApplyConfiguration(new NotificationEntityConfiguration());
    }

    public DbSet<Contact>? Contacts { get; set; }
    public DbSet<Conversation>? Conversations { get; set; }
    public DbSet<Message>? Messages { get; set; }
    public DbSet<Participant>? Participants { get; set; }
    public DbSet<Schedule>? Schedules { get; set; }
    public DbSet<ScheduleContact>? ScheduleContacts { get; set; }
    public DbSet<Friend>? Friends { get; set; }
    public DbSet<Notification>? Notifications { get; set; }
}