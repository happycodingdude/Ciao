namespace Application.Services;

/// <summary>
/// Ký/giải mã đường dẫn proxy ảnh preview. Ảnh KHÔNG được client tải trực tiếp từ server bên
/// thứ 3 (lộ IP người xem + tracking pixel) → BE lưu <c>ImageUrl</c> dưới dạng path proxy có
/// chữ ký HMAC. Chữ ký bảo đảm endpoint proxy CHỈ phục vụ URL do chính BE ký (đã qua fetch
/// SSRF-safe khi dựng preview) → không biến endpoint thành open-proxy tùy ý.
/// </summary>
public interface ILinkImageProxySigner
{
    /// <summary>
    /// Trả path TƯƠNG ĐỐI dạng <c>/api/v1/link-preview/image?u=..&amp;s=..</c> (FE ghép base host).
    /// Ổn định theo URL (không hết hạn) → lưu Mongo/cache tái sử dụng qua mọi lần reload.
    /// </summary>
    string BuildProxyPath(string imageUrl);

    /// <summary>
    /// Xác thực chữ ký và giải mã lại URL ảnh gốc. Trả <c>false</c> nếu thiếu tham số, chữ ký sai,
    /// hoặc không giải mã được (endpoint sẽ trả 404).
    /// </summary>
    bool TryResolve(string u, string s, out string imageUrl);
}
