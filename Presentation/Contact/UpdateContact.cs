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
        readonly FriendCache _friendCache;
        readonly MemberCache _memberCache;
        readonly ConversationCache _conversationCache;
        readonly IFirebaseFunction _firebase;

        public Handler(IValidator<Request> validator,
            IContactRepository contactRepository,
            IConversationRepository conversationRepository,
            UserCache userCache,
            FriendCache friendCache,
            MemberCache memberCache,
            ConversationCache conversationCache,
            IFirebaseFunction firebase)
        {
            _validator = validator;
            _contactRepository = contactRepository;
            _conversationRepository = conversationRepository;
            _userCache = userCache;
            _friendCache = friendCache;
            _memberCache = memberCache;
            _conversationCache = conversationCache;
            _firebase = firebase;
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

            // Update cache (user-info của chính mình)
            var userToUpdate = user;
            userToUpdate.Name = request.model.Name;
            userToUpdate.Bio = request.model.Bio;
            userToUpdate.Avatar = request.model.Avatar;
            await _userCache.SetInfoAsync(userToUpdate);

            // Fan-out: tên/avatar/bio bị denormalize ở friend cache của người khác + member
            // cache mỗi conversation. Nếu không cập nhật, user khác vẫn thấy tên CŨ (vì các
            // surface đó đọc từ cache, không join lại Contact). Đồng thời push realtime để
            // app đang mở của họ patch ngay, không cần re-login.
            await PropagateProfile(user.Id, request.model.Name, request.model.Avatar, request.model.Bio);

            return Unit.Value;
        }

        async Task PropagateProfile(string userId, string name, string avatar, string bio)
        {
            var recipients = new HashSet<string>();

            // 1) Friend cache của từng người bạn: cập nhật entry trỏ tới mình (Contact.Id == userId).
            //    A's friend cache liệt kê bạn của A → mỗi bạn X có entry cho A trong cache của X.
            var myFriends = await _friendCache.GetFriends(userId);
            if (myFriends is not null)
                foreach (var f in myFriends)
                {
                    var friendUserId = f.Contact?.Id;
                    if (string.IsNullOrEmpty(friendUserId)) continue;
                    recipients.Add(friendUserId);

                    var theirFriends = await _friendCache.GetFriends(friendUserId);
                    var entry = theirFriends?.FirstOrDefault(x => x.Contact?.Id == userId);
                    if (entry is null) continue;
                    entry.Contact.Name = name;
                    entry.Contact.Avatar = avatar; // ContactInfo không có Bio
                    await _friendCache.SetFriends(friendUserId, theirFriends!);
                }

            // 2) Member cache mỗi conversation mình tham gia: cập nhật contact của chính mình.
            //    Direct-chat title FE lấy từ otherMember.contact.name nên việc này fix luôn title.
            var conversationIds = await _conversationCache.GetListConversationId(userId);
            if (conversationIds is not null)
                foreach (var conversationId in conversationIds)
                {
                    var members = await _memberCache.GetMembers(conversationId);
                    var me = members?.FirstOrDefault(m => m.Contact?.Id == userId);
                    if (me is null) continue;
                    me.Contact.Name = name;
                    me.Contact.Avatar = avatar;
                    me.Contact.Bio = bio;
                    await _memberCache.UpdateMembers(conversationId, members!);

                    foreach (var m in members!)
                        if (m.Contact?.Id is { } id && id != userId)
                            recipients.Add(id);
                }

            recipients.Remove(userId);
            if (recipients.Count == 0) return;

            // Sync-event (không bannerable) → FirebaseFunction tự gửi data-only.
            // Fire-and-forget: cache đã nhất quán, realtime fail thì user khác bù khi refetch/login.
            _ = _firebase.Notify(
                ChatEventNames.ContactUpdated,
                recipients.ToArray(),
                new EventContactUpdated
                {
                    ContactId = userId,
                    Name = name,
                    Avatar = avatar,
                    Bio = bio,
                });
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