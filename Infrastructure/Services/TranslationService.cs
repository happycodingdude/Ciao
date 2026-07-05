using System.Text;
using Newtonsoft.Json.Linq;

namespace Infrastructure.Services;

/// <summary>
/// Provider dịch mặc định: dùng free translation endpoint hỗ trợ tự nhận diện ngôn ngữ nguồn.
/// Trừu tượng qua ITranslationService để thay provider (vd dịch vụ trả phí) mà không đụng caller.
/// </summary>
public class TranslationService : ITranslationService
{
    readonly IHttpClientFactory _httpClientFactory;
    readonly ILogger _logger;

    public TranslationService(IHttpClientFactory httpClientFactory, ILogger logger)
    {
        _httpClientFactory = httpClientFactory;
        _logger = logger;
    }

    public async Task<TranslationResult> TranslateAsync(string text, string targetLang, CancellationToken cancellationToken = default)
    {
        // Rỗng/khoảng trắng → không dịch, trả nguyên (tránh gọi mạng thừa).
        if (string.IsNullOrWhiteSpace(text))
            return new TranslationResult { TranslatedText = text ?? string.Empty };

        var target = string.IsNullOrWhiteSpace(targetLang) ? "vi" : targetLang.Trim();

        var client = _httpClientFactory.CreateClient();
        client.Timeout = TimeSpan.FromSeconds(8);

        // sl=auto → tự nhận diện ngôn ngữ nguồn; dt=t → chỉ lấy bản dịch.
        var url = $"https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl={Uri.EscapeDataString(target)}&dt=t&q={Uri.EscapeDataString(text)}";

        try
        {
            using var response = await client.GetAsync(url, cancellationToken);
            response.EnsureSuccessStatusCode();
            var json = await response.Content.ReadAsStringAsync(cancellationToken);

            // Định dạng: [[["<dịch>","<gốc>",...], ...], null, "<lang nguồn>", ...]
            var root = JArray.Parse(json);
            var builder = new StringBuilder();
            if (root.Count > 0 && root[0] is JArray segments)
            {
                foreach (var seg in segments)
                    if (seg is JArray s && s.Count > 0)
                        builder.Append(s[0]?.ToString());
            }

            var detected = root.Count > 2 ? root[2]?.ToString() : null;

            return new TranslationResult
            {
                TranslatedText = builder.Length > 0 ? builder.ToString() : text,
                DetectedSourceLang = detected,
            };
        }
        catch (Exception ex)
        {
            _logger.Error(ex, "[TranslationService] Translate failed for target {Target}", target);
            throw;
        }
    }
}
