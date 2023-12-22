using AutoMapper;
using MyConnect.Model;

namespace MyConnect.Configuration
{
    public class MyMapping : Profile
    {
        public MyMapping()
        {
            CreateMap<Conversation, ConversationWithTotalUnseen>().ReverseMap();
            CreateMap<Message, MessageToNotify>().ReverseMap();
            CreateMap<Message, MessageNoReference>().ReverseMap();
            CreateMap<Contact, ContactNoReference>().ReverseMap();
        }
    }
}