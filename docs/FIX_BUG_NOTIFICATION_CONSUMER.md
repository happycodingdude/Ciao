# Fix Bug Notification Consumer

## Mục đích
Sửa lỗi `Specified method is not supported.` tại dòng 101 trong hàm `HandleNewMessage` của `NotificationConsumer`.

## Cách hoạt động
Lỗi xảy ra do driver MongoDB C# không thể translate được expression `Where(q => memberIds.Contains(q.Id))` thành cú pháp query của Mongo. 
Để giải quyết vấn đề, chúng ta thay thế `Builders<Contact>.Filter.Where(q => memberIds.Contains(q.Id))` bằng helper method `MongoQuery<Contact>.ContactIdFilter(memberIds)`. Phương thức này sử dụng toán tử `.In` (`Builders<T>.Filter.In(q => q.Id, ids)`) được MongoDB hỗ trợ đầy đủ và tối ưu cho việc query theo danh sách ID.

## Lưu ý khi sử dụng
- Khi cần query một danh sách Id trong MongoDB bằng driver C#, tuyệt đối không sử dụng `Where(x => list.Contains(x.Id))` vì có thể gây lỗi NotSupportedException ở một số phiên bản driver hoặc tuỳ ngữ cảnh sử dụng expression. 
- Luôn sử dụng `Builders<T>.Filter.In(q => q.Id, list)` hoặc các Specification Helpers đã định nghĩa (như `MongoQuery<T>.ContactIdFilter`) để đảm bảo tính ổn định và performance.
