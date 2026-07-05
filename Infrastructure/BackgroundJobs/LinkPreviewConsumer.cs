namespace Infrastructure.BackgroundJobs;

/// <summary>
/// Consumer group RIÊNG cho Preview Link. Cô lập vì fetch OG metadata là external I/O chậm
/// (timeout vài giây) — nếu chạy chung group với message/cache/notification sẽ chặn cả pipeline
/// tin nhắn (mỗi group là 1 thread tuần tự).
///
/// Luồng: linkpreview.requested → fetch (SSRF-safe) → persist Mongo (idempotent) → linkpreview.stored.
/// </summary>
public class LinkPreviewConsumer : IGenericConsumer
{
    readonly ILogger _logger;
    readonly IUnitOfWork _uow;
    readonly IConversationRepository _conversationRepository;
    readonly ILinkPreviewService _linkPreviewService;
    readonly IKafkaProducer _kafkaProducer;

    public LinkPreviewConsumer(ILogger logger, IUnitOfWork uow, IConversationRepository conversationRepository, ILinkPreviewService linkPreviewService, IKafkaProducer kafkaProducer)
    {
        _logger = logger;
        _uow = uow;
        _conversationRepository = conversationRepository;
        _linkPreviewService = linkPreviewService;
        _kafkaProducer = kafkaProducer;
    }

    public async Task ProcessMessageAsync(ConsumerResultData param, CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.Information("[{Consumer}] [{Topic}] {Message}", nameof(LinkPreviewConsumer), param.cr.Topic, param.cr.Message.Value);

            switch (param.cr.Topic)
            {
                case Topic.LinkPreviewRequested:
                    await HandleRequested(JsonConvert.DeserializeObject<LinkPreviewRequestedModel>(param.cr.Message.Value)!, cancellationToken);
                    break;
            }
        }
        catch (Exception ex)
        {
            _logger.Error(ex, "[{Consumer}] Error processing topic {Topic}", nameof(LinkPreviewConsumer), param.cr.Topic);
        }
        finally
        {
            param.consumer.Commit(param.cr);
        }
    }

    async Task HandleRequested(LinkPreviewRequestedModel param, CancellationToken cancellationToken)
    {
        // Fetch trả null (URL không hợp lệ / bị chặn SSRF / thất bại / không có metadata) → no-op.
        var preview = await _linkPreviewService.FetchAsync(param.Url, cancellationToken);
        if (preview is null) return;

        // Persist positional, idempotent: chỉ set khi chưa có preview (duplicate Kafka / retry → no-op).
        // Không cho tin recalled: nếu tin đã thu hồi thì bỏ qua (RecalledTime != null → không match).
        var filter = Builders<Conversation>.Filter.And(
            MongoQuery<Conversation>.IdFilter(param.ConversationId),
            Builders<Conversation>.Filter.ElemMatch(c => c.Messages,
                m => m.Id == param.MessageId && m.RecalledTime == null && m.LinkPreview == null)
        );
        var update = Builders<Conversation>.Update.Set("Messages.$.LinkPreview", preview);
        _conversationRepository.UpdateNoTrackingTime(filter, update);
        await _uow.SaveAsync();

        // Đồng bộ Redis message cache + fanout realtime (CacheConsumer → NotifyLinkPreview → FCM).
        await _kafkaProducer.ProduceAsync(Topic.StoredLinkPreview, new StoredLinkPreviewModel
        {
            UserId = param.UserId,
            ConversationId = param.ConversationId,
            MessageId = param.MessageId,
            LinkPreview = preview
        });
    }
}
