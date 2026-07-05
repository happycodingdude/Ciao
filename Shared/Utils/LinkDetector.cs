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

        // Cắt dấu câu/đóng ngoặc dính đuôi URL khi người dùng viết "... xem link https://a.com."
        var url = match.Value.TrimEnd('.', ',', ')', ']', '}', '!', '?', ';', ':');
        return url.Length > 0 ? url : null;
    }
}
