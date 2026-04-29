# API Changes: Login endpoint sau bug fix

Không thay đổi contract API (request/response giữ nguyên).
Thay đổi là behavior nội bộ: `LastLogout` được reset về `null` khi login.

## Curl — Phiên bản cũ (có bug)

```bash
# Sau khi login, nếu LastLogout cũ > 7 ngày, job sẽ set IsOnline=false trong vòng 1 phút
curl -X POST "http://localhost:5000/api/v1/identity/signin" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "your_username",
    "password": "your_password"
  }'
```

## Curl — Phiên bản mới (đã fix)

```bash
# Sau khi login, LastLogout=null → job bỏ qua → IsOnline giữ nguyên true
curl -X POST "http://localhost:5000/api/v1/identity/signin" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "your_username",
    "password": "your_password"
  }'
```

## Response (không đổi)

```json
{
  "token": "<jwt_token>",
  "refreshToken": "<refresh_token>",
  "userId": "<user_id>"
}
```
