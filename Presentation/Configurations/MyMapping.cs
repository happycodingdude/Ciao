namespace Presentation.Configurations;

public class MyMapping : Profile
{
    public MyMapping()
    {
        CreateMap<AttachmentDto, Attachment>().ReverseMap();
        CreateMap<Contact, ContactDto>().ReverseMap();
        CreateMap<Contact, MessageToNotify_Contact>().ReverseMap();
        CreateMap<Conversation, CreateGroupConversationRequest>().ReverseMap();
        CreateMap<Conversation, ConversationToNotify>().ReverseMap();
        CreateMap<ConversationToNotify, CreateGroupConversationRequest>().ReverseMap();
        // CreateMap<Conversation, MessageToNotify_Conversation>().ReverseMap();
        CreateMap<Participant, CreateGroupConversation_Participant>()
            .ForMember(q => q.ContactId, s => s.MapFrom(w => w.Contact.Id))
            .ReverseMap();
        CreateMap<ConversationWithMessagesAndFriendRequest, ConversationWithTotalUnseen>().ReverseMap();
        CreateMap<ConversationWithMessages, ConversationWithTotalUnseen>().ReverseMap();
        CreateMap<Conversation, ConversationWithTotalUnseen>().ReverseMap();
        CreateMap<FriendWithStatus, Friend>().ReverseMap();
        CreateMap<GetListFriendItem, Friend>().ReverseMap();
        CreateMap<Friend, NotificationSourceDataType_Friend>()
            .ForMember(q => q.FriendId, s => s.MapFrom(w => w.Id))
            .ReverseMap();
        CreateMap<Message, MessageToNotify>().ReverseMap();
        CreateMap<Message, MessageWithReactions>().ReverseMap();
        CreateMap<NotificationDto, Notification>().ReverseMap();
        CreateMap<ParticipantDto, Participant>().ReverseMap();
        CreateMap<ParticipantWithFriendRequest, Participant>().ReverseMap();
        CreateMap<ScheduleDto, Schedule>().ReverseMap();
        CreateMap<ScheduleContactDto, ScheduleContact>().ReverseMap();
    }
}