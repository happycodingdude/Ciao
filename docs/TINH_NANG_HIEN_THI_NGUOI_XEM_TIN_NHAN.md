# Tính năng Hiển thị Người Xem Tin Nhắn

## Mục đích
Hoàn thiện 20% còn lại của Tính năng 1 (Delivery/Read receipts) bằng cách hiển thị trạng thái đã gửi, đã nhận và đã xem trên giao diện Chat. 

## Cách hoạt động
- **Direct Chat**: Hiển thị trạng thái "Sent", "Delivered" hoặc "Seen" phía dưới tin nhắn cuối cùng người dùng gửi, phụ thuộc vào `lastDeliveredTime` và `lastSeenTime` của người nhận.
- **Group Chat**: Hiển thị danh sách người đã xem (ví dụ: "Seen by A, B" hoặc "Seen by A, B + 5") phụ thuộc vào `lastSeenTime` của từng thành viên trong nhóm so với thời gian tin nhắn được tạo.

## Cách sử dụng
- Tính năng hoạt động hoàn toàn tự động dựa trên events và data lưu tại `conversation.members`.
- Chỉ cập nhật hiển thị ở tin nhắn cuối cùng (mới nhất) mà người dùng gửi (`isLastFromMe`) để giao diện gọn gàng.
