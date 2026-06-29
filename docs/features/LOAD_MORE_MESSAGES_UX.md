# Tải tin nhắn cũ trong khung chat

## Mục đích

Cải thiện trải nghiệm khi xem lại lịch sử tin nhắn: người dùng cuộn lên xem tin cũ mà không phải đứng đợi, và luôn biết khi nào hệ thống đang tải thêm.

## Hành vi

- Khi người dùng cuộn lên gần đầu khung chat (còn cách khoảng một màn hình), hệ thống **tự động tải trước** phần tin nhắn cũ hơn — đến lúc cuộn tới nơi thì tin đã sẵn sàng, không phải chờ.
- Trong lúc đang tải, hiển thị một lớp hiệu ứng sáng mờ ở mép trên khung chat kèm dòng chữ báo "đang tải tin cũ".
- Khi tin cũ được chèn thêm vào đầu danh sách, **vị trí đang đọc được giữ nguyên** — màn hình không bị nhảy.

## Trường hợp đặc biệt

- Chỉ tải thêm khi vẫn còn tin cũ hơn; khi đã tới tin đầu tiên của hội thoại thì dừng.
- Lớp hiệu ứng "đang tải" chỉ mang tính hiển thị, không che hay chặn thao tác của người dùng.
