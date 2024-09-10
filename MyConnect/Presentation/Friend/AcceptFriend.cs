namespace Presentation.Friends;

public static class AcceptFriend
{
    public record Request(string id, string userId) : IRequest<Unit>;

    public class Validator : AbstractValidator<Request>
    {
        readonly IFriendRepository _friendRepository;

        public Validator(IServiceScopeFactory scopeFactory)
        {
            using (var scope = scopeFactory.CreateScope())
            {
                _friendRepository = scope.ServiceProvider.GetService<IFriendRepository>();
            }
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
            var sent = await _friendRepository.GetItemAsync(MongoQuery.IdFilter<Friend>(id));
            return !sent.AcceptTime.HasValue;
        }

        private async Task<bool> NotSelfAccept(Request request)
        {
            var sent = await _friendRepository.GetItemAsync(MongoQuery.IdFilter<Friend>(request.id));
            return sent.FromContact.ContactId != request.userId;
        }
    }

    internal sealed class Handler : IRequestHandler<Request, Unit>
    {
        private readonly IValidator<Request> validator;
        private readonly INotificationMethod notificationMethod;
        private readonly IUnitOfWork uow;
        private readonly IFriendRepository friendRepository;

        public Handler(IValidator<Request> validator, INotificationMethod notificationMethod, IUnitOfWork uow, IServiceScopeFactory scopeFactory)
        {
            this.validator = validator;
            this.notificationMethod = notificationMethod;
            this.uow = uow;
            using (var scope = scopeFactory.CreateScope())
            {
                friendRepository = scope.ServiceProvider.GetService<IFriendRepository>();
            }
        }

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
            var entity = await friendRepository.GetItemAsync(filter);
            if (entity.AcceptTime.HasValue) return Unit.Value;

            entity.AcceptTime = DateTime.Now;
            friendRepository.UpdateOne(filter, entity);
            await uow.SaveAsync();

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