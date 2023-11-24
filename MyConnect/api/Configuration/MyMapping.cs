using AutoMapper;
using MyConnect.Model;

namespace MyConnect.Configuration
{
    public class MyMapping : Profile
    {
        public MyMapping()
        {
            CreateMap<Conversation, ConversationWithTotalUnseen>().ReverseMap();
        }
    }
}