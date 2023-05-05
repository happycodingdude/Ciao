using System.Text;
using Microsoft.EntityFrameworkCore;
using MyDockerWebAPI.Repository;

namespace MyDockerWebAPI
{
    public class Startup
    {
        public void ConfigureServices(WebApplicationBuilder builder)
        {
            builder.Services.AddDbContext<LibraryContext>(option =>
            {
                option.UseMySQL(builder.Configuration.GetConnectionString("MyDbContext"));
            });
        }

        public void Configure(WebApplication app)
        {
            Console.WriteLine("Startup calls");
            using (var scope = app.Services.CreateScope())
            {
                var dbContext = scope.ServiceProvider.GetRequiredService<LibraryContext>();
                // use context
                InsertData(dbContext);
                PrintData(dbContext);
            }
        }

        private void InsertData(LibraryContext context)
        {
            // Creates the database if not exists
            context.Database.EnsureCreated();

            // Adds a publisher
            var publisher = new Publisher
            {
                Name = "Mariner Books"
            };
            context.Publisher.Add(publisher);

            // Adds some books
            context.Book.Add(new Book
            {
                Title = "The Lord of the Rings",
                Author = "J.R.R. Tolkien",
                Language = "English",
                Pages = 1216,
                Publisher = publisher
            });
            context.Book.Add(new Book
            {
                Title = "The Sealed Letter",
                Author = "Emma Donoghue",
                Language = "English",
                Pages = 416,
                Publisher = publisher
            });

            // Saves changes
            context.SaveChanges();
        }

        private void PrintData(LibraryContext context)
        {
            // Gets and prints all books in database
            var books = context.Book
              .Include(p => p.Publisher);
            foreach (var book in books)
            {
                var data = new StringBuilder();
                data.AppendLine($"Id: {book.Id}");
                data.AppendLine($"Title: {book.Title}");
                data.AppendLine($"Publisher: {book.Publisher.Name}");
                Console.WriteLine(data.ToString());
            }
        }
    }
}