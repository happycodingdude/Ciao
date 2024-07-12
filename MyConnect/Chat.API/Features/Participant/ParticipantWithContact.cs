namespace Chat.API.Features.Participants;

public class ParticipantWithContact
{
    public Guid Id { get; set; }
    public bool IsDeleted { get; set; }
    public bool IsModerator { get; set; }
    public bool IsNotifying { get; set; }
    public Guid ContactId { get; set; }
    public ParticipantWithContact_Contact Contact { get; set; }
}

public class ParticipantWithContact_Contact
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    public string Avatar { get; set; }
}