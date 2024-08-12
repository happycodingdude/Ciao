namespace Presentation.Conversations;

public static class GetById
{
    public record Request(Guid id) : IRequest<ConversationDto>;

    internal sealed class Handler(IConversationService service) : IRequestHandler<Request, ConversationDto>
    {
        public async Task<ConversationDto> Handle(Request request, CancellationToken cancellationToken)
        {
            return await service.GetByIdAsync(request.id);
        }
    }
}

public class GetByIdEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiRoute_Conversation).MapGet("/{id}",
        async (ISender sender, Guid id) =>
        {
            var query = new GetById.Request(id);
            var result = await sender.Send(query);
            return Results.Ok(result);
        }).RequireAuthorization(AppConstants.Authentication_Basic);
    }
}