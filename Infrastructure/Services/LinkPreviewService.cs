using System.Buffers;
using System.Net.Sockets;
using System.Text.RegularExpressions;

namespace Infrastructure.Services;

/// <summary>
/// Fetch Open Graph / meta của một URL để dựng thẻ xem trước.
///
/// AN TOÀN (chống SSRF) là ưu tiên số 1 vì URL do người dùng nhập:
///  - Chỉ cho http/https.
///  - <see cref="SocketsHttpHandler.ConnectCallback"/> xác thực IP THỰC tại thời điểm connect
///    (kể cả sau redirect) → chặn địa chỉ private/loopback/link-local/metadata, đồng thời
///    triệt tiêu DNS-rebinding (connect đúng IP đã kiểm, không resolve lại).
///  - Giới hạn redirect, timeout, và dung lượng đọc (chống response khổng lồ/streaming).
/// Thất bại ở bất kỳ bước nào → trả null (caller giữ link thường), không ném ra ngoài.
/// </summary>
public partial class LinkPreviewService : ILinkPreviewService
{
    readonly ILogger _logger;

    // Trần đọc HTML. Nhiều trang "nặng" (YouTube nhồi ytInitialData ~600KB TRƯỚC thẻ meta,
    // một số SPA tương tự) đặt <meta og:*> rất sâu → 2MB để không cắt mất OG. Đọc theo buffer
    // co giãn (ReadBoundedAsync) nên trang nhỏ vẫn nhẹ, chỉ pathological mới chạm trần này.
    const int MaxContentBytes = 2 * 1024 * 1024;
    const int MaxRedirects = 3;
    static readonly TimeSpan Timeout = TimeSpan.FromSeconds(6);

    public LinkPreviewService(ILogger logger)
    {
        _logger = logger;
    }

    public async Task<LinkPreview?> FetchAsync(string url, CancellationToken cancellationToken = default)
    {
        if (!TryNormalizeUrl(url, out var uri)) return null;

        try
        {
            using var handler = new SocketsHttpHandler
            {
                AllowAutoRedirect = true,
                MaxAutomaticRedirections = MaxRedirects,
                AutomaticDecompression = DecompressionMethods.All,
                ConnectTimeout = TimeSpan.FromSeconds(5),
                // Xác thực mọi TCP connect (gồm cả các hop redirect) tới IP public → anti-SSRF + anti-rebinding.
                ConnectCallback = SafeConnectAsync,
            };
            using var client = new HttpClient(handler) { Timeout = Timeout };
            client.MaxResponseContentBufferSize = MaxContentBytes;
            // UA thân thiện bot: nhiều trang chỉ trả OG đầy đủ khi nhận diện được crawler.
            client.DefaultRequestHeaders.TryAddWithoutValidation("User-Agent",
                "Mozilla/5.0 (compatible; CiaoLinkPreview/1.0; +https://ciao.app/bot)");
            client.DefaultRequestHeaders.TryAddWithoutValidation("Accept", "text/html,application/xhtml+xml");

            using var response = await client.GetAsync(uri, HttpCompletionOption.ResponseHeadersRead, cancellationToken);
            if (!response.IsSuccessStatusCode) return null;

            // Chỉ parse HTML — ảnh/PDF/binary bỏ qua (không có OG để trích).
            var mediaType = response.Content.Headers.ContentType?.MediaType;
            if (mediaType is not null &&
                !mediaType.Contains("html", StringComparison.OrdinalIgnoreCase))
                return null;

            var finalUri = response.RequestMessage?.RequestUri ?? uri;
            var html = await ReadBoundedAsync(response, cancellationToken);
            if (string.IsNullOrEmpty(html)) return null;

            return BuildPreview(html, finalUri);
        }
        catch (Exception ex)
        {
            // Timeout / DNS / connect bị chặn / parse lỗi — không có preview là chấp nhận được.
            _logger.Warning(ex, "[LinkPreviewService] Fetch failed for {Url}", uri);
            return null;
        }
    }

    // ---- SSRF guard --------------------------------------------------------

    static bool TryNormalizeUrl(string url, out Uri uri)
    {
        uri = null!;
        if (string.IsNullOrWhiteSpace(url)) return false;
        if (!Uri.TryCreate(url.Trim(), UriKind.Absolute, out var parsed)) return false;
        if (parsed.Scheme != Uri.UriSchemeHttp && parsed.Scheme != Uri.UriSchemeHttps) return false;
        uri = parsed;
        return true;
    }

    static async ValueTask<Stream> SafeConnectAsync(SocketsHttpConnectionContext ctx, CancellationToken ct)
    {
        var host = ctx.DnsEndPoint.Host;
        var port = ctx.DnsEndPoint.Port;

        var addresses = await Dns.GetHostAddressesAsync(host, ct);
        // Chọn IP public đầu tiên; nếu host resolve ra BẤT KỲ địa chỉ nội bộ nào cũng loại địa chỉ đó.
        var target = Array.Find(addresses, IsPublicAddress);
        if (target is null)
            throw new IOException($"Blocked connection to non-public host '{host}'.");

        var socket = new Socket(SocketType.Stream, ProtocolType.Tcp) { NoDelay = true };
        try
        {
            // Connect ĐÚNG IP đã kiểm (không đưa host để resolve lại) → chống DNS-rebinding.
            await socket.ConnectAsync(new IPEndPoint(target, port), ct);
            return new NetworkStream(socket, ownsSocket: true);
        }
        catch
        {
            socket.Dispose();
            throw;
        }
    }

    static bool IsPublicAddress(IPAddress address)
    {
        // Chuẩn hóa IPv4-mapped IPv6 (::ffff:a.b.c.d) về IPv4 để kiểm dải riêng.
        if (address.IsIPv4MappedToIPv6) address = address.MapToIPv4();

        if (IPAddress.IsLoopback(address)) return false;                 // 127/8, ::1
        if (address.IsIPv6LinkLocal || address.IsIPv6SiteLocal) return false;
        if (address.IsIPv6Multicast) return false;
        if (address.Equals(IPAddress.Any) || address.Equals(IPAddress.IPv6Any)) return false;

        if (address.AddressFamily == AddressFamily.InterNetwork)
        {
            var b = address.GetAddressBytes();
            return b[0] switch
            {
                0 => false,                                              // 0.0.0.0/8
                10 => false,                                             // 10/8 private
                127 => false,                                            // loopback (đề phòng)
                169 when b[1] == 254 => false,                           // 169.254/16 link-local + metadata 169.254.169.254
                172 when b[1] >= 16 && b[1] <= 31 => false,              // 172.16/12 private
                192 when b[1] == 168 => false,                           // 192.168/16 private
                100 when b[1] >= 64 && b[1] <= 127 => false,             // 100.64/10 CGNAT
                >= 224 => false,                                         // 224/4 multicast + 240/4 reserved
                _ => true,
            };
        }

        // IPv6: loại ULA (fc00::/7) ngoài các cờ đã kiểm ở trên.
        if (address.AddressFamily == AddressFamily.InterNetworkV6)
        {
            var first = address.GetAddressBytes()[0];
            if ((first & 0xFE) == 0xFC) return false;                    // fc00::/7 unique-local
        }

        return true;
    }

    // ---- Read + parse ------------------------------------------------------

    static async Task<string> ReadBoundedAsync(HttpResponseMessage response, CancellationToken ct)
    {
        await using var stream = await response.Content.ReadAsStreamAsync(ct);

        // Buffer co giãn, cap ở MaxContentBytes: trang nhỏ chỉ cấp phát đúng phần đọc được,
        // không pre-alloc trọn trần. Chỉ trang lớn bất thường mới bị cắt ở trần.
        using var ms = new MemoryStream();
        var chunk = ArrayPool<byte>.Shared.Rent(32 * 1024);
        try
        {
            int read;
            while (ms.Length < MaxContentBytes &&
                   (read = await stream.ReadAsync(
                        chunk.AsMemory(0, (int)Math.Min(chunk.Length, MaxContentBytes - ms.Length)), ct)) > 0)
                ms.Write(chunk, 0, read);
        }
        finally
        {
            ArrayPool<byte>.Shared.Return(chunk);
        }

        // Best-effort UTF-8 (đa số meta là UTF-8/ASCII). Không cần dò charset cho mục đích preview.
        return Encoding.UTF8.GetString(ms.GetBuffer(), 0, (int)ms.Length);
    }

    static LinkPreview? BuildPreview(string html, Uri baseUri)
    {
        var meta = ParseMeta(html);

        string? Pick(params string[] keys)
        {
            foreach (var k in keys)
                if (meta.TryGetValue(k, out var v) && !string.IsNullOrWhiteSpace(v))
                    return WebUtility.HtmlDecode(v).Trim();
            return null;
        }

        var title = Pick("og:title", "twitter:title") ?? ExtractTitleTag(html);
        var description = Pick("og:description", "twitter:description", "description");
        var siteName = Pick("og:site_name");
        var image = Pick("og:image", "og:image:url", "og:image:secure_url", "twitter:image", "twitter:image:src");

        // Resolve ảnh tương đối (/img/a.png) về tuyệt đối theo URL cuối.
        if (!string.IsNullOrWhiteSpace(image) &&
            Uri.TryCreate(baseUri, image, out var absImage) &&
            (absImage.Scheme == Uri.UriSchemeHttp || absImage.Scheme == Uri.UriSchemeHttps))
            image = absImage.ToString();
        else
            image = null;

        // Không có gì hữu ích → không dựng thẻ (spec: hiển thị link thường).
        if (string.IsNullOrWhiteSpace(title) &&
            string.IsNullOrWhiteSpace(description) &&
            string.IsNullOrWhiteSpace(image))
            return null;

        return new LinkPreview
        {
            Url = baseUri.ToString(),
            Title = Truncate(title, 300),
            Description = Truncate(description, 500),
            ImageUrl = image,
            SiteName = Truncate(siteName, 100) ?? baseUri.Host,
        };
    }

    // Gom tất cả <meta ...> → dict theo property/name (lowercase).
    static Dictionary<string, string> ParseMeta(string html)
    {
        var result = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
        foreach (Match tag in MetaTagRegex().Matches(html))
        {
            string? key = null, content = null;
            foreach (Match attr in AttrRegex().Matches(tag.Value))
            {
                var name = attr.Groups[1].Value.ToLowerInvariant();
                var value = attr.Groups[2].Success ? attr.Groups[2].Value : attr.Groups[3].Value;
                if (name is "property" or "name") key = value.ToLowerInvariant();
                else if (name == "content") content = value;
            }
            if (key is not null && content is not null && !result.ContainsKey(key))
                result[key] = content;
        }
        return result;
    }

    static string? ExtractTitleTag(string html)
    {
        var m = TitleTagRegex().Match(html);
        return m.Success ? WebUtility.HtmlDecode(m.Groups[1].Value).Trim() : null;
    }

    static string? Truncate(string? value, int max) =>
        string.IsNullOrEmpty(value) ? value : value.Length <= max ? value : value[..max];

    [GeneratedRegex(@"<meta\b[^>]*>", RegexOptions.IgnoreCase | RegexOptions.Singleline)]
    private static partial Regex MetaTagRegex();

    [GeneratedRegex("""(\w[\w:-]*)\s*=\s*(?:"([^"]*)"|'([^']*)')""", RegexOptions.IgnoreCase)]
    private static partial Regex AttrRegex();

    [GeneratedRegex(@"<title[^>]*>(.*?)</title>", RegexOptions.IgnoreCase | RegexOptions.Singleline)]
    private static partial Regex TitleTagRegex();
}
