// namespace Presentation.Messages;

// public static class ReactMessage
// {
//     public record Request(string conversationId, string id, ReactMessageRequest model) : IRequest<Unit>;

//     public class Validator : AbstractValidator<Request>
//     {
//         readonly IContactRepository _contactRepository;
//         readonly IConversationRepository _conversationRepository;

//         public Validator(IServiceProvider serviceProvider)
//         {
//             using (var scope = serviceProvider.CreateScope())
//             {
//                 _contactRepository = scope.ServiceProvider.GetRequiredService<IContactRepository>();
//                 _conversationRepository = scope.ServiceProvider.GetRequiredService<IConversationRepository>();
//             }
//             RuleFor(c => c.conversationId).ContactRelatedToConversation(_contactRepository, _conversationRepository);
//         }
//     }

//     internal sealed class Handler : IRequestHandler<Request, Unit>
//     {
//         readonly IValidator<Request> _validator;
//         readonly IConversationRepository _conversationRepository;
//         readonly IContactRepository _contactRepository;

//         public Handler(IValidator<Request> validator,
//             IService<IConversationRepository> conversationService,
//             IService<IContactRepository> contactService)
//         {
//             _validator = validator;
//             _conversationRepository = conversationService.Get();
//             _contactRepository = contactService.Get();
//         }

//         public async Task<Unit> Handle(Request request, CancellationToken cancellationToken)
//         {
//             var validationResult = await _validator.ValidateAsync(request);
//             if (!validationResult.IsValid)
//                 throw new BadRequestException(validationResult.ToString());

//             var fieldsToUpdate = new Dictionary<string, bool?>
//             {
//                 { "Messages.$.Reactions.$[elem].IsLike", request.model.IsLike },
//                 { "Messages.$.Reactions.$[elem].IsLove", request.model.IsLove },
//                 { "Messages.$.Reactions.$[elem].IsCare", request.model.IsCare },
//                 { "Messages.$.Reactions.$[elem].IsWow", request.model.IsWow },
//                 { "Messages.$.Reactions.$[elem].IsSad", request.model.IsSad },
//                 { "Messages.$.Reactions.$[elem].IsAngry", request.model.IsAngry }
//             };
//             var updates = fieldsToUpdate
//                 .Where(field => field.Value.HasValue) // Only include non-null fields
//                 .Select(field => Builders<Conversation>.Update.Set(field.Key, field.Value.Value)) // Create update definitions
//                 .ToList();
//             if (!updates.Any()) return Unit.Value;

//             updates.Add(Builders<Conversation>.Update.Set("Messages.$.Reactions.$[elem].CurrentReaction", request.model.CurrentReaction));
//             // Ensure Reactions is an empty array if not present
//             var initializationFilter = Builders<Conversation>.Filter.And(
//                 Builders<Conversation>.Filter.Eq(c => c.Id, request.conversationId),
//                 Builders<Conversation>.Filter.ElemMatch(q => q.Messages,
//                     w => w.Id == request.id && (w.Reactions == null || !w.Reactions.Any()))
//             );
//             var initializeReactions = Builders<Conversation>.Update.Set(
//                 "Messages.$.Reactions",
//                 new List<MessageReaction>()
//             );
//             _conversationRepository.UpdateNoTrackingTime(initializationFilter, initializeReactions);

//             var key = Guid.NewGuid();
//             // Update if exists
//             var userId = _contactRepository.GetUserId();
//             var conversationFilter = Builders<Conversation>.Filter.And(
//                 Builders<Conversation>.Filter.Eq(c => c.Id, request.conversationId),
//                 Builders<Conversation>.Filter.ElemMatch(q => q.Messages, w => w.Id == request.id)
//             ); ;
//             var arrayFilter = new BsonDocumentArrayFilterDefinition<Conversation>(
//                 new BsonDocument("elem.ContactId", userId)
//                 );
//             _conversationRepository.Update(key, conversationFilter,
//                 Builders<Conversation>.Update.Combine(updates),
//                 arrayFilter);

//             // Fallback: add a new reaction if it doesn't exist
//             var fallbackFilter = Builders<Conversation>.Filter.And(
//                 Builders<Conversation>.Filter.Eq(c => c.Id, request.conversationId),
//                 Builders<Conversation>.Filter.ElemMatch(
//                     c => c.Messages,
//                     Builders<Message>.Filter.And(
//                         Builders<Message>.Filter.Eq(m => m.Id, request.id),
//                         Builders<Message>.Filter.Not(
//                             Builders<Message>.Filter.ElemMatch(m => m.Reactions, r => r.ContactId == userId)
//                         )
//                     )
//                 )
//             );
//             var create = Builders<Conversation>.Update.Push(
//                 "Messages.$.Reactions",
//                 new MessageReaction
//                 {
//                     ContactId = userId,
//                     CurrentReaction = request.model.CurrentReaction,
//                     IsLike = request.model.IsLike ?? false,
//                     IsLove = request.model.IsLove ?? false,
//                     IsCare = request.model.IsCare ?? false,
//                     IsWow = request.model.IsWow ?? false,
//                     IsSad = request.model.IsSad ?? false,
//                     IsAngry = request.model.IsAngry ?? false
//                 }
//             );
//             _conversationRepository.AddFallback(key, fallbackFilter, create);

//             return Unit.Value;
//         }
//     }
// }

// public class ReactMessageEndpoint : ICarterModule
// {
//     public void AddRoutes(IEndpointRouteBuilder app)
//     {
//         app.MapGroup(AppConstants.ApiRoute_Conversation).MapPut("{conversationId}/messages/{id}/react",
//         async (ISender sender, string conversationId, string id, ReactMessageRequest model) =>
//         {
//             var query = new ReactMessage.Request(conversationId, id, model);
//             await sender.Send(query);
//             return Results.Ok();
//         }).RequireAuthorization(AppConstants.Authentication_Basic);
//     }
// }