# Cấu hình JWT

## Thay đổi

JWT config trước đây được hardcode dưới dạng `const` trong `JwtService.cs`. Đã migrate sang `IOptions<JwtSettings>` để có thể cấu hình qua `appsettings.json` / environment variable.

## Cấu trúc JwtSettings

```csharp
// Application/Jwt/JwtSettings.cs
public class JwtSettings
{
    public string SecretKey { get; set; }
    public string Issuer { get; set; }
    public string Audience { get; set; }
    public int AccessTokenExpirationHours { get; set; } = 1;
    public int RefreshTokenExpirationDays { get; set; } = 7;
}
```

## Cấu hình trong appsettings.json

```json
"Jwt": {
  "SecretKey": "<override bằng env var hoặc user-secrets>",
  "Issuer": "https://chat.happycoding.click",
  "Audience": "https://chat.happycoding.click",
  "AccessTokenExpirationHours": 1,
  "RefreshTokenExpirationDays": 7
}
```

## ⚠️ CẢNH BÁO BẢO MẬT

**KHÔNG commit `SecretKey` thực vào appsettings.json** — file này được git track.

Cách cấu hình đúng:

**Local development:**
```bash
dotnet user-secrets set "Jwt:SecretKey" "<your-secret-key>"
```

**Production:**
```bash
# Environment variable
export Jwt__SecretKey="<your-secret-key>"

# Hoặc dùng secrets manager (Azure Key Vault, AWS Secrets Manager, v.v.)
```

## Đăng ký service

```csharp
// InfrastructureServiceInstaller.cs
services.Configure<JwtSettings>(configuration.GetSection("Jwt"));
```

`JwtService` nhận `IOptions<JwtSettings>` qua constructor injection.
