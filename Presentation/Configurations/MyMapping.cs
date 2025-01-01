namespace Presentation.Configurations;

public class MyMapping : Profile
{
    public MyMapping()
    {
        CreateMap<AttachmentDto, Attachment>().ReverseMap();
        CreateMap<Contact, ContactDto>().ReverseMap();
        CreateMap<Contact, MessageToNotify_Contact>().ReverseMap();
        CreateMap<Conversation, CreateConversationRequest>().ReverseMap();
        CreateMap<Conversation, ConversationToNotify>().ReverseMap();
        CreateMap<ConversationToNotify, CreateConversationRequest>().ReverseMap();
        CreateMap<Conversation, MessageToNotify_Conversation>().ReverseMap();
        CreateMap<Participant, CreateConversation_Participant>()
            .ForMember(q => q.ContactId, s => s.MapFrom(w => w.Contact.Id))
            .ReverseMap();
        CreateMap<ConversationWithMessagesAndFriendRequest, ConversationWithTotalUnseen>().ReverseMap();
        CreateMap<FriendWithStatus, Friend>().ReverseMap();
        CreateMap<GetListFriendItem, Friend>().ReverseMap();
        CreateMap<Friend, NotificationSourceDataType_Friend>()
            .ForMember(q => q.FriendId, s => s.MapFrom(w => w.Id))
            .ReverseMap();
        CreateMap<Message, MessageToNotify>().ReverseMap();
        CreateMap<Message, MessageWithReactions>().ReverseMap();
        CreateMap<NotificationDto, Notification>().ReverseMap();
        CreateMap<ParticipantDto, Participant>().ReverseMap();
        CreateMap<ScheduleDto, Schedule>().ReverseMap();
        CreateMap<ScheduleContactDto, ScheduleContact>().ReverseMap();
    }
}