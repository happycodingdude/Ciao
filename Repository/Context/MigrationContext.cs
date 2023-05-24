using Microsoft.EntityFrameworkCore;
using MyDockerWebAPI.Model;

namespace MyDockerWebAPI.Repository
{
    public class MigrationContext : CoreContext
    {
        public MigrationContext(DbContextOptions<CoreContext> option) : base(option)
        {
        }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            Console.WriteLine("MigrationContext OnConfiguring calling");
            base.OnConfiguring(optionsBuilder);
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            Console.WriteLine("MigrationContext OnModelCreating calling");
            base.OnModelCreating(modelBuilder);

            Seed(modelBuilder);
        }

        private void Seed(ModelBuilder modelBuilder)
        {
            DataGenerator.InitBogusData();
            modelBuilder.Entity<User>().HasData(DataGenerator.Users);
            modelBuilder.Entity<Participant>().HasData(DataGenerator.Participants);
            modelBuilder.Entity<Location>().HasData(DataGenerator.Locations);
            modelBuilder.Entity<Form>().HasData(DataGenerator.Forms);
        }
    }
}