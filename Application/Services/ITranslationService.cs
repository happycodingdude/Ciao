namespace Application.Services;

public class TranslationResult
{
    public string TranslatedText { get; set; } = null!;
    public string? DetectedSourceLang { get; set; }
}

/// <summary>
/// Dịch văn bản. Provider được trừu tượng hóa để có thể thay thế (free API / dịch vụ trả phí)
/// mà không đụng tới endpoint hay FE.
/// </summary>
public interface ITranslationService
{
    Task<TranslationResult> TranslateAsync(string text, string targetLang, CancellationToken cancellationToken = default);
}
