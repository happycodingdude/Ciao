namespace Presentation.Contacts;

public static class UpdateContact
{
    public record Request(Contact model) : IRequest<Unit>;

    public class Validator : AbstractValidator<Request>
    {
        public Validator()
        {
            RuleFor(c => c.model.Name).NotEmpty().WithMessage("Name should not be empty");
        }
    }

    internal sealed class Handler : IRequestHandler<Request, Unit>
    {
        readonly IValidator<Request> _validator;
        readonly IContactRepository _contactRepository;
        readonly IConversationRepository _conversationRepository;
        readonly UserCache _userCache;

        public Handler(IValidator<Request> validator,
            IContactRepository contactRepository,
            IConversationRepository conversationRepository,
            UserCache userCache)
        {
            _validator = validator;
            _contactRepository = contactRepository;
            _conversationRepository = conversationRepository;
            _userCache = userCache;
        }

        public async Task<Unit> Handle(Request request, CancellationToken cancellationToken)
        {
            var validationResult = _validator.Validate(request);
            if (!validationResult.IsValid)
                throw new BadRequestException(validationResult.ToString());

            var user = await _contactRepository.GetInfoAsync();

            // Update contact info
            var filter = MongoQuery<Contact>.IdFilter(user.Id);
            var updates = Builders<Contact>.Update
                .Set(q => q.Name, request.model.Name)
                .Set(q => q.Bio, request.model.Bio)
                .Set(q => q.Avatar, request.model.Avatar);
            _contactRepository.Update(filter, updates);

            // Update contact info in conversation
            // var conversationFilter = Builders<Conversation>.Filter.Eq("Participants.Contact._id", user.Id);
            // var conversationUpdates = Builders<Conversation>.Update
            //     .Set("Participants.$[elem].Contact.Name", request.model.Name)
            //     .Set("Participants.$[elem].Contact.Avatar", request.model.Avatar);
            // var arrayFilter = new BsonDocumentArrayFilterDefinition<Conversation>(
            //     new BsonDocument("elem.Contact._id", user.Id)
            //     );
            // _conversationRepository.UpdateNoTrackingTime(conversationFilter, conversationUpdates, arrayFilter);

            // Update cache
            var userToUpdate = user;
            userToUpdate.Name = request.model.Name;
            userToUpdate.Bio = request.model.Bio;
            userToUpdate.Avatar = request.model.Avatar;
            _userCache.SetInfo(userToUpdate);

            return Unit.Value;
        }
    }
}

public class UpdateContactEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiGroup_Contact).MapPut("",
        async (ISender sender, Contact model) =>
        {
            var query = new UpdateContact.Request(model);
            await sender.Send(query);
            return Results.Ok();
        }).RequireAuthorization();
    }
}