namespace Application.Notifications;

public class SignalHub : Hub
{
    readonly UserCache _userCache;
    readonly ConversationCache _conversationCache;
    readonly ILogger _logger;

    public SignalHub(UserCache userCache, ConversationCache conversationCache, ILogger logger)
    {
        _userCache = userCache;
        _conversationCache = conversationCache;
        _logger = logger;
    }

    public override async Task OnConnectedAsync()
    {
        try
        {
            // ⚠️ Lưu ý: chỉ SET cache khi connection chưa tồn tại trong Redis.
            // Hàm ý: 1 user CHỈ giữ 1 connection chính tại 1 thời điểm. Nếu user mở tab thứ 2,
            // tab đầu tiên vẫn giữ connection và tab mới sẽ KHÔNG được lưu vào cache (mặc dù vẫn join group).
            // → Khi user gửi notification target trực tiếp qua connectionId, chỉ tab "đầu" nhận được.
            // Đây là design có chủ đích, không phải bug — nhưng cần check lại nếu yêu cầu multi-device.
            var userId = Context.GetHttpContext()?.Request.Query["userId"];
            if (userId is not null)
            {
                _logger.Information($"User {userId} connected with ConnectionId {Context.ConnectionId}");
                var connection = await _userCache.GetUserConnection(userId.ToString());
                if (connection is null)
                {
                    _logger.Information($"Update cache User {userId} with ConnectionId {Context.ConnectionId}");
                    await _userCache.SetUserConnection(userId, Context.ConnectionId);
                    await _userCache.SetConnectionUser(userId, Context.ConnectionId);
                }
                // Add user vào tất cả SignalR group tương ứng các conversation user đang tham gia,
                // để broadcast theo group thay vì gửi N message theo connectionId.
                var conversationIds = await _conversationCache.GetListConversationId(userId);
                foreach (var conversationId in conversationIds)
                {
                    _logger.Information($"Add user {userId} to group {conversationId}");
                    await Groups.AddToGroupAsync(Context.ConnectionId, conversationId);
                }
            }
            await base.OnConnectedAsync();
        }
        catch (Exception ex)
        {
            // Nuốt exception để không kill connection — SignalR sẽ disconnect nếu OnConnectedAsync throw.
            _logger.Information(JsonConvert.SerializeObject(ex));
        }
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        try
        {
            var userId = await _userCache.GetConnectionUser(Context.ConnectionId);
            if (userId is null)
            {
                await base.OnDisconnectedAsync(exception);
                return;
            }

            await _userCache.RemoveConnection(userId, Context.ConnectionId);
            _logger.Information($"User {userId} disconnected with ConnectionId {Context.ConnectionId}");

            var conversationIds = await _conversationCache.GetListConversationId(userId);
            _logger.Information($"User {userId} is in {conversationIds.Length} conversations");
            // Remove from group for broadcasting
            foreach (var conversationId in conversationIds)
            {
                _logger.Information($"Remove user {userId} from group {conversationId}");
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, conversationId);
            }
            // _conversationCache.RemoveAll(userId);
            await base.OnDisconnectedAsync(exception);
        }
        catch (Exception ex)
        {
            _logger.Information(JsonConvert.SerializeObject(ex));
        }
    }

    // ✅ **Ensure this method is public and can be invoked from the client**
    public Task<string> GetConnectionId()
    {
        return Task.FromResult(Context.ConnectionId);
    }

    public async Task SendOffer(string receiverId, string callerId, string offer)
    {
        var connection = await _userCache.GetUserConnection(receiverId);
        Console.WriteLine($"Offer is sent to user {receiverId} with connection {connection}");
        var caller = await _userCache.GetInfo(callerId);
        await Clients.Client(connection).SendAsync("ReceiveOffer", caller, offer);
    }

    public async Task SendAnswer(string callerId, string answer)
    {
        var connection = await _userCache.GetUserConnection(callerId);
        Console.WriteLine($"Answer {answer} is sent back to user {callerId} with connection {connection}");
        await Clients.Client(connection).SendAsync("ReceiveAnswer", answer);
    }

    public async Task SendIceCandidate(string callerId, string candidate)
    {
        var connection = await _userCache.GetUserConnection(callerId);
        Console.WriteLine($"Candidate {candidate} is sent to user {callerId} with connection {connection}");
        await Clients.Client(connection).SendAsync("ReceiveIceCandidate", candidate);
    }

    public async Task EndCall(string targetUserId)
    {
        var connection = await _userCache.GetUserConnection(targetUserId);
        Console.WriteLine($"Send endcall to user {targetUserId} with connection {connection}");
        await Clients.Client(connection).SendAsync("CallEnded");
    }
}