# Tự động dọn trạng thái "đang online" cũ

## Mục đích

Giữ cho trạng thái online của người dùng phản ánh đúng thực tế: tự động chuyển những người được đánh dấu "đang online" nhưng thực chất đã rời đi từ lâu về trạng thái offline, để danh sách online không hiển thị sai.

## Hành vi

- Hệ thống định kỳ (mỗi phút) rà soát toàn bộ người dùng.
- Một người đang được đánh dấu "online" nhưng lần đăng nhập gần nhất đã quá **7 ngày** (hoặc chưa từng đăng nhập) sẽ được tự động chuyển thành "offline".
- Thời điểm "đăng xuất gần nhất" luôn được giữ nguyên, dùng để tính "người dùng đã offline bao lâu".

## Quy tắc

- Vừa đăng nhập → đánh dấu online; lần dọn kế tiếp bỏ qua vì còn mới.
- Đã đăng xuất → đã là offline; lần dọn bỏ qua.
- Online nhưng quá 7 ngày không đăng nhập lại (bị "kẹt" online) → bị chuyển về offline.

## Trường hợp đặc biệt

- Người dùng cũ chưa có dữ liệu "lần đăng nhập gần nhất" mà vẫn đang online → cũng được dọn, tránh bị kẹt online vĩnh viễn.
