# Hiển thị trạng thái "Đã xem" bằng avatar

## Mục đích

Hiển thị trạng thái "đã xem" của tin nhắn bằng ảnh đại diện (avatar) của người xem thay vì bằng tên, giúp giao diện gọn gàng và quen thuộc như các ứng dụng chat phổ biến.

## Hành vi

- **Nhóm:** hiển thị avatar tròn nhỏ của những người đã xem tin gần nhất, tối đa 3 người đặt cạnh nhau; nếu còn nhiều hơn thì hiển thị thêm phần đếm dư dạng "+N".
- **Trò chuyện 1-1:** hiển thị avatar của người nhận khi họ đã xem tin.
- Người dùng không có avatar → tự động dùng một ảnh đại diện thay thế.
- Các trạng thái "Đã gửi" và "Đã nhận" vẫn hiển thị bằng chữ như bình thường.

## Trường hợp đặc biệt

- Khi chưa có ai xem tin → không hiển thị avatar nào ở trạng thái "đã xem".
