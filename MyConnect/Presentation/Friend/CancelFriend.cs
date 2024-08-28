namespace Presentation.Friends;

public static class CancelFriend
{
    public record Request(string id, Guid contactId) : IRequest<Unit>;

    public class Validator : AbstractValidator<Request>
    {
        readonly IUnitOfWork _uow;

        public Validator(IUnitOfWork uow)
        {
            _uow = uow;
            RuleFor(c => c.id).MustAsync((item, cancellation) => NotYetAccepted(item)).WithMessage("Friend request has been accepted");
            RuleFor(c => c).MustAsync((item, cancellation) => NotReceivedRequest(item)).WithMessage("Can not cancel received request");
        }

        private async Task<bool> NotYetAccepted(string id)
        {
            var sent = await _uow.Friend.GetItemAsync(d => d.Id == id);
            return !sent.AcceptTime.HasValue;
        }

        private async Task<bool> NotReceivedRequest(Request request)
        {
            var sent = await _uow.Friend.GetItemAsync(d => d.Id == request.id);
            return sent.ToContact.ContactId != request.contactId.ToString();
        }
    }

    internal sealed class Handler(IValidator<Request> validator, INotificationMethod notificationMethod, IUnitOfWork uow) : IRequestHandler<Request, Unit>
    {
        public async Task<Unit> Handle(Request request, CancellationToken cancellationToken)
        {
            var validationResult = validator.Validate(request);
            if (!validationResult.IsValid)
                throw new BadRequestException(validationResult.ToString());

            var entity = await uow.Friend.GetItemAsync(d => d.Id == request.id);
            await uow.Friend.DeleteAsync(q => q.Id == request.id);

            // Push friend request            
            await notificationMethod.Notify(
               "CancelFriendRequest",
               new string[1] { entity.ToContact.ContactId.ToString() },
               new FriendToNotify
               {
                   RequestId = request.id
               }
           );

            return Unit.Value;
        }
    }
}

public class CancelFriendEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiRoute_Friend).MapDelete("{id}",
        async (HttpContext context, ISender sender, string id) =>
        {
            var userId = Guid.Parse(context.Session.GetString("UserId"));
            var query = new CancelFriend.Request(id, userId);
            await sender.Send(query);
            return Results.Ok();
        }).RequireAuthorization(AppConstants.Authentication_Basic);
    }
}