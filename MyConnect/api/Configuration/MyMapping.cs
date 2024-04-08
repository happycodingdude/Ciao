using System.Net.Mail;
using AutoMapper;
using MyConnect.Model;
using MyConnect.Repository;

namespace MyConnect.Configuration
{
    public class MyMapping : Profile
    {
        public MyMapping()
        {
            CreateMap<AttachmentDto, Repository.Attachment>().ReverseMap();
            CreateMap<AttachmentDto, AttachmentNoReference>().ReverseMap();
            CreateMap<ContactDto, Contact>().ReverseMap();
            CreateMap<ContactDto, ContactNoReference>().ReverseMap();
            CreateMap<ConversationDto, Conversation>().ReverseMap();
            CreateMap<ConversationDto, ConversationWithTotalUnseen>().ReverseMap();
            CreateMap<ConversationDto, ConversationToNotify>().ReverseMap();
            CreateMap<FriendDto, Friend>().ReverseMap();
            CreateMap<FriendDto, FriendToNotify>().ReverseMap();
            CreateMap<MessageDto, Message>().ReverseMap();
            CreateMap<MessageDto, MessageToNotify>().ReverseMap();
            CreateMap<MessageDto, MessageNoReference>().ReverseMap();
            CreateMap<NotificationDto, Notification>().ReverseMap();
            CreateMap<NotificationDto, NotificationTypeConstraint<FriendDto>>().ReverseMap();
            CreateMap<ParticipantDto, Participant>().ReverseMap();
            CreateMap<ParticipantDto, ParticipantNoReference>().ReverseMap();
            CreateMap<ScheduleDto, Schedule>().ReverseMap();
            CreateMap<ScheduleContactDto, ScheduleContact>().ReverseMap();
        }
    }
}