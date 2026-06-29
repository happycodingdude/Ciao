# Dashboard (Trang chủ)

## Mục đích

Màn hình tổng quan hiển thị ngay sau khi đăng nhập, gom các thông tin quan trọng nhất vào một nơi, với trọng tâm là trạng thái online của bạn bè được cập nhật gần thời gian thực.

## Nội dung hiển thị

- **Lời chào và trạng thái bản thân:** avatar, tên, trạng thái của chính mình và số tin nhắn chưa đọc.
- **Thống kê nhanh:** số tin chưa đọc, số bạn bè đang online, số lời mời kết bạn đang chờ, tổng số bạn bè.
- **Lối tắt thao tác:** các nút truy cập nhanh.
- **Hội thoại gần đây:** tối đa 6 hội thoại có hoạt động mới nhất, kèm chấm trạng thái online.
- **Bạn bè đang online:** hàng avatar những người bạn đang online.
- **Lời mời kết bạn đang chờ:** danh sách lời mời cần duyệt.

## Trạng thái online (gần thời gian thực)

- "Online" nghĩa là **đang mở ứng dụng** (kể cả khi cửa sổ chạy nền), không cần đang xem trực tiếp.
- Khi đóng hẳn ứng dụng → người dùng tự chuyển sang offline sau một khoảng ngưỡng ngắn.
- Khi đăng xuất → chuyển offline ngay lập tức.
- Dashboard tự cập nhật trạng thái online của bạn bè định kỳ (trong khoảng nửa phút), kể cả khi cửa sổ không được xem trực tiếp — quay lại là thấy trạng thái mới.
- Mọi chỉ báo online trên Dashboard (danh sách bạn online và chấm trạng thái ở hội thoại gần đây) dùng **chung một nguồn**, cập nhật đồng nhất.

## Hành vi tương tác

- **Bạn bè đang online:** chỉ liệt kê người đang online. Bấm vào một avatar → mở hội thoại trực tiếp với người đó (tạo mới nếu hai người chưa từng nhắn). Có chặn bấm liên tục để tránh mở trùng.
- **Lời mời kết bạn đang chờ:** chấp nhận hoặc từ chối; danh sách phản hồi ngay lập tức rồi đồng bộ với máy chủ ở lần cập nhật kế tiếp.
- **Trạng thái rỗng:** mỗi phần có thông báo riêng khi không có dữ liệu (ví dụ "hiện không có bạn nào online").

## Hạn chế

- Trạng thái online theo cơ chế cập nhật định kỳ, nên có độ trễ tối đa cỡ một ngưỡng cộng một nhịp cập nhật — đủ tốt cho quy mô vừa, chưa phải tức thời.
