using Bogus;
using MyDockerWebAPI.Model;

namespace MyDockerWebAPI.Repository
{
    public class DataGenerator
    {
        public static readonly List<Publisher> Publishers = new();
        public static readonly List<Category> Categories = new();
        public static readonly List<Book> Books = new();
        public static readonly List<User> Users = new();
        private static bool IsGenerated = false;
        private const int NumberOfPublisher = 1;
        private const int NumberOfCategory = 1;
        private const int NumberOfBook = 3;
        private const int NumberOfUser = 2;

        public static void InitBogusData()
        {
            if (!IsGenerated)
            {
                Console.WriteLine("Data generating");
                IsGenerated = true;

                var publisherGenerator = GetPublisherGenerator();
                var publishers = publisherGenerator.Generate(NumberOfPublisher);
                Publishers.AddRange(publishers);

                var categoryGenerator = GetCategoryGenerator();
                var categories = categoryGenerator.Generate(NumberOfCategory);
                Categories.AddRange(categories);

                var bookGenerator = GetBookGenerator(publishers.FirstOrDefault().Id, categories.FirstOrDefault().Id);
                var books = bookGenerator.Generate(NumberOfBook);
                Books.AddRange(books);

                var userGenerator = GetUserGenerator();
                var users = userGenerator.Generate(NumberOfUser);
                Users.AddRange(users);
            }
        }

        private static Faker<Publisher> GetPublisherGenerator()
        {
            int id = 1;
            return new Faker<Publisher>()
                 .RuleFor(r => r.Id, _ => id++)
                 .RuleFor(r => r.Name, (_, r) => "Publisher " + r.Id);
        }

        private static Faker<Category> GetCategoryGenerator()
        {
            int id = 1;
            return new Faker<Category>()
                  .RuleFor(r => r.Id, _ => id++)
                  .RuleFor(r => r.Name, (_, r) => "Category " + r.Id);
        }

        private static Faker<Book> GetBookGenerator(int publisherId, int categoryId)
        {
            int id = 1;
            int page = 100;
            return new Faker<Book>()
                .RuleFor(r => r.Id, _ => id++)
                .RuleFor(r => r.Title, (_, r) => "Title " + r.Id)
                .RuleFor(r => r.Author, (_, r) => "Author " + r.Id)
                .RuleFor(r => r.Language, (_, r) => "Language " + r.Id)
                .RuleFor(r => r.Pages, _ => page += 100)
                .RuleFor(r => r.PublisherId, publisherId)
                .RuleFor(r => r.CategoryId, categoryId);
        }

        private static Faker<User> GetUserGenerator()
        {
            int id = 1;
            return new Faker<User>()
                  .RuleFor(r => r.Id, _ => id++)
                  .RuleFor(r => r.Name, (_, r) => "User " + r.Id);
        }
    }
}