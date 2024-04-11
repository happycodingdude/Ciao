using MyConnect.Interface;
using MyConnect.Model;

namespace Chat.API.MinimalAPI
{
    public partial class MinimalAPI
    {
        public static void Configure(WebApplication app)
        {
            app.MapGroup("/api")
            .MapGet("/conversations", (IConversationService service, int page, int limit) =>
            {
                var response = service.GetAllWithUnseenMesages(page, limit);
                return Results.Ok(new ResponseModel<IEnumerable<ConversationWithTotalUnseen>>(response));
            })
            .RequireAuthorization("AllUser");
        }
    }
}