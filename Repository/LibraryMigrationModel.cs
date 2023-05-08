using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace MyDockerWebAPI.Repository
{
    [Table("Book")]
    public class BookMigration
    {
        [Key]
        public int Id { get; set; }
        public string? Title { get; set; }
        public string? Author { get; set; }
        public string? Language { get; set; }
        public int Pages { get; set; }
        [ForeignKey("PublisherForeignKey")]
        public PublisherMigration? Publisher { get; set; }
        [ForeignKey("Publisher")]
        public int PublisherForeignKey { get; set; }
    }

    [Table("Publisher")]
    public class PublisherMigration
    {
        [Key]
        public int Id { get; set; }
        public string? Name { get; set; }
        public ICollection<BookMigration>? Books { get; set; }
    }
}