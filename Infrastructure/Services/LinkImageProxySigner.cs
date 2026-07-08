namespace Infrastructure.Services;

/// <summary>
/// Ký path proxy ảnh bằng HMAC-SHA256. Dùng CHUNG khóa bí mật JWT (server secret) nhưng
/// DOMAIN-SEPARATED bằng nhãn <see cref="Purpose"/> → chữ ký ảnh không bao giờ lẫn/valid như JWT.
/// </summary>
public class LinkImageProxySigner : ILinkImageProxySigner
{
    // Nhãn tách miền: nối trước payload trước khi HMAC để chữ ký này chỉ dùng cho proxy ảnh.
    const string Purpose = "linkimg:v1:";
    readonly byte[] _key;

    public LinkImageProxySigner(IOptions<JwtSettings> jwtSettings)
    {
        _key = Encoding.UTF8.GetBytes(jwtSettings.Value.SecretKey);
    }

    public string BuildProxyPath(string imageUrl)
    {
        var u = Base64UrlEncode(Encoding.UTF8.GetBytes(imageUrl));
        var s = Sign(u);
        return $"{AppConstants.ApiGroup_LinkPreview}/image?u={u}&s={s}";
    }

    public bool TryResolve(string u, string s, out string imageUrl)
    {
        imageUrl = string.Empty;
        if (string.IsNullOrEmpty(u) || string.IsNullOrEmpty(s)) return false;

        var expected = Sign(u);
        // So sánh hằng-thời-gian tránh timing attack khi dò chữ ký.
        if (!CryptographicOperations.FixedTimeEquals(
                Encoding.UTF8.GetBytes(s), Encoding.UTF8.GetBytes(expected)))
            return false;

        try { imageUrl = Encoding.UTF8.GetString(Base64UrlDecode(u)); }
        catch { return false; }
        return true;
    }

    string Sign(string u)
    {
        using var hmac = new HMACSHA256(_key);
        var mac = hmac.ComputeHash(Encoding.UTF8.GetBytes(Purpose + u));
        return Base64UrlEncode(mac);
    }

    static string Base64UrlEncode(byte[] bytes) =>
        Convert.ToBase64String(bytes).TrimEnd('=').Replace('+', '-').Replace('/', '_');

    static byte[] Base64UrlDecode(string s)
    {
        var b = s.Replace('-', '+').Replace('_', '/');
        switch (b.Length % 4)
        {
            case 2: b += "=="; break;
            case 3: b += "="; break;
        }
        return Convert.FromBase64String(b);
    }
}
