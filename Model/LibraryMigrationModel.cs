namespace MyDockerWebAPI.Model
{
    public class Book : BaseModel
    {
        public string? Title { get; set; }
        public string? Author { get; set; }
        public string? Language { get; set; }
        public int Pages { get; set; }
        public int PublisherId { get; set; }
        public Publisher? Publisher { get; set; }
        public int CategoryId { get; set; }
        public Category? Category { get; set; }
    }

    public class Publisher : BaseModel
    {
        public string? Name { get; set; }
        public ICollection<Book>? Books { get; set; }
    }

    public class Category : BaseModel
    {
        public string? Name { get; set; }
        public ICollection<Book>? Books { get; set; }
    }
}