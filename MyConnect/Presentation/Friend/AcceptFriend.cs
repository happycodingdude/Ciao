namespace Presentation.Friends;

public static class AcceptFriend
{
    public record Request(string id, string userId) : IRequest<Unit>;

    public class Validator : AbstractValidator<Request>
    {
        readonly IUnitOfWork _uow;

        public Validator(IUnitOfWork uow)
        {
            _uow = uow;
            // RuleFor(c => c.patch.Operations.Count(q => q.path.ToLower() == nameof(GetAllFriend.Status).ToLower()))
            //     .Equal(1)
            //     .WithMessage("This is used for acceptance only 1");
            // RuleFor(c => c.patch.Operations
            //         .Where(q => q.path.ToLower() == nameof(GetAllFriend.Status).ToLower())
            //         .Select(q => q.value.ToString()))
            //     .Must(q => q.All(w => w == "accept"))
            //     .WithMessage("This is used for acceptance only 2");
            RuleFor(c => c.id).MustAsync((item, cancellation) => NotYetAccepted(item)).WithMessage("Friend request has been accepted");
            RuleFor(c => c).MustAsync((item, cancellation) => NotSelfAccept(item)).WithMessage("Can not self-accept");
        }

        private async Task<bool> NotYetAccepted(string id)
        {
            var sent = await _uow.Friend.GetItemAsync(MongoQuery.IdFilter<Friend>(id));
            return !sent.AcceptTime.HasValue;
        }

        private async Task<bool> NotSelfAccept(Request request)
        {
            var sent = await _uow.Friend.GetItemAsync(MongoQuery.IdFilter<Friend>(request.id));
            return sent.FromContact.ContactId != request.userId;
        }
    }

    internal sealed class Handler(IValidator<Request> validator, IUnitOfWork uow, INotificationMethod notificationMethod) : IRequestHandler<Request, Unit>
    {
        public async Task<Unit> Handle(Request request, CancellationToken cancellationToken)
        {
            var validationResult = validator.Validate(request);
            if (!validationResult.IsValid)
                throw new BadRequestException(validationResult.ToString());

            // var patchToUpdate = new CustomJsonPatchDocument[1]
            // {
            //     new CustomJsonPatchDocument("replace", nameof(FriendDto.AcceptTime), DateTime.Now.ToString())
            // };
            // var patch = JsonConvert.DeserializeObject<JsonPatchDocument>(JsonConvert.SerializeObject(patchToUpdate));
            // var response = await service.PatchAsync(request.id, patch);

            var filter = MongoQuery.IdFilter<Friend>(request.id);
            var entity = await uow.Friend.GetItemAsync(filter);
            if (entity.AcceptTime.HasValue) return Unit.Value;

            entity.AcceptTime = DateTime.Now;
            await uow.Friend.UpdateOneAsync(filter, entity);

            // Push friend request            
            await notificationMethod.Notify(
               "AcceptFriendRequest",
               new string[1] { entity.ToContact.ContactId },
               new FriendToNotify
               {
                   RequestId = request.id
               }
           );

            return Unit.Value;
        }
    }
}

public class AcceptFriendEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiRoute_Friend).MapPatch("{id}",
        async (HttpContext context, ISender sender, string id) =>
        {
            var userId = context.Session.GetString("UserId");
            var query = new AcceptFriend.Request(id, userId);
            await sender.Send(query);
            return Results.Ok();
        }).RequireAuthorization(AppConstants.Authentication_Basic);
    }
}