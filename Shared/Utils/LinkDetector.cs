using System.Text.RegularExpressions;

namespace Shared.Utils;

/// <summary>
/// Trích URL từ nội dung tin nhắn. Dùng ở tầng consumer để quyết định có enqueue
/// yêu cầu sinh preview hay không (chỉ tin text có URL http(s) mới cần).
/// </summary>
public static partial class LinkDetector
{
    // http(s):// theo sau bởi ký tự không phải whitespace/dấu ngoặc nhọn/nháy kép.
    [GeneratedRegex(@"https?://[^\s<>""']+", RegexOptions.IgnoreCase)]
    private static partial Regex UrlRegex();

    /// <summary>URL http(s) đầu tiên trong nội dung; null nếu không có. Cắt dấu câu đuôi thường gặp.</summary>
    public static string? FirstUrl(string? content)
    {
        if (string.IsNullOrWhiteSpace(content)) return null;

        var match = UrlRegex().Match(content);
        if (!match.Success) return null;

        return Clean(match.Value);
    }

    /// <summary>
    /// Mọi URL http(s) trong nội dung, GIỮ THỨ TỰ xuất hiện và LOẠI TRÙNG (case-sensitive theo
    /// chuỗi đã cắt dấu câu). Giới hạn <paramref name="max"/> URL để chặn tin spam nhiều link
    /// làm consumer fetch quá nhiều (bounded work). Trả list rỗng nếu không có URL.
    /// </summary>
    public static List<string> AllUrls(string? content, int max = 4)
    {
        var result = new List<string>();
        if (string.IsNullOrWhiteSpace(content) || max <= 0) return result;

        var seen = new HashSet<string>(StringComparer.Ordinal);
        foreach (Match m in UrlRegex().Matches(content))
        {
            var url = Clean(m.Value);
            if (url is null || !seen.Add(url)) continue;
            result.Add(url);
            if (result.Count >= max) break;
        }
        return result;
    }

    // Cắt dấu câu/đóng ngoặc dính đuôi URL khi người dùng viết "... xem link https://a.com."
    static string? Clean(string raw)
    {
        var url = raw.TrimEnd('.', ',', ')', ']', '}', '!', '?', ';', ':');
        return url.Length > 0 ? url : null;
    }
}
