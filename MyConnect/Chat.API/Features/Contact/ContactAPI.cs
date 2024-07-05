using System.Text.Json;
using Newtonsoft.Json;

namespace Chat.API.MinimalAPI;

public partial class MinimalAPI
{
    public static void ConfigureContactAPI(WebApplication app)
    {
        // app.MapGroup(Constants.ApiRoute_Contact).MapGet(Constants.ApiEndpoint_Info,
        // (IContactService contactService, HttpContext context) =>
        // {
        //     var userId = Guid.Parse(context.Session.GetString("UserId"));
        //     var response = contactService.GetById(userId);
        //     return Results.Ok(response);
        // }).RequireAuthorization("AllUser");

        // app.MapGroup(Constants.ApiRoute_Contact).MapGet("",
        // (HttpContext context, IMapper mapper, IUnitOfWork unitOfWork, IFriendService friendService, [FromQuery] string name) =>
        // {
        //     if (string.IsNullOrEmpty(name)) return Results.Ok(Enumerable.Empty<Contact>());
        //     var id = Guid.Parse(context.Session.GetString("UserId"));
        //     var response = unitOfWork.Contact.DbSet.Where(q => q.Id != id && q.Name.Contains(name)).ToList();
        //     var dtos = mapper.Map<List<Contact>, List<ContactDto>>(response);
        //     foreach (var contact in dtos)
        //     {
        //         var friendRequest = friendService.GetByTwoContactId(id, contact.Id);
        //         contact.FriendId = friendRequest.Id == Guid.Empty ? null : friendRequest.Id;
        //         contact.FriendStatus = friendRequest.Status;
        //     }
        //     return Results.Ok(dtos);
        // }).RequireAuthorization("AllUser");

        // app.MapGroup(Constants.ApiRoute_Contact).MapGet("/{id}",
        // (IContactService contactService, IFriendService friendService, HttpContext context
        // , Guid id, [FromQuery] bool includeFriend = false) =>
        // {
        //     var userId = Guid.Parse(context.Session.GetString("UserId"));
        //     var response = contactService.GetById(id);
        //     if (includeFriend)
        //     {
        //         var friendRequest = friendService.GetByTwoContactId(userId, id);
        //         response.FriendId = friendRequest.Id == Guid.Empty ? null : friendRequest.Id;
        //         response.FriendStatus = friendRequest.Status;
        //     }
        //     return Results.Ok(response);
        // }).RequireAuthorization("AllUser");

        // app.MapGroup(Constants.ApiRoute_Contact).MapGet("/{id}/friends/{friendId}",
        // (IFriendService friendService, Guid id, Guid friendId) =>
        // {
        //     var response = friendService.GetByTwoContactId(id, friendId);
        //     return Results.Ok(response);
        // }).RequireAuthorization("AllUser");

        // app.MapGroup(Constants.ApiRoute_Contact).MapGet("/{id}/friends",
        // (IFriendService friendService, Guid id) =>
        // {
        //     var response = friendService.GetAllFriendByContactId(id);
        //     return Results.Ok(response);
        // }).RequireAuthorization("AllUser");

        // app.MapGroup(Constants.ApiRoute_Contact).MapPatch("/{id}",
        // async (IContactService contactService, Guid id, JsonElement jsonElement) =>
        // {
        //     var json = jsonElement.GetRawText();
        //     var patch = JsonConvert.DeserializeObject<JsonPatchDocument>(json);
        //     var response = await contactService.PatchAsync(id, patch);
        //     return Results.Ok(response);
        // }).RequireAuthorization("AllUser");

        // app.MapGroup(Constants.ApiRoute_Contact).MapPost("",
        // async (IMapper mapper, IUnitOfWork unitOfWork, ContactDto model) =>
        // {
        //     var entity = mapper.Map<ContactDto, Contact>(model);
        //     unitOfWork.Contact.Add(entity);
        //     await unitOfWork.SaveAsync();
        //     return Results.Ok();
        // });
    }
}