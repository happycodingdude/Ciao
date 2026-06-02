namespace Application.Caching;

public class MemberCache
{
    readonly IRedisCaching _redisCaching;
    readonly IHttpContextAccessor _httpContextAccessor;
    readonly IMapper _mapper;

    public MemberCache(IRedisCaching redisCaching, IHttpContextAccessor httpContextAccessor, IMapper mapper)
    {
        _redisCaching = redisCaching;
        _httpContextAccessor = httpContextAccessor;
        _mapper = mapper;
    }

    private string UserId => _httpContextAccessor.HttpContext.Items["UserId"].ToString();

    // public async Task<List<MemberWithContactInfo>> GetMembers(string conversationId)
    // {
    //     var memberCacheData = await _redisCaching.GetAsync<>($"conversation-{conversationId}-members") ?? "";
    //     return JsonConvert.DeserializeObject<List<MemberWithContactInfo>>(memberCacheData);
    // }

    public async Task GetMembers(List<GetConversationsResponse> conversations)
    {
        var tasks = conversations.Select(async conversation =>
        {
            var members = await _redisCaching.GetAsync<List<MemberWithContactInfo>>(AppConstants.RedisKey_ConversationMembers.Replace("{conversationId}", conversation.Id)) ?? default;
            var selected = members.SingleOrDefault(q => q.Contact.Id == UserId);
            selected.IsSelected = false;
            await _redisCaching.SetAsync(AppConstants.RedisKey_ConversationMembers.Replace("{conversationId}", conversation.Id), members);

            conversation.Members = _mapper.Map<List<MemberWithContactInfoAndFriendRequest>>(members);
        });
        await Task.WhenAll(tasks);
    }

    public async Task<List<MemberWithContactInfo>> GetMembers(string conversationId)
    {
        return await _redisCaching.GetAsync<List<MemberWithContactInfo>>(AppConstants.RedisKey_ConversationMembers.Replace("{conversationId}", conversationId)) ?? default;
    }

    public async Task AddMembers(string conversationId, List<MemberWithContactInfo> membersToAdd)
    {
        var memberCacheData = await _redisCaching.GetAsync<List<MemberWithContactInfo>>(AppConstants.RedisKey_ConversationMembers.Replace("{conversationId}", conversationId)) ?? default;
        memberCacheData.AddRange(membersToAdd);
        await _redisCaching.SetAsync(AppConstants.RedisKey_ConversationMembers.Replace("{conversationId}", conversationId), memberCacheData);
    }

    public async Task UpdateMembers(string conversationId, List<MemberWithContactInfo> newMembers)
    {
        await _redisCaching.SetAsync(AppConstants.RedisKey_ConversationMembers.Replace("{conversationId}", conversationId), newMembers);
    }

    public async Task ResetSelected(string[] conversationIds)
    {
        var tasks = conversationIds.Select(async conversationId =>
        {
            var memberCacheData = await _redisCaching.GetAsync<List<MemberWithContactInfo>>(AppConstants.RedisKey_ConversationMembers.Replace("{conversationId}", conversationId)) ?? default;
            var selected = memberCacheData.SingleOrDefault(q => q.Contact.Id == UserId);
            selected.IsSelected = false;
            await _redisCaching.SetAsync(AppConstants.RedisKey_ConversationMembers.Replace("{conversationId}", conversationId), memberCacheData);
        });
        await Task.WhenAll(tasks);
    }

    public async Task MemberSeenAll(string conversationId, DateTime time, string? messageId = null)
    {
        // Invariant: tại 1 thời điểm, mỗi user CHỈ có IsSelected=true ở 1 conversation duy nhất
        // (conversation đang được mở trên UI). Khi chọn conversation mới, phải reset IsSelected=false
        // ở TẤT CẢ conversation khác để giữ invariant này.
        // Pattern: set IsSelected=true cho conversation hiện tại → fan-out reset cho các conversation còn lại.
        //
        // Idempotency:
        //  - Chỉ update LastSeenTime nếu time MỚI hơn giá trị hiện có → tránh lùi state khi multi-tab/multi-device gửi event out-of-order.
        //  - Read implies delivered → đồng thời nâng LastDeliveredTime/LastDeliveredMessageId nếu chưa có hoặc cũ hơn.
        // Note: cache là source-of-cache, không phải source-of-truth (Mongo mới là). Nếu cache lỡ ghi đè do race
        // (Get → mutate → Set không nguyên tử), Mongo vẫn đúng và cache sẽ healed khi user re-login.
        var memberCacheData = await _redisCaching.GetAsync<List<MemberWithContactInfo>>(AppConstants.RedisKey_ConversationMembers.Replace("{conversationId}", conversationId)) ?? default;
        var selected = memberCacheData.SingleOrDefault(q => q.Contact.Id == UserId);
        if (selected is not null)
        {
            if (selected.LastSeenTime is null || selected.LastSeenTime < time)
                selected.LastSeenTime = time;

            if (selected.LastDeliveredTime is null || selected.LastDeliveredTime < time)
            {
                selected.LastDeliveredTime = time;
                if (!string.IsNullOrEmpty(messageId))
                    selected.LastDeliveredMessageId = messageId;
            }

            selected.IsSelected = true;
        }
        await _redisCaching.SetAsync(AppConstants.RedisKey_ConversationMembers.Replace("{conversationId}", conversationId), memberCacheData);

        var conversationCacheData = await _redisCaching.GetAsync<string[]>(AppConstants.RedisKey_UserConversations.Replace("{userId}", UserId)) ?? default;
        var otherConversationIds = conversationCacheData.Where(q => q != conversationId).ToArray();
        await ResetSelected(otherConversationIds);
    }

    public async Task MemberDelivered(string conversationId, string messageId, DateTime deliveredTime)
    {
        // Cập nhật cache delivered horizon cho user hiện tại.
        // Idempotent ở app layer: chỉ update khi deliveredTime mới hơn LastDeliveredTime hiện có.
        // Race condition (Get → mutate → Set không nguyên tử) acceptable vì:
        //  - Mongo qua DataStoreConsumer.HandleMessageDelivered là source-of-truth (đã idempotent ở Mongo).
        //  - Cache có thể tạm sai vài giây, nhưng sẽ healed khi user re-login (HandleUserLogin nạp lại từ DB).
        var memberCacheData = await _redisCaching.GetAsync<List<MemberWithContactInfo>>(AppConstants.RedisKey_ConversationMembers.Replace("{conversationId}", conversationId)) ?? default;
        if (memberCacheData is null) return;

        var selected = memberCacheData.SingleOrDefault(q => q.Contact.Id == UserId);
        if (selected is null) return;
        if (selected.LastDeliveredTime is not null && selected.LastDeliveredTime >= deliveredTime) return;

        selected.LastDeliveredTime = deliveredTime;
        selected.LastDeliveredMessageId = messageId;
        await _redisCaching.SetAsync(AppConstants.RedisKey_ConversationMembers.Replace("{conversationId}", conversationId), memberCacheData);
    }

    public async Task MemberDelete(string conversationId, string userId)
    {
        var memberCacheData = await _redisCaching.GetAsync<List<MemberWithContactInfo>>(AppConstants.RedisKey_ConversationMembers.Replace("{conversationId}", conversationId)) ?? default;
        var selected = memberCacheData.SingleOrDefault(q => q.Contact.Id == userId);
        selected.IsDeleted = true;
        await _redisCaching.SetAsync(AppConstants.RedisKey_ConversationMembers.Replace("{conversationId}", conversationId), memberCacheData);
    }

    public async Task MemberReopen(string conversationId, string userId, DateTime timestamp)
    {
        var memberCacheData = await _redisCaching.GetAsync<List<MemberWithContactInfo>>(AppConstants.RedisKey_ConversationMembers.Replace("{conversationId}", conversationId)) ?? default;
        var selected = memberCacheData.SingleOrDefault(q => q.Contact.Id == userId);
        selected.IsDeleted = false;
        await _redisCaching.SetAsync(AppConstants.RedisKey_ConversationMembers.Replace("{conversationId}", conversationId), memberCacheData);

        // Update conversation info cache
        var conversationInfoCacheData = await _redisCaching.GetAsync<ConversationCacheModel>(AppConstants.RedisKey_ConversationInfo.Replace("{conversationId}", conversationId)) ?? default;
        conversationInfoCacheData.UpdatedTime = timestamp;
        await _redisCaching.SetAsync(AppConstants.RedisKey_ConversationInfo.Replace("{conversationId}", conversationId), conversationInfoCacheData);
    }

    public async Task MemberUpdateNotify(string conversationId, string userId, bool notify)
    {
        var memberCacheData = await _redisCaching.GetAsync<List<MemberWithContactInfo>>(AppConstants.RedisKey_ConversationMembers.Replace("{conversationId}", conversationId)) ?? default;
        var selected = memberCacheData.SingleOrDefault(q => q.Contact.Id == userId);
        selected.IsNotifying = notify;
        await _redisCaching.SetAsync(AppConstants.RedisKey_ConversationMembers.Replace("{conversationId}", conversationId), memberCacheData);
    }
}