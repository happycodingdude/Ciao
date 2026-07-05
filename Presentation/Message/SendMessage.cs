namespace Presentation.Messages;

public static class SendMessage
{
    public record Request(string conversationId, SendMessageReq model) : IRequest<SendMessageRes>;

    public class Validator : AbstractValidator<Request>
    {
        public Validator(IContactRepository contactRepository, IConversationRepository conversationRepository)
        {
            RuleFor(c => c.conversationId)
                .ContactRelatedToConversation(contactRepository, conversationRepository)
                .DependentRules(() =>
                {
                    RuleFor(c => c.model.Type)
                        .Must(q => q == AppConstants.MessageType_Text
                            || q == AppConstants.MessageType_Media
                            || q == AppConstants.MessageType_Sticker
                            || q == AppConstants.MessageType_Gif
                            || q == AppConstants.MessageType_Contact
                            || q == AppConstants.MessageType_Poll)
                        .WithMessage("Message type should be text, media, sticker, gif, contact or poll");

                    When(c => c.model.Type == AppConstants.MessageType_Text, () =>
                    {
                        RuleFor(c => c.model.Content).NotEmpty().WithMessage("Text message should have content");
                    });

                    // Sticker: Content = định danh sticker (đường dẫn asset built-in).
                    // Không cho gửi sticker rỗng để tránh tin trống + preview lỗi.
                    When(c => c.model.Type == AppConstants.MessageType_Sticker, () =>
                    {
                        RuleFor(c => c.model.Content).NotEmpty().WithMessage("Sticker message should have a sticker id");
                    });

                    // GIF: Content = url GIF (nguồn sẵn). Không cho gửi rỗng.
                    When(c => c.model.Type == AppConstants.MessageType_Gif, () =>
                    {
                        RuleFor(c => c.model.Content).NotEmpty().WithMessage("GIF message should have a gif url");
                    });

                    // Chia sẻ danh bạ: Content = tên (preview) + thẻ SharedContact hợp lệ (bắt buộc ContactId).
                    When(c => c.model.Type == AppConstants.MessageType_Contact, () =>
                    {
                        RuleFor(c => c.model.Content).NotEmpty().WithMessage("Contact message should have a display name");
                        RuleFor(c => c.model.SharedContact).NotNull().WithMessage("Contact message should have a shared contact");
                        RuleFor(c => c.model.SharedContact!.ContactId)
                            .NotEmpty().WithMessage("Shared contact should have a contactId")
                            .When(c => c.model.SharedContact != null);
                    });

                    // Bình chọn: Content = câu hỏi + tối thiểu 2 option, mỗi option có Key + Text, Key không trùng.
                    When(c => c.model.Type == AppConstants.MessageType_Poll, () =>
                    {
                        RuleFor(c => c.model.Content).NotEmpty().WithMessage("Poll message should have a question");
                        RuleFor(c => c.model.Poll).NotNull().WithMessage("Poll message should have poll data");
                        When(c => c.model.Poll != null, () =>
                        {
                            RuleFor(c => c.model.Poll!.Options)
                                .Must(o => o != null && o.Count >= 2).WithMessage("Poll should have at least 2 options")
                                .DependentRules(() =>
                                {
                                    RuleFor(c => c.model.Poll!.Options)
                                        .Must(o => o.All(x => !string.IsNullOrWhiteSpace(x.Key) && !string.IsNullOrWhiteSpace(x.Text)))
                                        .WithMessage("Each poll option should have a key and text");
                                    RuleFor(c => c.model.Poll!.Options)
                                        .Must(o => o.Select(x => x.Key).Distinct().Count() == o.Count)
                                        .WithMessage("Poll option keys should be unique");
                                });
                        });
                    });

                    When(c => c.model.Type == AppConstants.MessageType_Media, () =>
                    {
                        RuleFor(c => c.model.Attachments)
                            .NotEmpty().WithMessage("Media message should have attachments")
                            .DependentRules(() =>
                            {
                                RuleFor(c => c.model.Attachments.Select(q => q.Type))
                                    .Must(q => q.All(w => w == "image" || w == "file"))
                                    .WithMessage("Attachment type should be image or file");
                                RuleFor(c => c.model.Attachments.Select(q => q.MediaUrl))
                                    .Must(q => q.All(w => !string.IsNullOrEmpty(w)))
                                    .WithMessage("Attachment url should not be empty");
                                RuleFor(c => c.model.Attachments.Select(q => q.MediaName))
                                    .Must(q => q.All(w => !string.IsNullOrEmpty(w)))
                                    .WithMessage("Attachment name should not be empty");
                                RuleFor(c => c.model.Attachments.Select(q => q.MediaSize))
                                    .Must(q => q.All(w => w > 0))
                                    .WithMessage("Attachment size should not be 0");
                            });
                    });
                });
        }
    }

    internal sealed class Handler : IRequestHandler<Request, SendMessageRes>
    {
        readonly IValidator<Request> _validator;
        readonly IContactRepository _contactRepository;
        readonly IKafkaProducer _kafkaProducer;
        readonly IMapper _mapper;

        public Handler(IValidator<Request> validator, IContactRepository contactRepository, IKafkaProducer kafkaProducer, IMapper mapper)
        {
            _validator = validator;
            _contactRepository = contactRepository;
            _kafkaProducer = kafkaProducer;
            _mapper = mapper;
        }

        public async Task<SendMessageRes> Handle(Request request, CancellationToken cancellationToken)
        {
            var validationResult = await _validator.ValidateAsync(request, cancellationToken);
            if (!validationResult.IsValid)
                throw new BadRequestException(validationResult.ToString());

            var message = _mapper.Map<NewMessageModel_Message>(request.model);
            await _kafkaProducer.ProduceAsync(Topic.NewMessage, new NewMessageModel
            {
                UserId = _contactRepository.GetUserId(),
                ConversationId = request.conversationId,
                Message = message
            });

            return new SendMessageRes
            {
                MessageId = message.Id,
                Attachments = message.Attachments.Select(q => q.Id).ToArray()
            };
        }
    }
}

public class SendMessageEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiGroup_Conversation).MapPost("/{conversationId}/messages",
        async (ISender sender, string conversationId, SendMessageReq model) =>
        {
            var result = await sender.Send(new SendMessage.Request(conversationId, model));
            return Results.Ok(result);
        }).RequireAuthorization();
    }
}
