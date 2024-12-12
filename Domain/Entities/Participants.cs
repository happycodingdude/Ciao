namespace Domain.Entities;

public class Participant : MongoBaseModel
{
    public bool IsDeleted { get; set; }
    public bool IsModerator { get; set; }
    public bool IsNotifying { get; set; }
    public Participant_Contact Contact { get; set; } = null!;
}

public class Participant_Contact
{
    public string Id { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string Avatar { get; set; } = null!;
    public bool IsOnline { get; set; }
}