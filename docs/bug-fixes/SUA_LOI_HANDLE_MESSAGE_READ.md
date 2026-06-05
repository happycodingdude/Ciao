# Sửa Lỗi Handle Message Read & Delivered

## Mục đích
Sửa lỗi hàm `HandleMessageRead` và `HandleMessageDelivered` trong `DataStoreConsumer` không cập nhật được dữ liệu trạng thái đã xem (LastSeenTime) và đã nhận (LastDeliveredTime) của tin nhắn vào cơ sở dữ liệu MongoDB.

## Luồng hoạt động
1. Khi có Kafka message `Topic.MessageRead` hoặc `Topic.MessageDelivered`, Consumer sẽ parse thành `MessageReadModel` / `MessageDeliveredModel`.
2. Thay vì dùng `ArrayFilters` (cú pháp `$[elem]`) và match theo kiểu `Builders<Conversation>.Filter.Eq("Members.ContactId", ...)` vốn dễ gây lỗi mapping ở C# driver và không tận dụng tốt positional operator, code được sửa lại thành sử dụng `ElemMatch` ở phần Filter:
   ```csharp
   Builders<Conversation>.Filter.ElemMatch(c => c.Members, m => m.ContactId == param.UserId)
   ```
3. Đồng thời, thay vì truyền chuỗi key `"_id"` cứng, ta sử dụng `MongoQuery<Conversation>.IdFilter(param.ConversationId)` để tận dụng định nghĩa chuẩn của Repository.
4. Ở phần Update, thay vì dùng `ArrayFilters` truyền mảng điều kiện, code chuyển sang sử dụng toán tử positional `$` của MongoDB (được support khi query có dùng `ElemMatch`), ví dụ:
   ```csharp
   .Set("Members.$.LastSeenTime", param.ReadTime)
   ```
   Điều này cho phép MongoDB cập nhật trực tiếp phần tử đầu tiên thỏa mãn `ElemMatch` một cách an toàn và tối ưu O(1).
5. Cuối cùng, hàm gọi `_conversationRepository.UpdateNoTrackingTime` mà không cần tham số `ArrayFilterDefinition` nữa, rồi lưu lại với `SaveAsync`.

## Lưu ý khi sử dụng
- Do `ContactId` của từng `Member` trong một `Conversation` là duy nhất, toán tử positional `$` (chỉ cập nhật element đầu tiên khớp) là hoàn toàn an toàn và đủ dùng thay thế cho `$[]` array filter.
- Tránh việc sử dụng raw string `"_id"` cho Id filter trong project nếu C# models đã được map bằng class base có `Id` property. Hãy ưu tiên dùng `MongoQuery<T>.IdFilter`.
