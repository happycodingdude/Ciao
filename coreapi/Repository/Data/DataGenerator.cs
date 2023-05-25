using Bogus;
using MyDockerWebAPI.Common;
using MyDockerWebAPI.Model;

namespace MyDockerWebAPI.Repository
{
    public class DataGenerator
    {
        public static readonly List<User> Users = new();
        public static readonly List<Participant> Participants = new();
        public static readonly List<Location> Locations = new();
        public static readonly List<Form> Forms = new();
        private static bool IsGenerated = false;
        private const int NumberOfUser = 1;
        private const int NumberOfParticipant = 1;
        private const int NumberOfLocation = 1;
        private const int NumberOfForm = 1;

        public static void InitBogusData()
        {
            if (!IsGenerated)
            {
                Console.WriteLine("Data generating");
                IsGenerated = true;

                var userGenerator = GetUserGenerator();
                var users = userGenerator.Generate(NumberOfUser);
                Users.AddRange(users);

                var participantGenerator = GetParticipantGenerator();
                var participants = participantGenerator.Generate(NumberOfParticipant);
                Participants.AddRange(participants);

                var locationGenerator = GetLocationGenerator();
                var locations = locationGenerator.Generate(NumberOfLocation);
                Locations.AddRange(locations);

                var formGenerator = GetFormGenerator();
                var forms = formGenerator.Generate(NumberOfForm);
                Forms.AddRange(forms);
            }
        }

        private static Faker<User> GetUserGenerator()
        {
            int id = 1;
            return new Faker<User>()
                 .RuleFor(r => r.Id, _ => id++)
                 .RuleFor(r => r.Name, (_, r) => "User " + r.Id)
                 .RuleFor(r => r.Username, (_, r) => "test")
                 .RuleFor(r => r.Password, (_, r) => Hash.Encrypt("test"));
        }

        private static Faker<Participant> GetParticipantGenerator()
        {
            int id = 1;
            return new Faker<Participant>()
                  .RuleFor(r => r.Id, _ => id++)
                  .RuleFor(r => r.Name, (_, r) => "Participant " + r.Id);
        }

        private static Faker<Location> GetLocationGenerator()
        {
            int id = 1;
            return new Faker<Location>()
                  .RuleFor(r => r.Id, _ => id++)
                  .RuleFor(r => r.Name, (_, r) => "Location " + r.Id)
                  .RuleFor(r => r.Address, (_, r) => "Address " + r.Id);
        }

        private static Faker<Form> GetFormGenerator()
        {
            int id = 1;
            return new Faker<Form>()
                  .RuleFor(r => r.Id, _ => id++)
                  .RuleFor(r => r.Name, (_, r) => "Form " + r.Id)
                  .RuleFor(r => r.Budget, _ => 100000);
        }
    }
}