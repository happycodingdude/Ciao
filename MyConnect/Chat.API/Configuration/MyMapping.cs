namespace Chat.API.Configuration;

public class MyMapping : Profile
{
    public MyMapping()
    {
        CreateMap<AttachmentDto, Attachment>().ReverseMap();
        CreateMap<AttachmentDto, AttachmentNoReference>().ReverseMap();
        CreateMap<ContactDto, Contact>().ReverseMap();
        CreateMap<ContactDto, ContactNoReference>().ReverseMap();
        CreateMap<Contact, ContactNoReference>().ReverseMap();
        CreateMap<ConversationDto, Conversation>().ReverseMap();
        CreateMap<ConversationDto, ConversationWithTotalUnseen>().ReverseMap();
        CreateMap<Conversation, ConversationWithTotalUnseen>().ReverseMap();
        CreateMap<ConversationDto, ConversationToNotify>().ReverseMap();
        CreateMap<FriendDto, Friend>().ReverseMap();
        CreateMap<FriendDto, FriendToNotify>().ReverseMap();
        CreateMap<MessageDto, Message>().ReverseMap();
        CreateMap<MessageDto, MessageToNotify>().ReverseMap();
        CreateMap<MessageDto, MessageNoReference>().ReverseMap();
        CreateMap<Message, MessageNoReference>().ReverseMap();
        CreateMap<NotificationDto, Notification>().ReverseMap();
        CreateMap<NotificationDto, NotificationTypeConstraint>().ReverseMap();
        CreateMap<Notification, NotificationTypeConstraint>().ReverseMap();
        CreateMap<ParticipantDto, Participant>().ReverseMap();
        CreateMap<ParticipantDto, ParticipantNoReference>().ReverseMap();
        CreateMap<Participant, ParticipantNoReference>().ReverseMap();
        CreateMap<ScheduleDto, Schedule>().ReverseMap();
        CreateMap<ScheduleContactDto, ScheduleContact>().ReverseMap();
    }
}