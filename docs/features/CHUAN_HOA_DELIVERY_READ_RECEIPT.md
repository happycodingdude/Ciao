# Trạng thái "Đã gửi / Đã nhận / Đã xem" của tin nhắn

## Mục đích

Cho người gửi biết tin nhắn của mình đang ở mức nào trong ba trạng thái: **Đã gửi → Đã nhận → Đã xem**, một cách đáng tin cậy.

## Hành vi

- Khi tin vừa gửi đi: hiển thị **Đã gửi**.
- Khi người nhận đã nhận được tin: chuyển sang **Đã nhận**.
- Khi người nhận đã xem tin: chuyển sang **Đã xem**.
- "Đã xem" ngầm bao hàm "Đã nhận" — đã xem thì chắc chắn đã nhận.

### Cách hiển thị

- **Trò chuyện 1-1:** lần lượt "Đã gửi" → "Đã nhận" → avatar của người nhận khi họ đã xem.
- **Nhóm:** khi nhiều người đã xem, hiển thị avatar của tối đa 3 người đã xem gần nhất, kèm phần đếm dư "+N".

## Quy tắc

- Trạng thái chỉ **tiến tới**, không bao giờ lùi lại — kể cả khi tín hiệu bị lặp hoặc đến không đúng thứ tự.
- Người gửi không tự nhận thông báo trạng thái cho chính tin của mình.
- Khi người dùng kết nối lại sau khi offline, chỉ cần đánh dấu tin cuối cùng đã nhận/đã xem; các tin trước đó được suy ra theo mốc thời gian.

## Trường hợp đặc biệt

- Người dùng dùng nhiều thiết bị/nhiều tab cùng lúc, tín hiệu đến lệch thứ tự → trạng thái vẫn đúng vì chỉ tiến tới.
- Đồng hồ máy người dùng bị lệch → hệ thống vẫn chỉ nâng trạng thái tiến tới, không bị nhảy lùi.
- Người rời nhóm rồi được thêm lại: trạng thái đã xem/đã nhận trước đó hiện được giữ nguyên (có thể điều chỉnh theo nghiệp vụ sau).
