namespace Infrastructure.Mapping;

public class MyMapping : Profile
{
    public MyMapping()
    {
        CreateMap<AttachmentDto, Attachment>().ReverseMap();
        // CreateMap<SendMessageReq_Attachments, Attachment>().ReverseMap();
        CreateMap<Contact, ContactDto>().ReverseMap();
        CreateMap<Contact, MessageToNotify_Contact>().ReverseMap();
        // CreateMap<Conversation, CreateGroupConversationRequest>().ReverseMap();
        CreateMap<Conversation, ConversationToNotify>().ReverseMap();
        CreateMap<Conversation, CreateGroupConversationReq>().ReverseMap();
        CreateMap<Conversation, ConversationCacheModel>().ReverseMap();
        CreateMap<ConversationWithTotalUnseenWithContactInfo, ConversationCacheModel>().ReverseMap();
        CreateMap<ConversationWithTotalUnseenWithContactInfoAndNoMessage, ConversationCacheModel>().ReverseMap();
        CreateMap<MemberWithContactInfoAndFriendRequest, MemberWithFriendRequest>()
            .ForMember(q => q.ContactId, s => s.MapFrom(w => w.Contact.Id))
            .ReverseMap();
        CreateMap<MemberWithContactInfoAndFriendRequest, Member>()
            .ForMember(q => q.ContactId, s => s.MapFrom(w => w.Contact.Id))
            .ReverseMap();
        CreateMap<MemberWithContactInfo, Member>()
            .ForMember(q => q.ContactId, s => s.MapFrom(w => w.Contact.Id))
            .ReverseMap();
        // CreateMap<Conversation, ConversationWithTotalUnseen>().ReverseMap();
        // CreateMap<ConversationCacheModel, ConversationWithTotalUnseen>().ReverseMap();
        CreateMap<FriendWithStatus, Friend>().ReverseMap();
        CreateMap<GetListFriendItem, Friend>().ReverseMap();
        CreateMap<FriendCacheModel, GetListFriendItem>()
            .ForMember(q => q.Id, s => s.MapFrom(w => w.FriendId))
            .ReverseMap();
        CreateMap<ContactInfo, Contact>().ReverseMap();
        CreateMap<ContactInfo, GetListFriendItem_Contact>().ReverseMap();
        CreateMap<Friend, NotificationSourceDataType_Friend>()
            .ForMember(q => q.FriendId, s => s.MapFrom(w => w.Id))
            .ReverseMap();
        CreateMap<Message, MessageToNotify>().ReverseMap();
        CreateMap<Message, MessageWithReactions>().ReverseMap();
        CreateMap<Message, SendMessageReq>().ReverseMap();
        CreateMap<NotificationDto, Notification>().ReverseMap();
        CreateMap<MemberDto, Member>().ReverseMap();
        CreateMap<MemberWithFriendRequest, Member>().ReverseMap();
        // CreateMap<MemberWithFriendRequest, CreateGroupConversation_Member>().ReverseMap();
        CreateMap<ScheduleDto, Schedule>().ReverseMap();
        CreateMap<ScheduleContactDto, ScheduleContact>().ReverseMap();
    }
}