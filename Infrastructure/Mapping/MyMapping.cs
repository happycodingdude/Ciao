namespace Infrastructure.Mapping;

public class MyMapping : Profile
{
    public MyMapping()
    {
        CreateMap<AttachmentDto, Attachment>().ReverseMap();
        // CreateMap<SendMessageReq_Attachments, Attachment>().ReverseMap();
        CreateMap<Contact, ContactDto>().ReverseMap();
        CreateMap<Contact, EventNewMessage_Contact>().ReverseMap();
        CreateMap<Contact, ContactInfoMoreDetails>().ReverseMap();
        // CreateMap<Conversation, CreateGroupConversationRequest>().ReverseMap();
        CreateMap<Conversation, EventNewMessage_Conversation>().ReverseMap();
        CreateMap<NewGroupConversationModel_Conversation, Conversation>().ReverseMap();
        CreateMap<NewGroupConversationModel_Conversation, EventNewMessage_Conversation>().ReverseMap();
        CreateMap<NewGroupConversationModel_Conversation, ConversationCacheModel>().ReverseMap();
        CreateMap<NewGroupConversationModel, EventNewMessage_Conversation>().ReverseMap();
        CreateMap<ConversationCacheModel, EventNewMessage_Conversation>().ReverseMap();
        CreateMap<CreateGroupConversationReq, Conversation>()
            .ForMember(q => q.Members, s => s.MapFrom(w => w.Members.Select(contactId => new Member { ContactId = contactId })))
            .ReverseMap();
        CreateMap<Conversation, ConversationCacheModel>().ReverseMap();
        CreateMap<NewGroupConversationModel, ConversationCacheModel>().ReverseMap();
        CreateMap<NewGroupConversationModel, Conversation>().ReverseMap();
        CreateMap<NewStoredGroupConversationModel_Conversation, Conversation>().ReverseMap();
        CreateMap<NewStoredGroupConversationModel, EventNewConversation>().ReverseMap();
        CreateMap<NewStoredGroupConversationModel_Conversation, EventNewMessage_Conversation>().ReverseMap();
        CreateMap<NewStoredGroupConversationModel_Conversation, ConversationCacheModel>().ReverseMap();
        CreateMap<ConversationWithTotalUnseenWithContactInfo, ConversationCacheModel>().ReverseMap();
        CreateMap<ConversationWithTotalUnseenWithContactInfoAndNoMessage, ConversationCacheModel>().ReverseMap();
        CreateMap<ConversationWithTotalUnseenWithContactInfoAndNoMessage, GetConversationsResponse>().ReverseMap();
        CreateMap<MemberWithContactInfoAndFriendRequest, MemberWithFriendRequest>()
            .ForMember(q => q.ContactId, s => s.MapFrom(w => w.Contact.Id))
            .ReverseMap();
        CreateMap<MemberWithContactInfoAndFriendRequest, Member>()
            .ForMember(q => q.ContactId, s => s.MapFrom(w => w.Contact.Id))
            .ReverseMap();
        CreateMap<MemberWithContactInfo, Member>()
            .ForMember(q => q.ContactId, s => s.MapFrom(w => w.Contact.Id))
            .ReverseMap();
        CreateMap<EventNewConversation_Member, NewGroupConversationModel_Member>()
            .ForMember(q => q.ContactId, s => s.MapFrom(w => w.Contact.Id))
            .ReverseMap();
        CreateMap<MemberWithContactInfo, NewGroupConversationModel_Member>()
            .ForMember(q => q.ContactId, s => s.MapFrom(w => w.Contact.Id))
            .ReverseMap();
        // CreateMap<MemberWithContactInfo, NewStoredGroupConversationModel_Member>()
        //     .ForMember(q => q.ContactId, s => s.MapFrom(w => w.Contact.Id))
        //     .ReverseMap();
        CreateMap<MemberWithContactInfo, Member>().ReverseMap();
        CreateMap<MemberWithContactInfo, MemberWithContactInfoAndFriendRequest>().ReverseMap();
        CreateMap<EventNewConversation_Member, Member>()
            .ForMember(q => q.ContactId, s => s.MapFrom(w => w.Contact.Id))
            .ReverseMap();
        CreateMap<Member, NewGroupConversationModel_Member>().ReverseMap();
        // CreateMap<Member, NewStoredGroupConversationModel_Member>().ReverseMap();
        // CreateMap<EventNewMember, NewStoredMemberModel>().ReverseMap();
        // CreateMap<Conversation, ConversationWithTotalUnseen>().ReverseMap();
        // CreateMap<ConversationCacheModel, ConversationWithTotalUnseen>().ReverseMap();
        CreateMap<FriendWithStatus, Friend>().ReverseMap();
        CreateMap<GetListFriendItem, Friend>().ReverseMap();
        CreateMap<FriendCacheModel, GetListFriendItem>()
            .ForMember(q => q.Id, s => s.MapFrom(w => w.FriendId))
            .ForMember(q => q.Status, s => s.MapFrom(w => w.FriendStatus))
            .ReverseMap();
        CreateMap<ContactInfo, Contact>().ReverseMap();
        CreateMap<ContactInfo, GetListFriendItem_Contact>().ReverseMap();
        CreateMap<Friend, NotificationSourceDataType_Friend>()
            .ForMember(q => q.FriendId, s => s.MapFrom(w => w.Id))
            .ReverseMap();
        CreateMap<Message, EventNewMessage>().ReverseMap();
        CreateMap<Message, MessageWithReactions>().ReverseMap();
        CreateMap<MessageReactionSumary, MessageWithReactions>().ReverseMap();
        CreateMap<Message, NewDirectConversationModel_Message>().ReverseMap();
        CreateMap<Message, SystemMessage>().ReverseMap();
        CreateMap<NewMessageModel_Message, Message>().ReverseMap();
        CreateMap<NewMessageModel_Message, SendMessageReq>().ReverseMap();
        CreateMap<NewMessageModel_Message_Attachment, SendMessageReq_Attachment>().ReverseMap();
        CreateMap<NewMessageModel_Message_Attachment, Attachment>().ReverseMap();
        CreateMap<NotificationDto, Notification>().ReverseMap();
        CreateMap<MemberDto, Member>().ReverseMap();
        CreateMap<MemberWithFriendRequest, Member>().ReverseMap();
        // CreateMap<MemberWithFriendRequest, CreateGroupConversation_Member>().ReverseMap();
        CreateMap<ScheduleDto, Schedule>().ReverseMap();
        CreateMap<ScheduleContactDto, ScheduleContact>().ReverseMap();
    }
}