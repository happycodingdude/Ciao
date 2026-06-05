# API Changes — Chuẩn hóa Delivery/Read Receipt (Tính năng 1)

## 1. Endpoint mới

### 1.1. Delivered receipt

**`POST /api/v1/conversations/{conversationId}/messages/delivered`**

Request body:

```json
{
  "messageId": "string",
  "deliveredTime": "2026-06-01T08:30:00Z"
}
```

Response:

```json
true
```

curl:

```bash
curl -X POST 'https://<host>/api/v1/conversations/{conversationId}/messages/delivered' \
  -H 'Authorization: Bearer <token>' \
  -H 'Content-Type: application/json' \
  -d '{
    "messageId": "65f0a1b2c3d4e5f6a7b8c9d0",
    "deliveredTime": "2026-06-01T08:30:00Z"
  }'
```

Behavior:

- Backend produce Kafka topic `message.delivered` để background consumer cập nhật Mongo `Members.$.LastDeliveredMessageId/LastDeliveredTime`.
- Backend cập nhật cache Redis (`MemberCache.MemberDelivered`) ngay tại API call để UI đa thiết bị reflect nhanh.
- Idempotent ở Mongo: nếu `deliveredTime` không mới hơn `LastDeliveredTime` hiện có → **no-op tự nhiên** (filter ElemMatch không match).
- Sau khi persist, NotificationConsumer fan-out FCM event `MessageDelivered` cho TẤT CẢ members **KHÁC** sender.

### 1.2. Read receipt

**`POST /api/v1/conversations/{conversationId}/messages/read`**

Request body:

```json
{
  "messageId": "string",
  "readTime": "2026-06-01T08:31:00Z"
}
```

Response:

```json
true
```

curl:

```bash
curl -X POST 'https://<host>/api/v1/conversations/{conversationId}/messages/read' \
  -H 'Authorization: Bearer <token>' \
  -H 'Content-Type: application/json' \
  -d '{
    "messageId": "65f0a1b2c3d4e5f6a7b8c9d0",
    "readTime": "2026-06-01T08:31:00Z"
  }'
```

Behavior:

- Backend produce Kafka topic `message.read` + cập nhật cache Redis (`MemberCache.MemberSeenAll`).
- Background consumer (`HandleMessageRead`) chạy 2 update độc lập trong 1 transaction Mongo:
  - Op 1: `Members.$.LastSeenTime = readTime` nếu `readTime > LastSeenTime` (idempotent).
  - Op 2: **Read implies delivered** — `Members.$.LastDeliveredMessageId/LastDeliveredTime = (messageId, readTime)` nếu `LastDeliveredTime` null hoặc `< readTime`.
- Sau persist, NotificationConsumer fan-out FCM event `MessageRead` cho TẤT CẢ members **KHÁC** reader.

## 2. Endpoint cũ — đã thay đổi behavior

### `GET /api/v1/conversations/{id}/messages`

**Trước:**

```bash
# Side-effect: tự động set Member.LastSeenTime của user gọi API
curl -X GET 'https://<host>/api/v1/conversations/{id}/messages?page=1&limit=20' \
  -H 'Authorization: Bearer <token>'
# → backend ngầm gọi SeenAll(...) đánh dấu user đã đọc tới message cuối
```

**Sau:**

```bash
# Pure read, KHÔNG còn side-effect đánh dấu seen
curl -X GET 'https://<host>/api/v1/conversations/{id}/messages?page=1&limit=20' \
  -H 'Authorization: Bearer <token>'
# → chỉ trả messages, không update Member.LastSeenTime
```

**Tác động:**

- Frontend prefetch/refetch message khi conversation không active → KHÔNG còn bị backend hiểu nhầm là "đã đọc".
- Để đánh dấu read, frontend **bắt buộc** gọi `POST /messages/read` rõ ràng khi user thực sự xem (tab visible + render tới message cuối).

## 3. FCM event payload

### `MessageDelivered`

```json
{
  "userId": "<reader-but-named-userId-due-to-base-model>",
  "conversationId": "<conv-id>",
  "contactId": "<user-vua-thuc-hien-delivered>",
  "messageId": "<message-id-cuoi-cung-da-nhan>",
  "deliveredTime": "2026-06-01T08:30:00Z"
}
```

### `MessageRead`

```json
{
  "userId": "<reader>",
  "conversationId": "<conv-id>",
  "contactId": "<user-vua-thuc-hien-read>",
  "messageId": "<message-id-cuoi-cung-da-doc>",
  "readTime": "2026-06-01T08:31:00Z"
}
```

> **Quan trọng cho FE:** `contactId` chính là người vừa delivered/read; recipient FCM là tất cả members **trừ** `contactId` này → khi FE nhận event, dùng `contactId` để cập nhật badge "Delivered/Seen by ..." cho UI người gửi message gốc.

## 4. Validation rules

| Field | Rule |
|---|---|
| `conversationId` | User hiện tại phải là member của conversation (qua `ContactRelatedToConversation` validator) |
| `messageId` | NotEmpty |
| `deliveredTime` / `readTime` | Phải parse được DateTime (ISO-8601 UTC khuyến nghị) |

## 5. Error codes

- `400 Bad Request`: validation fail (`messageId` rỗng, conversation không tồn tại, user không phải member).
- `401 Unauthorized`: thiếu/sai JWT.
- `200 OK + true`: request hợp lệ. **Lưu ý:** API trả `true` ngay cả khi event bị Mongo skip do idempotency (không phải lỗi).
