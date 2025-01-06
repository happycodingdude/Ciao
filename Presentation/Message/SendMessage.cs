namespace Presentation.Messages;

public static class SendMessage
{
    public record Request(string conversationId, Message model) : IRequest<string>;

    public class Validator : AbstractValidator<Request>
    {
        readonly IContactRepository _contactRepository;
        readonly IConversationRepository _conversationRepository;

        public Validator(IServiceProvider serviceProvider)
        {
            using (var scope = serviceProvider.CreateScope())
            {
                _contactRepository = scope.ServiceProvider.GetRequiredService<IContactRepository>();
                _conversationRepository = scope.ServiceProvider.GetRequiredService<IConversationRepository>();
            }
            RuleFor(c => c.conversationId).ContactRelatedToConversation(_contactRepository, _conversationRepository).DependentRules(() =>
            {
                RuleFor(c => c.conversationId).NotEmpty().WithMessage("Conversation should not be empty");
                RuleFor(c => c.model.Type).Must(q => q == "text" || q == "media").WithMessage("Message type should be text or media");

                When(c => c.model.Type == "text", () =>
                {
                    RuleFor(c => c.model.Content).NotEmpty().WithMessage("Text message should have content");
                    //RuleFor(c => c.model.Attachments).Empty().WithMessage("Text message should not have attachments");
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
            });
        }
    }

    internal sealed class Handler : IRequestHandler<Request, string>
    {
        readonly IValidator<Request> _validator;
        readonly INotificationMethod _notificationMethod;
        readonly IMapper _mapper;
        readonly IConversationRepository _conversationRepository;
        readonly IContactRepository _contactRepository;
        readonly IDistributedCache _distributedCache;


        public Handler(IValidator<Request> validator,
            INotificationMethod notificationMethod,
            IMapper mapper,
            IConversationRepository conversationRepository,
            IContactRepository contactRepository,
            IDistributedCache distributedCache)
        {
            _validator = validator;
            _notificationMethod = notificationMethod;
            _mapper = mapper;
            _conversationRepository = conversationRepository;
            _contactRepository = contactRepository;
            _distributedCache = distributedCache;
        }

        public async Task<string> Handle(Request request, CancellationToken cancellationToken)
        {
            var validationResult = await _validator.ValidateAsync(request);
            if (!validationResult.IsValid)
                throw new BadRequestException(validationResult.ToString());

            // Get current conversation
            var filter = MongoQuery<Conversation>.IdFilter(request.conversationId);
            var conversation = await _conversationRepository.GetItemAsync(filter);
            // Prepare message
            var user = await _contactRepository.GetInfoAsync();
            var message = request.model;
            message.ContactId = user.Id;
            if (message.Type == "media")
                message.Content = null;
            conversation.Messages.Add(message);

            // When a message sent, all members of that group will be having that group conversation back
            // if contain any member has deleted the conversation
            foreach (var participant in conversation.Participants.Where(q => q.IsDeleted))
                participant.IsDeleted = false;

            // Update user infor in case changes
            conversation.Participants.SingleOrDefault(q => q.Contact.Id == user.Id).Contact.Name = user.Name;
            conversation.Participants.SingleOrDefault(q => q.Contact.Id == user.Id).Contact.Avatar = user.Avatar;
            conversation.Participants.SingleOrDefault(q => q.Contact.Id == user.Id).Contact.IsOnline = user.IsOnline;

            // Update conversation
            _conversationRepository.Replace(filter, conversation);

            // Update cache
            var cachedData = await _distributedCache.GetStringAsync($"conversations-{user.Id}");
            var conversations = JsonConvert.DeserializeObject<IEnumerable<ConversationWithTotalUnseen>>(cachedData);
            var selectedConversation = conversations.SingleOrDefault(q => q.Id == conversation.Id);
            selectedConversation.LastMessageId = message.Id;
            selectedConversation.LastMessage = message.Type == "text" ? message.Content : string.Join(",", message.Attachments.Select(q => q.MediaName));
            selectedConversation.LastMessageTime = message.CreatedTime;
            selectedConversation.LastMessageContact = user.Id;
            selectedConversation.Messages = _mapper.Map<List<MessageWithReactions>>(conversation.Messages);
            await _distributedCache.SetStringAsync($"conversations-{user.Id}", JsonConvert.SerializeObject(conversations));

            // Push message            
            var notify = _mapper.Map<MessageToNotify>(message);
            notify.Conversation = _mapper.Map<ConversationToNotify>(conversation);
            notify.Contact = _mapper.Map<MessageToNotify_Contact>(user);
            _ = _notificationMethod.Notify(
                "NewMessage",
                conversation.Participants
                    .Where(q => q.Contact.Id != user.Id)
                    .Select(q => q.Contact.Id)
                .ToArray(),
                notify
            );

            return message.Id;
        }
    }
}

public class SendMessageEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiGroup_Conversation).MapPost("/{conversationId}/messages",
        async (ISender sender, string conversationId, Message model) =>
        {
            var query = new SendMessage.Request(conversationId, model);
            var result = await sender.Send(query);
            return Results.Ok(result);
        }).RequireAuthorization();
    }
}