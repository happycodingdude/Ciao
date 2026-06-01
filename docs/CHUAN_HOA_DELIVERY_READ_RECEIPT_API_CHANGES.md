# API Changes - Feature Chat 1 (Read / Delivery Receipt)

## Thêm mới Endpoints

### 1. Delivery Receipt
- **URL**: `POST /api/v1/conversations/{conversationId}/messages/delivered`
- **Request**:
```json
{
  "messageId": "string",
  "deliveredTime": "2026-06-01T08:30:00Z"
}
```
- **Response**: `true`

### 2. Read Receipt
- **URL**: `POST /api/v1/conversations/{conversationId}/messages/read`
- **Request**:
```json
{
  "messageId": "string",
  "readTime": "2026-06-01T08:31:00Z"
}
```
- **Response**: `true`

## Chỉnh sửa logic Endpoint cũ
- `GET /api/v1/conversations/{id}/messages` KHÔNG CÒN cập nhật trạng thái `LastSeenTime` của member nữa.
