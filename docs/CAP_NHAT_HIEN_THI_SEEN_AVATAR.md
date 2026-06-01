# CẬP NHẬT HIỂN THỊ SEEN AVATAR

## Mục đích
Cập nhật UI hiển thị trạng thái "Seen" (đã xem) trong tin nhắn từ việc hiển thị tên người dùng sang hiển thị Avatar, giúp giao diện gọn gàng và tương đồng với UX của các ứng dụng chat phổ biến (như Messenger).

## Cách hoạt động
- Trong file `client/src/components/message/MessageContent.tsx`, hàm `getReceiptStatus` được viết lại để trả về ReactNode (JSX) thay vì `string`.
- Đối với Group Chat: Lấy tối đa 3 thành viên đã xem tin nhắn gần nhất và hiển thị dạng danh sách avatar tròn nhỏ nằm cạnh nhau, có số lượng dư hiển thị ở cuối (`+N`).
- Đối với 1-1 Chat: Trả về avatar của người nhận nếu họ đã xem.
- Khi không có avatar sẽ tự động sử dụng fallback từ `ui-avatars.com`.
- Trạng thái "Sent" và "Delivered" vẫn hiển thị dạng text bình thường.

## Thay đổi
- `MessageContent.tsx`: Đổi wrapper chứa status từ `span` sang `div` để hỗ trợ hiển thị flex. Update logic trong hàm `getReceiptStatus`.
