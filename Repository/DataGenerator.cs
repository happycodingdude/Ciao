using Bogus;

namespace MyDockerWebAPI.Repository
{
    public class DataGenerator
    {
        public static readonly List<Publisher> Publishers = new();
        public static readonly List<Category> Categories = new();
        public static readonly List<Book> Books = new();
        private const int NumberOfPublisher = 1;
        private const int NumberOfCategory = 1;
        private const int NumberOfBook = 3;

        public static void InitBogusData()
        {
            var publisherGenerator = GetPublisherGenerator();
            var generatedPublishers = publisherGenerator.Generate(NumberOfPublisher);
            Publishers.AddRange(generatedPublishers);

            var categoryGenerator = GetCategoryGenerator();
            var generatedCategorys = categoryGenerator.Generate(NumberOfCategory);
            Categories.AddRange(generatedCategorys);

            var bookGenerator = GetBookGenerator(generatedPublishers.FirstOrDefault().Id, generatedCategorys.FirstOrDefault().Id);
            var generatedBooks = bookGenerator.Generate(NumberOfBook);
            Console.WriteLine("InitBogusData Count " + generatedBooks.Count.ToString());
            Console.WriteLine("InitBogusData generatedBooks " + generatedBooks.FirstOrDefault().Id.ToString());
            Books.AddRange(generatedBooks);
        }

        private static Faker<Publisher> GetPublisherGenerator()
        {
            int id = 1;
            return new Faker<Publisher>()
                 .RuleFor(r => r.Id, _ => id++)
                 .RuleFor(r => r.Name, (_, r) => "Publisher " + r.Id)
                 .RuleFor(r => r.create_time, _ => DateTime.Now)
                 .RuleFor(r => r.modify_time, _ => DateTime.Now);
        }

        private static Faker<Category> GetCategoryGenerator()
        {
            int id = 1;
            return new Faker<Category>()
                  .RuleFor(r => r.Id, _ => id++)
                  .RuleFor(r => r.Name, (_, r) => "Category " + r.Id)
                  .RuleFor(r => r.create_time, _ => DateTime.Now)
                  .RuleFor(r => r.modify_time, _ => DateTime.Now);
        }

        private static Faker<Book> GetBookGenerator(int publisherId, int categoryId)
        {
            Console.WriteLine("GetBookGenerator publisherId " + publisherId.ToString());
            Console.WriteLine("GetBookGenerator categoryId " + categoryId.ToString());
            int id = 1;
            int page = 100;
            return new Faker<Book>()
                .RuleFor(r => r.Id, _ => id++)
                .RuleFor(r => r.Title, (_, r) => "Title " + r.Id)
                .RuleFor(r => r.Author, (_, r) => "Author " + r.Id)
                .RuleFor(r => r.Language, (_, r) => "Language " + r.Id)
                .RuleFor(r => r.Pages, _ => page += 100)
                .RuleFor(r => r.PublisherId, publisherId)
                .RuleFor(r => r.CategoryId, categoryId)
                .RuleFor(r => r.create_time, _ => DateTime.Now)
                .RuleFor(r => r.modify_time, _ => DateTime.Now);
        }
    }
}