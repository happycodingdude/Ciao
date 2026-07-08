namespace Presentation.LinkPreviews;

/// <summary>
/// Proxy ảnh preview: client tải ảnh QUA BE thay vì trực tiếp từ server bên thứ 3
/// (không lộ IP/tracking người xem). Endpoint ẨN DANH nhưng an toàn nhờ:
///  - Chữ ký HMAC (<see cref="ILinkImageProxySigner"/>): chỉ URL do BE ký (đã fetch SSRF-safe khi
///    dựng preview) mới phục vụ → không thành open-proxy.
///  - Fetch lại SSRF-safe + chỉ chấp nhận content-type image/* (chặn trả HTML/script).
/// Ảnh bất biến theo URL đã ký → cache mạnh ở browser/CDN.
/// </summary>
public class GetLinkPreviewImageEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiGroup_LinkPreview).MapGet("/image",
        async (
            HttpContext ctx,
            string? u,
            string? s,
            ILinkImageProxySigner signer,
            ILinkPreviewService linkPreviewService,
            CancellationToken cancellationToken) =>
        {
            if (!signer.TryResolve(u ?? string.Empty, s ?? string.Empty, out var imageUrl))
                return Results.NotFound();

            var image = await linkPreviewService.FetchImageAsync(imageUrl, cancellationToken);
            if (image is null) return Results.NotFound();

            ctx.Response.Headers.CacheControl = "public, max-age=86400, immutable";
            // Không cho browser đoán lại kiểu nội dung → tránh phục vụ nhầm dạng thực thi.
            ctx.Response.Headers["X-Content-Type-Options"] = "nosniff";
            return Results.File(image.Content, image.ContentType);
        });
    }
}
