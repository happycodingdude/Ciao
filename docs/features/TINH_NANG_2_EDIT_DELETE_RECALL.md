# Sửa và thu hồi tin nhắn

> Trạng thái: Đã hoàn thành.

## Mục đích

Cho người dùng sửa nhanh tin nhắn gửi nhầm, hoặc thu hồi tin đã gửi cho mọi người trong một khoảng thời gian cho phép.

Phạm vi gồm **Sửa (edit)** và **Thu hồi (recall — xoá với mọi người)**. Không bao gồm "xoá chỉ ở phía mình".

## Sửa tin nhắn

- **Ai được sửa:** người đã gửi tin đó.
- **Áp dụng cho:** chỉ tin nhắn dạng văn bản (tin có ảnh/tệp không sửa được).
- **Thời hạn:** chỉ trong một khoảng thời gian sau khi gửi (mặc định 15 phút).
- **Sau khi sửa:** nội dung mới hiển thị cho mọi người trong hội thoại, kèm nhãn "đã chỉnh sửa".
- Không lưu và không cho xem lại nội dung gốc trước khi sửa.

## Thu hồi tin nhắn

- **Ai được thu hồi:** người gửi tin, hoặc quản trị viên trong nhóm.
- **Thời hạn:** chỉ trong một khoảng thời gian sau khi gửi (mặc định 15 phút).
- **Sau khi thu hồi:** nội dung và tệp đính kèm bị gỡ với mọi người, chỗ đó hiển thị "Tin nhắn đã được thu hồi".
  - Nếu tin đang được ghim → tự động bỏ ghim.
  - Ảnh/tệp đã thu hồi không còn xuất hiện trong thư viện đính kèm.
  - Tin trả lời (reply) trỏ tới tin đã thu hồi → phần trích dẫn cũng đổi thành "đã thu hồi" để không lộ nội dung cũ.
- Tin đã thu hồi không xuất hiện trong kết quả tìm kiếm.

## Quy tắc

- Thời hạn sửa/thu hồi được kiểm tra ở phía hệ thống; quá hạn thì nút thao tác bị ẩn và yêu cầu bị từ chối.
- Không thể sửa một tin đã bị thu hồi.
- Tin đang trong quá trình gửi (chưa hoàn tất) chưa cho sửa/thu hồi.

## Trường hợp đặc biệt

- **Sửa:** nội dung cập nhật ngay; không gửi thông báo đẩy mới (tránh làm phiền).
- **Thu hồi:** chờ hệ thống xác nhận rồi mới đổi hiển thị (do còn phụ thuộc kiểm tra thời hạn).
- Hai thiết bị của cùng người cùng sửa một lúc → kết quả nhất quán (bản mới nhất được áp dụng).
- Tin có ảnh/tệp chỉ thu hồi được, không sửa được.
