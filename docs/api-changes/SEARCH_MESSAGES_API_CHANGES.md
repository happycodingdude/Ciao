# SEARCH_MESSAGES_API_CHANGES

## Endpoint mới

`GET /api/v1/conversations/{id}/messages/search`

### Query params

| Param | Type | Required | Default | Note |
|---|---|---|---|---|
| `keyword` | string | yes | — | từ khóa cần search, không rỗng |
| `page` | int | no | 1 | |
| `limit` | int | no | 20 | |

### curl

```bash
curl -X GET 'http://localhost:5000/api/v1/conversations/{conversationId}/messages/search?keyword=hello&page=1&limit=20' \
     -H 'Authorization: Bearer {accessToken}'
```

### Response

```json
[
  {
    "id": "65f1...",
    "type": "text",
    "content": "hello world",
    "contactId": "65a0...",
    "createdTime": "2026-04-30T10:23:45Z"
  }
]
```

### Errors

- `400 Bad Request` — keyword rỗng / user không thuộc conversation
- `401 Unauthorized` — thiếu access token
