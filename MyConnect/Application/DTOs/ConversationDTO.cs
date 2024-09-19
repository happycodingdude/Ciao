namespace Application.DTOs;

public class CreateConversationRequest
{
    public string Title { get; set; }
    public bool IsGroup { get; set; }
    public ICollection<CreateConversation_Participant> Participants { get; set; }
}

public class CreateConversation_Participant
{
    public bool IsDeleted { get; set; }
    public bool IsModerator { get; set; }
    public bool IsNotifying { get; set; }
    public string ContactId { get; set; }
}

public class ConversationToNotify
{
    public Guid Id { get; set; }
    public string Title { get; set; }
    public string Avatar { get; set; }
    public bool IsGroup { get; set; }
}