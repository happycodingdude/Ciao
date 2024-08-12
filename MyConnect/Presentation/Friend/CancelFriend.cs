namespace Presentation.Friends;

public static class CancelFriend
{
    public record Request(Guid id, Guid contactId) : IRequest<Unit>;

    public class Validator : AbstractValidator<Request>
    {
        readonly IUnitOfWork _uow;

        public Validator(IUnitOfWork uow)
        {
            _uow = uow;
            RuleFor(c => c.id).MustAsync((item, cancellation) => NotYetAccepted(item)).WithMessage("Friend request has been accepted");
            RuleFor(c => c).MustAsync((item, cancellation) => NotReceivedRequest(item)).WithMessage("Can not cancel received request");
        }

        private async Task<bool> NotYetAccepted(Guid id)
        {
            var sent = await _uow.Friend.GetByIdAsync(id);
            return !sent.AcceptTime.HasValue;
        }

        private async Task<bool> NotReceivedRequest(Request request)
        {
            var sent = await _uow.Friend.GetByIdAsync(request.id);
            return sent.ToContactId != request.contactId;
        }
    }

    internal sealed class Handler(IValidator<Request> validator, INotificationMethod notificationMethod, IUnitOfWork uow) : IRequestHandler<Request, Unit>
    {
        public async Task<Unit> Handle(Request request, CancellationToken cancellationToken)
        {
            var validationResult = validator.Validate(request);
            if (!validationResult.IsValid)
                throw new BadRequestException(validationResult.ToString());

            var entity = await uow.Friend.GetByIdAsync(request.id);
            uow.Friend.Delete(request.id);
            await uow.SaveAsync();

            // Push friend request            
            await notificationMethod.Notify(
               "CancelFriendRequest",
               new string[1] { entity.ToContactId.ToString() },
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
        async (HttpContext context, ISender sender, Guid id) =>
        {
            var userId = Guid.Parse(context.Session.GetString("UserId"));
            var query = new CancelFriend.Request(id, userId);
            await sender.Send(query);
            return Results.Ok();
        }).RequireAuthorization(AppConstants.Authentication_Basic);
    }
}