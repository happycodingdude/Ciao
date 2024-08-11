using Shared.Configurations;

namespace Presentation.Friends;

public static class UpdateFriend
{
    public class Query : IRequest<Unit>
    {
        public Guid Id { get; set; }
        public Guid ContactId { get; set; }
        public JsonPatchDocument Patch { get; set; }
    }

    public class Validator : AbstractValidator<Query>
    {
        readonly IUnitOfWork _uow;

        public Validator(IUnitOfWork uow)
        {
            _uow = uow;
            RuleFor(c => c.Patch.Operations.Count(q => q.path.ToLower() == nameof(GetAllFriend.Status).ToLower()))
                .Equal(1)
                .WithMessage("This is used for acceptance only 1");
            RuleFor(c => c.Patch.Operations
                    .Where(q => q.path.ToLower() == nameof(GetAllFriend.Status).ToLower())
                    .Select(q => q.value.ToString()))
                .Must(q => q.All(w => w == "accept"))
                .WithMessage("This is used for acceptance only 2");
            RuleFor(c => c.Id).MustAsync((item, cancellation) => NotYetAccepted(item)).WithMessage("Friend request has been accepted");
            RuleFor(c => c).MustAsync((item, cancellation) => NotSelfAccept(item)).WithMessage("Can not self-accept");
        }

        private async Task<bool> NotYetAccepted(Guid id)
        {
            var sent = await _uow.Friend.GetByIdAsync(id);
            return !sent.AcceptTime.HasValue;
        }

        private async Task<bool> NotSelfAccept(Query request)
        {
            var sent = await _uow.Friend.GetByIdAsync(request.Id);
            return sent.FromContactId != request.ContactId;
        }
    }

    internal sealed class Handler : IRequestHandler<Query, Unit>
    {
        private readonly IFriendService _service;
        private readonly IValidator<Query> _validator;
        private readonly INotificationMethod _notificationMethod;


        public Handler(IFriendService service, IValidator<Query> validator, INotificationMethod notificationMethod)
        {
            _service = service;
            _validator = validator;
            _notificationMethod = notificationMethod;
        }

        public async Task<Unit> Handle(Query request, CancellationToken cancellationToken)
        {
            var validationResult = _validator.Validate(request);
            if (!validationResult.IsValid)
                throw new BadRequestException(validationResult.ToString());

            var patchToUpdate = new CustomJsonPatchDocument[1]
            {
                new CustomJsonPatchDocument("replace", nameof(FriendDto.AcceptTime), DateTime.Now.ToString())
            };
            // Console.WriteLine($"patchToUpdate => {JsonConvert.SerializeObject(patchToUpdate)}");
            var patch = JsonConvert.DeserializeObject<JsonPatchDocument>(JsonConvert.SerializeObject(patchToUpdate));
            var response = await _service.PatchAsync(request.Id, patch);

            // Push friend request            
            await _notificationMethod.Notify(
               "AcceptFriendRequest",
               new string[1] { response.ToContactId.ToString() },
               new FriendToNotify
               {
                   RequestId = request.Id
               }
           );

            return Unit.Value;
        }
    }
}

public class UpdateFriendEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiRoute_Friend).MapPatch("{id}",
        async (HttpContext context, ISender sender, Guid id, JsonElement jsonElement) =>
        {
            var userId = Guid.Parse(context.Session.GetString("UserId"));
            var json = jsonElement.GetRawText();
            var patch = JsonConvert.DeserializeObject<JsonPatchDocument>(json);
            var query = new UpdateFriend.Query
            {
                Id = id,
                ContactId = userId,
                Patch = patch
            };
            await sender.Send(query);
            return Results.Ok();
        }).RequireAuthorization(AppConstants.Authentication_Basic);
    }
}