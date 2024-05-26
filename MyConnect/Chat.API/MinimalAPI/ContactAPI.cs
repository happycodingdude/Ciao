using System.Text.Json;

namespace Chat.API.MinimalAPI;

public partial class MinimalAPI
{
    public static void ConfigureContactAPI(WebApplication app)
    {
        app.MapGroup(Constants.ApiRoute_Contact).MapGet(Constants.ApiEndpoint_Info,
        (IContactService contactService, HttpContext context) =>
        {
            var id = Guid.Parse(context.Session.GetString("UserId"));
            var response = contactService.GetById(id);
            return Results.Ok(response);
        }).RequireAuthorization("AllUser");

        app.MapGroup(Constants.ApiRoute_Contact).MapGet("",
        (IUnitOfWork unitOfWork, [FromQuery] string name) =>
        {
            Console.WriteLine(name);
            var response = unitOfWork.Contact.DbSet.Where(q => q.Name.Contains(name)).ToList();
            return Results.Ok(response);
        }).RequireAuthorization("AllUser");

        app.MapGroup(Constants.ApiRoute_Contact).MapGet("/{id}",
        (IContactService contactService, Guid id) =>
        {
            var response = contactService.GetById(id);
            return Results.Ok(response);
        }).RequireAuthorization("AllUser");

        app.MapGroup(Constants.ApiRoute_Contact).MapGet("/{id}/friends/{friendId}",
        (IFriendService friendService, Guid id, Guid friendId) =>
        {
            var response = friendService.GetByTwoContactId(id, friendId);
            return Results.Ok(response);
        }).RequireAuthorization("AllUser");

        app.MapGroup(Constants.ApiRoute_Contact).MapGet("/{id}/friends",
        (IFriendService friendService, Guid id) =>
        {
            var response = friendService.GetAllFriendByContactId(id);
            return Results.Ok(response);
        }).RequireAuthorization("AllUser");

        app.MapGroup(Constants.ApiRoute_Contact).MapPatch("/{id}",
        (IContactService contactService, Guid id, JsonElement jsonElement) =>
        {
            var json = jsonElement.GetRawText();
            var patch = JsonConvert.DeserializeObject<JsonPatchDocument>(json);
            var response = contactService.Patch(id, patch);
            return Results.Ok(response);
        }).RequireAuthorization("AllUser");

        app.MapGroup(Constants.ApiRoute_Contact).MapPost("",
        (IMapper mapper, IUnitOfWork unitOfWork, ContactDto model) =>
        {
            var entity = mapper.Map<ContactDto, Contact>(model);
            unitOfWork.Contact.Add(entity);
            unitOfWork.Save();
            return Results.Ok();
        });
    }
}