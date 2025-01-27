namespace Application.Caching;

public class MemberCache
{
    readonly IDistributedCache _distributedCache;

    public MemberCache(IDistributedCache distributedCache)
    {
        _distributedCache = distributedCache;
    }

    public async Task<List<ParticipantWithFriendRequestAndContactInfo>> GetMembers(string conversationId)
    {
        var memberCacheData = await _distributedCache.GetStringAsync($"conversation-{conversationId}-members");
        return JsonConvert.DeserializeObject<List<ParticipantWithFriendRequestAndContactInfo>>(memberCacheData);
    }

    public async Task GetMembers(List<ConversationWithTotalUnseenWithContactInfo> conversations)
    {
        var tasks = conversations.Select(async conversation =>
        {
            var memberCacheData = await _distributedCache.GetStringAsync($"conversation-{conversation.Id}-members");
            conversation.Participants = JsonConvert.DeserializeObject<List<ParticipantWithFriendRequestAndContactInfo>>(memberCacheData);
        });
        await Task.WhenAll(tasks);
    }

    public async Task AddMembers(string conversationId, List<ParticipantWithFriendRequestAndContactInfo> participants)
    {
        var memberCacheData = await _distributedCache.GetStringAsync($"conversation-{conversationId}-members");
        var members = JsonConvert.DeserializeObject<List<ParticipantWithFriendRequestAndContactInfo>>(memberCacheData) ?? [];
        members.AddRange(participants);
        await _distributedCache.SetStringAsync($"conversation-{conversationId}-members", JsonConvert.SerializeObject(members));
    }

    public async Task UpdateMembers(string conversationId, string participantId, ParticipantWithFriendRequestAndContactInfo participant)
    {
        var memberCacheData = await _distributedCache.GetStringAsync($"conversation-{conversationId}-members");
        var members = JsonConvert.DeserializeObject<List<ParticipantWithFriendRequestAndContactInfo>>(memberCacheData) ?? [];
        var selected = members.SingleOrDefault(q => q.Id == participantId);
        selected = participant;
        await _distributedCache.SetStringAsync($"conversation-{conversationId}-members", JsonConvert.SerializeObject(members));
    }

    public async Task MemberSignout(List<string> conversationIds, string contactId)
    {
        var tasks = conversationIds.Select(async conversationId =>
        {
            var memberCacheData = await _distributedCache.GetStringAsync($"conversation-{conversationId}-members");
            var members = JsonConvert.DeserializeObject<List<ParticipantWithFriendRequestAndContactInfo>>(memberCacheData) ?? [];
            var selected = members.SingleOrDefault(q => q.Contact.Id == contactId);
            selected.Contact.IsOnline = false;
            await _distributedCache.SetStringAsync($"conversation-{conversationId}-members", JsonConvert.SerializeObject(members));
        });

        await Task.WhenAll(tasks);
    }

    public async Task MemberDelete(string conversationId, string contactId)
    {
        var memberCacheData = await _distributedCache.GetStringAsync($"conversation-{conversationId}-members");
        var members = JsonConvert.DeserializeObject<List<ParticipantWithFriendRequestAndContactInfo>>(memberCacheData) ?? [];
        var selected = members.SingleOrDefault(q => q.Contact.Id == contactId);
        selected.IsDeleted = true;
        await _distributedCache.SetStringAsync($"conversation-{conversationId}-members", JsonConvert.SerializeObject(members));
    }

    public async Task RemoveAll(List<string> conversationIds)
    {
        var tasks = new List<Task>();
        foreach (var id in conversationIds)
            tasks.Add(_distributedCache.RemoveAsync($"conversation-{id}-members"));

        await Task.WhenAll(tasks);
    }
}