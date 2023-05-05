public class Book
{
    public int Id { get; set; }
    public string? Title { get; set; }
    public string? Author { get; set; }
    public string? Language { get; set; }
    public int Pages { get; set; }
    public virtual Publisher? Publisher { get; set; }
}

public class Publisher
{
    public int Id { get; set; }
    public string? Name { get; set; }
    public virtual ICollection<Book>? Books { get; set; }
}