using AutoMapper;
using MyConnect.Model;

namespace MyConnect.Configuration
{
    public class MyMapping : Profile
    {
        public MyMapping()
        {
            CreateMap<Conversation, ConversationWithTotalUnseen>().ReverseMap();
            CreateMap<Conversation, ConversationToNotify>().ReverseMap();
            CreateMap<Participant, ParticipantNoReference>().ReverseMap();
            CreateMap<Message, MessageToNotify>().ReverseMap();
            CreateMap<Message, MessageNoReference>().ReverseMap();
            CreateMap<Attachment, AttachmentNoReference>().ReverseMap();
            CreateMap<Contact, ContactNoReference>().ReverseMap();
            CreateMap<Notification, NotificationTypeConstraint<Friend>>().ReverseMap();
            CreateMap<NotificationDto, NotificationTypeConstraint<Friend>>().ReverseMap();
        }
    }
}