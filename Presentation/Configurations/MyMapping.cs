namespace Presentation.Configurations;

public class MyMapping : Profile
{
    public MyMapping()
    {
        CreateMap<AttachmentDto, Attachment>().ReverseMap();
        CreateMap<AttachmentDto, AttachmentNoReference>().ReverseMap();
        CreateMap<ContactDto, Contact>().ReverseMap();
        CreateMap<ContactDto, ContactNoReference>().ReverseMap();
        CreateMap<Contact, ContactNoReference>().ReverseMap();
        CreateMap<Contact, ParticipantWithContact_Contact>().ReverseMap();
        CreateMap<Conversation, CreateConversationRequest>().ReverseMap();
        CreateMap<Participant, CreateConversation_Participant>()
            .ForMember(q => q.ContactId, s => s.MapFrom(w => w.Contact.Id))
            .ReverseMap();
        CreateMap<Message, CreateMessageRequest>().ReverseMap();
        // CreateMap<ConversationDto, ConversationWithTotalUnseen>().ReverseMap();
        CreateMap<ConversationWithMessagesAndFriendRequest, ConversationWithTotalUnseen>().ReverseMap();
        CreateMap<Conversation, ConversationToNotify>().ReverseMap();
        // CreateMap<Conversation, ConversationWithMessages>().ReverseMap();
        CreateMap<FriendWithStatus, Friend>().ReverseMap();
        CreateMap<GetListFriendItem, Friend>().ReverseMap();
        // CreateMap<FriendDto, FriendToNotify>().ReverseMap();
        CreateMap<Friend, NotificationSourceDataType_Friend>()
            .ForMember(q => q.FriendId, s => s.MapFrom(w => w.Id))
            .ReverseMap();
        CreateMap<MessageDto, Message>().ReverseMap();
        CreateMap<MessageDto, MessageToNotify>().ReverseMap();
        CreateMap<Message, MessageToNotify>().ReverseMap();
        CreateMap<Message, MessageWithReactions>().ReverseMap();
        // CreateMap<MessageDto, MessageNoReference>().ReverseMap();
        // CreateMap<Message, MessageNoReference>().ReverseMap();
        // CreateMap<Message, MessageWithAttachment>().ReverseMap();
        // CreateMap<Attachment, MessageWithAttachment_Attachment>().ReverseMap();
        CreateMap<NotificationDto, Notification>().ReverseMap();
        // CreateMap(typeof(NotificationDto), typeof(NotificationTypeConstraint<>)).ReverseMap();
        // CreateMap(typeof(Notification), typeof(NotificationTypeConstraint<>)).ReverseMap();
        // CreateMap<Notification, NotificationTypeConstraint>().ReverseMap();
        CreateMap<Notification, NotificationToNotify>().ReverseMap();
        CreateMap<ParticipantDto, Participant>().ReverseMap();
        CreateMap<ParticipantDto, ParticipantNoReference>().ReverseMap();
        CreateMap<Participant, ParticipantNoReference>().ReverseMap();
        CreateMap<ScheduleDto, Schedule>().ReverseMap();
        CreateMap<ScheduleContactDto, ScheduleContact>().ReverseMap();
    }
}