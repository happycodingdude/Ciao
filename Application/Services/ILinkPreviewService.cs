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

    /// <summary>
    /// Fetch NHỊ PHÂN ảnh preview (dùng cho endpoint proxy — không để client tải trực tiếp từ
    /// server bên thứ 3, tránh lộ IP/tracking người xem). SSRF-safe y hệt <see cref="FetchAsync"/>.
    /// Trả <c>null</c> nếu URL không hợp lệ/nội bộ, không phải ảnh, vượt trần dung lượng, hoặc lỗi.
    /// </summary>
    Task<LinkPreviewImage?> FetchImageAsync(string url, CancellationToken cancellationToken = default);
}

/// <summary>Nội dung ảnh đã tải (bytes) kèm content-type gốc để endpoint stream lại cho client.</summary>
public record LinkPreviewImage(byte[] Content, string ContentType);
