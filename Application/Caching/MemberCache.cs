namespace Application.Caching;

public class MemberCache
{
    readonly IDistributedCache _distributedCache;
    readonly IHttpContextAccessor _httpContextAccessor;

    public MemberCache(IDistributedCache distributedCache, IHttpContextAccessor httpContextAccessor)
    {
        _distributedCache = distributedCache;
        _httpContextAccessor = httpContextAccessor;
    }

    private string UserId => _httpContextAccessor.HttpContext.Items["UserId"].ToString();

    // public async Task<List<MemberWithFriendRequestAndContactInfo>> GetMembers(string conversationId)
    // {
    //     var memberCacheData = await _distributedCache.GetStringAsync($"conversation-{conversationId}-members") ?? "";
    //     return JsonConvert.DeserializeObject<List<MemberWithFriendRequestAndContactInfo>>(memberCacheData);
    // }

    public async Task GetMembers(List<ConversationWithTotalUnseenWithContactInfoAndNoMessage> conversations)
    {
        var tasks = conversations.Select(async conversation =>
        {
            var memberCacheData = await _distributedCache.GetStringAsync($"conversation-{conversation.Id}-members") ?? "";
            conversation.Members = JsonConvert.DeserializeObject<List<MemberWithFriendRequestAndContactInfo>>(memberCacheData);
        });
        await Task.WhenAll(tasks);
    }

    public async Task<List<MemberWithFriendRequestAndContactInfo>> GetMembers(string conversationId)
    {
        var memberCacheData = await _distributedCache.GetStringAsync($"conversation-{conversationId}-members") ?? "";
        return JsonConvert.DeserializeObject<List<MemberWithFriendRequestAndContactInfo>>(memberCacheData);
    }

    public async Task AddMembers(string conversationId, List<MemberWithFriendRequestAndContactInfo> membersToAdd)
    {
        var memberCacheData = await _distributedCache.GetStringAsync($"conversation-{conversationId}-members") ?? "";
        var members = JsonConvert.DeserializeObject<List<MemberWithFriendRequestAndContactInfo>>(memberCacheData) ?? [];
        members.AddRange(membersToAdd);
        await _distributedCache.SetStringAsync($"conversation-{conversationId}-members", JsonConvert.SerializeObject(members));
    }

    public async Task UpdateMembers(string conversationId, List<MemberWithFriendRequestAndContactInfo> newMembers)
    {
        await _distributedCache.SetStringAsync($"conversation-{conversationId}-members", JsonConvert.SerializeObject(newMembers));
    }

    // public async Task MemberSignout()
    // {
    //     // Query list conversation cache
    //     var conversationCacheData = await _distributedCache.GetStringAsync($"user-{UserId}-conversations") ?? "";
    //     var conversationIds = JsonConvert.DeserializeObject<List<string>>(conversationCacheData) ?? [];
    //     var tasks = conversationIds.Select(async conversationId =>
    //     {
    //         var memberCacheData = await _distributedCache.GetStringAsync($"conversation-{conversationId}-members") ?? "";
    //         var members = JsonConvert.DeserializeObject<List<MemberWithFriendRequestAndContactInfo>>(memberCacheData) ?? [];
    //         var selected = members.SingleOrDefault(q => q.Contact.Id == UserId);
    //         selected.Contact.IsOnline = false;
    //         await _distributedCache.SetStringAsync($"conversation-{conversationId}-members", JsonConvert.SerializeObject(members));
    //     });

    //     await Task.WhenAll(tasks);
    // }

    public async Task MemberDelete(string conversationId, string contactId)
    {
        var memberCacheData = await _distributedCache.GetStringAsync($"conversation-{conversationId}-members") ?? "";
        var members = JsonConvert.DeserializeObject<List<MemberWithFriendRequestAndContactInfo>>(memberCacheData) ?? [];
        var selected = members.SingleOrDefault(q => q.Contact.Id == contactId);
        selected.IsDeleted = true;
        await _distributedCache.SetStringAsync($"conversation-{conversationId}-members", JsonConvert.SerializeObject(members));
    }

    public async Task MemberReopen(string conversationId, string contactId, DateTime timestamp)
    {
        var memberCacheData = await _distributedCache.GetStringAsync($"conversation-{conversationId}-members") ?? "";
        var members = JsonConvert.DeserializeObject<List<MemberWithFriendRequestAndContactInfo>>(memberCacheData) ?? [];
        var selected = members.SingleOrDefault(q => q.Contact.Id == contactId);
        selected.IsDeleted = false;
        await _distributedCache.SetStringAsync($"conversation-{conversationId}-members", JsonConvert.SerializeObject(members));

        // Update conversation info cache
        var conversationInfoCacheData = await _distributedCache.GetStringAsync($"conversation-{conversationId}-info") ?? "";
        var conversationInfo = JsonConvert.DeserializeObject<ConversationCacheModel>(conversationInfoCacheData);
        conversationInfo.UpdatedTime = timestamp;
        await _distributedCache.SetStringAsync($"conversation-{conversationId}-info", JsonConvert.SerializeObject(conversationInfo));
    }

    public async Task MemberUpdateNotify(string conversationId, string contactId, bool notify)
    {
        var memberCacheData = await _distributedCache.GetStringAsync($"conversation-{conversationId}-members") ?? "";
        var members = JsonConvert.DeserializeObject<List<MemberWithFriendRequestAndContactInfo>>(memberCacheData) ?? [];
        var selected = members.SingleOrDefault(q => q.Contact.Id == contactId);
        selected.IsNotifying = notify;
        await _distributedCache.SetStringAsync($"conversation-{conversationId}-members", JsonConvert.SerializeObject(members));
    }

    // public async Task RemoveAll(List<string> conversationIds)
    // {
    //     var tasks = new List<Task>();
    //     foreach (var id in conversationIds)
    //         tasks.Add(_distributedCache.RemoveAsync($"conversation-{id}-members"));

    //     await Task.WhenAll(tasks);
    // }
}