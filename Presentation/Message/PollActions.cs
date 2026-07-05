namespace Presentation.Messages;

// Bỏ phiếu bình chọn. Fire-and-forget qua Kafka (giống react): persist atomic ở DataStoreConsumer.
public static class VotePoll
{
    public record Request(string conversationId, string id, string optionKey, bool allowMultiple) : IRequest<Unit>;

    public class Validator : AbstractValidator<Request>
    {
        public Validator(IContactRepository contactRepository, IConversationRepository conversationRepository)
        {
            RuleFor(c => c.conversationId).ContactRelatedToConversation(contactRepository, conversationRepository);
            RuleFor(c => c.optionKey).NotEmpty().WithMessage("optionKey is required");
        }
    }

    internal sealed class Handler : IRequestHandler<Request, Unit>
    {
        readonly IValidator<Request> _validator;
        readonly IContactRepository _contactRepository;
        readonly IKafkaProducer _kafkaProducer;

        public Handler(IValidator<Request> validator, IContactRepository contactRepository, IKafkaProducer kafkaProducer)
        {
            _validator = validator;
            _contactRepository = contactRepository;
            _kafkaProducer = kafkaProducer;
        }

        public async Task<Unit> Handle(Request request, CancellationToken cancellationToken)
        {
            var validationResult = await _validator.ValidateAsync(request, cancellationToken);
            if (!validationResult.IsValid)
                throw new BadRequestException(validationResult.ToString());

            await _kafkaProducer.ProduceAsync(Topic.PollVote, new PollVoteModel
            {
                UserId = _contactRepository.GetUserId(),
                ConversationId = request.conversationId,
                MessageId = request.id,
                OptionKey = request.optionKey,
                AllowMultiple = request.allowMultiple
            });

            return Unit.Value;
        }
    }
}

// Đóng bình chọn (chỉ người tạo poll — kiểm tra ở DataStoreConsumer qua filter ContactId).
public static class ClosePoll
{
    public record Request(string conversationId, string id) : IRequest<Unit>;

    public class Validator : AbstractValidator<Request>
    {
        public Validator(IContactRepository contactRepository, IConversationRepository conversationRepository)
        {
            RuleFor(c => c.conversationId).ContactRelatedToConversation(contactRepository, conversationRepository);
        }
    }

    internal sealed class Handler : IRequestHandler<Request, Unit>
    {
        readonly IValidator<Request> _validator;
        readonly IContactRepository _contactRepository;
        readonly IKafkaProducer _kafkaProducer;

        public Handler(IValidator<Request> validator, IContactRepository contactRepository, IKafkaProducer kafkaProducer)
        {
            _validator = validator;
            _contactRepository = contactRepository;
            _kafkaProducer = kafkaProducer;
        }

        public async Task<Unit> Handle(Request request, CancellationToken cancellationToken)
        {
            var validationResult = await _validator.ValidateAsync(request, cancellationToken);
            if (!validationResult.IsValid)
                throw new BadRequestException(validationResult.ToString());

            await _kafkaProducer.ProduceAsync(Topic.PollClose, new PollCloseModel
            {
                UserId = _contactRepository.GetUserId(),
                ConversationId = request.conversationId,
                MessageId = request.id
            });

            return Unit.Value;
        }
    }
}

public class PollActionsEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiGroup_Conversation).MapPut("{conversationId}/messages/{id}/poll/vote",
        async (ISender sender, string conversationId, string id, string optionKey, bool allowMultiple = false) =>
        {
            await sender.Send(new VotePoll.Request(conversationId, id, optionKey, allowMultiple));
            return Results.Ok();
        }).RequireAuthorization();

        app.MapGroup(AppConstants.ApiGroup_Conversation).MapPut("{conversationId}/messages/{id}/poll/close",
        async (ISender sender, string conversationId, string id) =>
        {
            await sender.Send(new ClosePoll.Request(conversationId, id));
            return Results.Ok();
        }).RequireAuthorization();
    }
}
