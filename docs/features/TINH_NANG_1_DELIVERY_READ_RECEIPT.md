# Trạng thái "Đã gửi / Đã nhận / Đã xem" của tin nhắn

> Trạng thái: Đã hoàn thành.

## Mục đích

Cho người gửi biết tin nhắn của mình đang ở mức nào: đã gửi đi, đã tới người nhận, hay đã được người nhận xem — giúp việc trò chuyện đáng tin cậy hơn.

## Ba mức trạng thái

1. **Đã gửi:** tin đã được gửi đi thành công.
2. **Đã nhận:** tin đã tới thiết bị của người nhận.
3. **Đã xem:** người nhận đã thực sự mở hội thoại và nhìn thấy tin.

"Đã xem" ngầm bao hàm "Đã nhận".

## Hành vi

- Việc mở/đọc lại danh sách tin **không** tự đánh dấu "đã xem"; chỉ khi người dùng thực sự xem tới tin mới nhất thì mới tính là đã xem.
- Khi người dùng kết nối lại sau khi offline, chỉ cần đánh dấu tin cuối cùng đã nhận/đã xem; các tin trước đó được suy ra theo mốc thời gian.
- Người gửi không tự nhận thông báo trạng thái cho chính tin của mình.

### Cách hiển thị

- **Trò chuyện 1-1:** lần lượt "Đã gửi" → "Đã nhận" → avatar người nhận khi họ đã xem.
- **Nhóm:** khi nhiều người đã xem, hiển thị avatar tối đa 3 người đã xem gần nhất kèm phần đếm dư "+N".

## Quy tắc

- Trạng thái chỉ **tiến tới**, không bao giờ lùi — kể cả khi tín hiệu bị lặp hoặc đến không đúng thứ tự.

## Trường hợp đặc biệt

- Nhiều thiết bị/tab cùng một người, tín hiệu đến lệch thứ tự → trạng thái vẫn đúng vì chỉ tiến tới.
- Đồng hồ máy người dùng lệch → hệ thống vẫn chỉ nâng trạng thái tiến tới.

## Hạn chế / hướng mở rộng

- Bảng "Đã xem bởi những ai" chi tiết cho nhóm (khi bấm vào) thuộc phần nâng cấp sau, chưa có ở bản hiện tại.
