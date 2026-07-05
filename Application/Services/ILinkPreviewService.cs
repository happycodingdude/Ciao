namespace Application.Services;

/// <summary>
/// Sinh thẻ xem trước (Open Graph / meta) cho 1 URL. Provider trừu tượng hóa để có thể
/// thay bằng dịch vụ ngoài mà không đụng consumer/FE.
/// </summary>
public interface ILinkPreviewService
{
    /// <summary>
    /// Fetch metadata của URL. Trả <c>null</c> khi URL không hợp lệ, trỏ tới địa chỉ nội bộ
    /// (chặn SSRF), fetch thất bại, hoặc không trích được metadata hữu ích → caller no-op
    /// (tin giữ nguyên link thường).
    /// </summary>
    Task<LinkPreview?> FetchAsync(string url, CancellationToken cancellationToken = default);
}
