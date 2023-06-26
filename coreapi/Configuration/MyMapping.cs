using AutoMapper;
using MyDockerWebAPI.Model;

namespace MyDockerWebAPI.Configuration
{
    public class MyMapping : Profile
    {
        public MyMapping()
        {
            CreateMap<Submission, SubmissionToAdd>().ReverseMap();
        }
    }
}