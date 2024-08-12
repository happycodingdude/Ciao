namespace Presentation.Messages;

public static class SendMessage
{
    public record Request(MessageDto model) : IRequest<Unit>;

    public class Validator : AbstractValidator<Request>
    {
        public Validator()
        {
            RuleFor(c => c.model.ConversationId).NotEmpty().WithMessage("Conversation should not be empty");
            RuleFor(c => c.model.Type).Must(q => q == "text" || q == "media").WithMessage("Message type should be text or media");

            When(c => c.model.Type == "text", () =>
            {
                RuleFor(c => c.model.Content).NotEmpty().WithMessage("Text message should have content");
            });
            When(c => c.model.Type == "media", () =>
            {
                RuleFor(c => c.model.Attachments).NotEmpty().WithMessage("Media message should have attachments")
                    .DependentRules(() =>
                    {
                        RuleFor(c => c.model.Attachments.Select(q => q.Type)).Must(q => q.All(w => w == "image" || w == "file")).WithMessage("Attachment type should be image or file");
                        RuleFor(c => c.model.Attachments.Select(q => q.MediaUrl)).Must(q => q.All(w => !string.IsNullOrEmpty(w))).WithMessage("Attachment url should not be empty");
                        RuleFor(c => c.model.Attachments.Select(q => q.MediaName)).Must(q => q.All(w => !string.IsNullOrEmpty(w))).WithMessage("Attachment name should not be empty");
                        RuleFor(c => c.model.Attachments.Select(q => q.MediaSize)).Must(q => q.All(w => w > 0)).WithMessage("Attachment size should not be 0");
                    });
            });
        }
    }

    internal sealed class Handler(IValidator<Request> validator, IUnitOfWork uow, IMapper mapper, INotificationMethod notificationMethod) : IRequestHandler<Request, Unit>
    {
        public async Task<Unit> Handle(Request request, CancellationToken cancellationToken)
        {
            var validationResult = validator.Validate(request);
            if (!validationResult.IsValid)
                throw new BadRequestException(validationResult.ToString());

            // // Add message
            var entity = mapper.Map<MessageDto, Message>(request.model);
            uow.Message.Add(entity);
            // Update UpdatedTime of conversation to popup as first item when reload
            var conversation = await uow.Conversation.GetByIdAsync(request.model.ConversationId);
            uow.Conversation.Update(conversation);

            await uow.SaveAsync();

            // When a message sent, all members of that group will be having that group conversation back
            await uow.Participant.DbSet.Where(q => q.ConversationId == request.model.ConversationId)
                .ExecuteUpdateAsync(q => q.SetProperty(w => w.IsDeleted, false));

            // Push message
            await notificationMethod.Notify(
                "NewMessage",
                uow.Participant
                    .GetByConversationId(request.model.ConversationId)
                    .Where(q => q.ContactId != request.model.ContactId)
                    .Select(q => q.ContactId.ToString())
                .ToArray(),
                mapper.Map<Message, MessageToNotify>(entity)
            );

            return Unit.Value;
        }
    }
}

public class SendMessageEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiRoute_Message).MapPost("/send",
        async (HttpContext context, ISender sender, MessageDto model) =>
        {
            model.ContactId = Guid.Parse(context.Session.GetString("UserId"));
            var query = new SendMessage.Request(model);
            await sender.Send(query);
            return Results.Ok();
        }).RequireAuthorization(AppConstants.Authentication_Basic);
    }
}