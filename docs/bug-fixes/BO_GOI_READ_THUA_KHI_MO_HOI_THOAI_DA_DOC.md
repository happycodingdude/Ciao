# Bỏ Gọi Read Thừa Khi Mở Hội Thoại Đã Đọc

## Mục đích
Loại bỏ việc tự động gửi tín hiệu "đã đọc" (read receipt) mỗi khi mở một hội thoại, kể cả khi hội thoại đó đã được đọc trước đó. Trước khi sửa, mỗi lần chọn vào một hội thoại đều phát sinh một lượt đánh dấu đã đọc, gây request thừa dù trạng thái đã đọc không thay đổi.

## Phạm vi
- Chỉ áp dụng cho hành vi tự động đánh dấu đã đọc khi người dùng đang xem tin nhắn ở cuối hội thoại.
- Không thay đổi cách hiển thị trạng thái đã đọc, không thay đổi cách đếm số hội thoại chưa đọc, không thay đổi giao diện.

## Hành vi trước khi sửa
- Khi mở một hội thoại và đang ở đáy màn hình, hệ thống luôn gửi tín hiệu đã đọc cho tin nhắn cuối cùng, ngay cả khi tin nhắn cuối đó đã nằm trong phạm vi đã đọc của chính người dùng.

## Hành vi sau khi sửa
Tín hiệu đã đọc chỉ được gửi khi thỏa mãn đồng thời các điều kiện:
1. Tin nhắn cuối cùng không phải do chính người dùng gửi.
2. Tin nhắn cuối cùng nằm SAU mốc đã đọc hiện tại của người dùng (tức là thực sự còn tin chưa đọc).

Nếu hội thoại đã được đọc tới tin nhắn cuối, hệ thống không gửi thêm tín hiệu đã đọc.

## Quy tắc xác định "đã đọc"
- Mốc đã đọc lấy theo thời điểm xem gần nhất của chính người dùng trong hội thoại; nếu không có sẽ lấy mốc xem chung của hội thoại.
- Đây cũng chính là mốc dùng để hiển thị vạch "Tin nhắn mới", đảm bảo hai nơi luôn nhất quán.

## Trường hợp đặc biệt
- Có tin nhắn mới đến trong lúc đang xem: tin mới nằm sau mốc đã đọc nên vẫn được đánh dấu đã đọc như bình thường.
- Còn tin chưa đọc bị ẩn sau nút "n tin nhắn mới": chưa gửi tín hiệu đã đọc cho tới khi người dùng bấm mở phần tin mới.
- Tin nhắn cuối do chính người dùng gửi: không gửi tín hiệu đã đọc.
- Chưa xác định được mốc đã đọc (dữ liệu hội thoại chưa sẵn sàng): giữ nguyên hành vi cũ để không bỏ sót việc đánh dấu đã đọc.

## Hạn chế
- Việc xác định "đã đọc" dựa trên trạng thái đã có ở phía client tại thời điểm mở hội thoại; trong trường hợp trạng thái này chưa kịp cập nhật, hệ thống ưu tiên gửi tín hiệu đã đọc để tránh bỏ sót.
