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
            var members = await _redisCaching.GetAsync<List<MemberWithContactInfo>>($"conversation-{conversation.Id}-members") ?? default;
            var selected = members.SingleOrDefault(q => q.Contact.Id == UserId);
            selected.IsSelected = false;
            await _redisCaching.SetAsync($"conversation-{conversation.Id}-members", members);

            conversation.Members = _mapper.Map<List<MemberWithContactInfoAndFriendRequest>>(members);
        });
        await Task.WhenAll(tasks);
    }

    public async Task<List<MemberWithContactInfo>> GetMembers(string conversationId)
    {
        var memberCacheData = await _redisCaching.GetAsync<List<MemberWithContactInfo>>($"conversation-{conversationId}-members") ?? default;
        return memberCacheData;
    }

    public async Task AddMembers(string conversationId, List<MemberWithContactInfo> membersToAdd)
    {
        var memberCacheData = await _redisCaching.GetAsync<List<MemberWithContactInfo>>($"conversation-{conversationId}-members") ?? default;
        memberCacheData.AddRange(membersToAdd);
        await _redisCaching.SetAsync($"conversation-{conversationId}-members", memberCacheData);
    }

    public async Task UpdateMembers(string conversationId, List<MemberWithContactInfo> newMembers)
    {
        await _redisCaching.SetAsync($"conversation-{conversationId}-members", newMembers);
    }

    public async Task ResetSelected(string[] conversationIds)
    {
        var tasks = conversationIds.Select(async conversationId =>
        {
            var memberCacheData = await _redisCaching.GetAsync<List<MemberWithContactInfo>>($"conversation-{conversationId}-members") ?? default;
            var selected = memberCacheData.SingleOrDefault(q => q.Contact.Id == UserId);
            selected.IsSelected = false;
            await _redisCaching.SetAsync($"conversation-{conversationId}-members", memberCacheData);
        });
        await Task.WhenAll(tasks);
    }

    public async Task MemberSeenAll(string conversationId, DateTime time)
    {
        // Set last seen time and selected
        var memberCacheData = await _redisCaching.GetAsync<List<MemberWithContactInfo>>($"conversation-{conversationId}-members") ?? default;
        var selected = memberCacheData.SingleOrDefault(q => q.Contact.Id == UserId);
        selected.LastSeenTime = time;
        selected.IsSelected = true;
        await _redisCaching.SetAsync($"conversation-{conversationId}-members", memberCacheData);

        // Remove previous selected        
        var conversationCacheData = await _redisCaching.GetAsync<string[]>($"user-{UserId}-conversations") ?? default;
        var otherConversationIds = conversationCacheData.Where(q => q != conversationId).ToArray();
        await ResetSelected(otherConversationIds);
    }

    public async Task MemberDelete(string conversationId, string userId)
    {
        var memberCacheData = await _redisCaching.GetAsync<List<MemberWithContactInfo>>($"conversation-{conversationId}-members") ?? default;
        var selected = memberCacheData.SingleOrDefault(q => q.Contact.Id == userId);
        selected.IsDeleted = true;
        await _redisCaching.SetAsync($"conversation-{conversationId}-members", memberCacheData);
    }

    public async Task MemberReopen(string conversationId, string userId, DateTime timestamp)
    {
        var memberCacheData = await _redisCaching.GetAsync<List<MemberWithContactInfo>>($"conversation-{conversationId}-members") ?? default;
        var selected = memberCacheData.SingleOrDefault(q => q.Contact.Id == userId);
        selected.IsDeleted = false;
        await _redisCaching.SetAsync($"conversation-{conversationId}-members", memberCacheData);

        // Update conversation info cache
        var conversationInfoCacheData = await _redisCaching.GetAsync<ConversationCacheModel>($"conversation-{conversationId}-info") ?? default;
        conversationInfoCacheData.UpdatedTime = timestamp;
        await _redisCaching.SetAsync($"conversation-{conversationId}-info", conversationInfoCacheData);
    }

    public async Task MemberUpdateNotify(string conversationId, string userId, bool notify)
    {
        var memberCacheData = await _redisCaching.GetAsync<List<MemberWithContactInfo>>($"conversation-{conversationId}-members") ?? default;
        var selected = memberCacheData.SingleOrDefault(q => q.Contact.Id == userId);
        selected.IsNotifying = notify;
        await _redisCaching.SetAsync($"conversation-{conversationId}-members", memberCacheData);
    }
}