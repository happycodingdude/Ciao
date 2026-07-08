using System.Security.Cryptography;
using System.Text;

namespace Application.Caching;

/// <summary>
/// Cache thẻ preview theo URL (không theo message) → cùng 1 link được nhiều người/nhiều tin gửi
/// chỉ fetch ngoài 1 lần trong TTL. Giảm mạnh I/O ngoài + hạ tải cho <c>LinkPreviewConsumer</c>.
///
/// Có cache ÂM (URL fetch fail) với TTL ngắn để không hammer lại trang lỗi/chặn OG liên tục,
/// nhưng vẫn cho retry sau vài phút (lỗi có thể tạm thời). Phân biệt "chưa cache" (null) với
/// "đã cache là fail" (<see cref="Entry.Found"/> = false) qua wrapper <see cref="Entry"/>.
/// </summary>
public class LinkPreviewCache
{
    readonly IRedisCaching _redisCaching;

    // Preview hữu ích: giữ lâu (nội dung OG hiếm đổi). Fail: giữ ngắn để cho retry.
    static readonly TimeSpan PositiveTtl = TimeSpan.FromHours(6);
    static readonly TimeSpan NegativeTtl = TimeSpan.FromMinutes(15);

    public LinkPreviewCache(IRedisCaching redisCaching)
    {
        _redisCaching = redisCaching;
    }

    public class Entry
    {
        public bool Found { get; set; }
        public LinkPreview? Preview { get; set; }
    }

    /// <summary>null = chưa cache (cần fetch); Found=false = fetch trước đó fail; Found=true = có preview.</summary>
    public Task<Entry?> GetAsync(string url) => _redisCaching.GetAsync<Entry>(Key(url));

    /// <summary>Lưu kết quả fetch (dương/âm) với TTL tương ứng.</summary>
    public Task SetAsync(string url, LinkPreview? preview) =>
        _redisCaching.SetAsync(
            Key(url),
            new Entry { Found = preview is not null, Preview = preview },
            preview is not null ? PositiveTtl : NegativeTtl);

    // SHA-256 hex: key ổn định, tránh URL dài/ký tự đặc biệt phá key Redis.
    static string Key(string url)
    {
        var hash = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(url)));
        return AppConstants.RedisKey_LinkPreviewUrl.Replace("{hash}", hash);
    }
}
