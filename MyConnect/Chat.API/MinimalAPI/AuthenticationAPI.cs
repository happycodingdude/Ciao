using AutoMapper;
using Chat.API.Interface;
using Chat.API.Model;
using Chat.API.Repository;
using Chat.API.UOW;
using Chat.API.Util;

namespace Chat.API.MinimalAPI
{
    public partial class MinimalAPI
    {
        public static void ConfigureAuthAPI(WebApplication app)
        {
            app.MapGroup(Constants.ApiRoute_Auth).MapPost("/signup",
            (IMapper mapper, IUnitOfWork unitOfWork, ContactDto model) =>
            {
                var entity = mapper.Map<ContactDto, Contact>(model);
                unitOfWork.Contact.Add(entity);
                unitOfWork.Save();
                return Results.Ok();
            });
        }
    }
}