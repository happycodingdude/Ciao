# SEARCH_MESSAGES

## Mục đích

Cho phép user tìm tin nhắn theo keyword trong 1 conversation cụ thể.

## Luồng hoạt động

1. Frontend gọi `GET /api/v1/conversations/{id}/messages/search?keyword=...&page=1&limit=20`.
2. `Validator` kiểm tra:
   - User hiện tại phải là member của conversation `{id}` (reuse rule `ContactRelatedToConversation`).
   - `keyword` không được rỗng/whitespace.
3. `Handler` gọi `IConversationRepository.SearchMessages` → trả về `List<MessageSearchResult>`.
4. Repository chạy aggregation pipeline trên collection `Conversation`:
   - `$match _id == conversationId` (hit primary index)
   - `$unwind Messages`
   - `$match Messages.Type == "text"` + regex `i` trên `Messages.Content`
   - `$sort CreatedTime desc`, `$skip`, `$limit`
   - `$replaceRoot` để Messages thành document gốc
   - `$project` lấy id, type, content, contactId, createdTime
5. Kết quả deserialize qua `BsonSerializer.Deserialize<MessageSearchResult>`.

## Frontend

- Service: `searchMessages(conversationId, keyword)` trong [client/src/services/message.service.ts](../client/src/services/message.service.ts)
- Type: `MessageSearchResult` trong [client/src/types/message.types.ts](../client/src/types/message.types.ts)
- Component: [client/src/components/conversation/InformationSearch.tsx](../client/src/components/conversation/InformationSearch.tsx)
  - Overlay absolute chiếm toàn bộ Information panel khi user click icon kính lúp
  - Header có nút back để thoát search → quay lại view info bình thường
  - Input + nút kính lúp (hoặc Enter) để gọi API
  - List kết quả render content + createdTime
- Trigger: icon `SearchOutlined` trong action container của [Information.tsx](../client/src/components/conversation/Information.tsx)
- Endpoint env: `VITE_ENDPOINT_MESSAGE_SEARCH` trong [client/.env](../client/.env)

## Lưu ý khi sử dụng

- Chỉ search message `type == "text"`. Image/system message không có content meaningful.
- Keyword được escape bằng `Regex.Escape` để chống regex injection (user nhập `.*`, `[a-z]+`...).
- Regex case-insensitive trên embedded array KHÔNG hit index → nếu lượng message lớn cần cân nhắc tạo text index riêng (không trivial trên embedded array). Để hướng cải thiện future.
- Pagination dùng `PagingParam` chuẩn (page, limit). Default `limit=20` từ `AppConstants.DefaultLimit`.
- Cache (Redis MessageCache) KHÔNG được dùng cho search — DB là source of truth, đảm bảo kết quả luôn đầy đủ kể cả với message cũ đã evict khỏi cache.
