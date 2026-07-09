# Chatbox — Bám đáy khi tải lại / gửi / nhận tin

## Mục đích
Đảm bảo khung chat luôn cuộn xuống đáy đúng lúc:
- Khi mở / tải lại hội thoại.
- Khi người dùng gửi tin.
- Khi nhận tin mới trong lúc đang ở đáy.

## Hành vi nghiệp vụ
- Mở hoặc tải lại hội thoại → hiển thị ngay tin mới nhất ở đáy.
- Đang ở (hoặc gần) đáy mà có nội dung cao thêm — kể cả ảnh, thẻ xem trước liên kết tải chậm sau đó — thì khung chat **tự bám đáy**, không kẹt giữa chừng.
- Người dùng **chủ động cuộn lên** đọc lịch sử → khung chat **giữ nguyên vị trí**, không bị kéo xuống khi có tin mới; hiện nút "cuộn xuống đáy" để quay lại.
- Gửi tin của chính mình → luôn kéo xuống đáy để thấy tin vừa gửi.

## Trường hợp đặc biệt đã xử lý
- Tin có ảnh / thẻ xem trước liên kết tải bất đồng bộ (chiều cao tăng dần sau khi đã cuộn): khung chat vẫn bám sát đáy trong suốt quá trình tải, không dừng lại giữa chừng.
- Đang tải trang tin cũ hơn (cuộn lên lịch sử): giữ nguyên vị trí đọc, không tự bám đáy.
- **Cuộn lên tải thêm tin cũ (load more): khung chat GIỮ NGUYÊN vị trí đang đọc, KHÔNG bị kéo xuống đáy.** Vị trí đọc được neo theo **chính tin nhắn người dùng đang nhìn** (không dựa vào số đo tổng chiều cao — số đo này sai lệch khi ảnh trong trang cũ chưa tải xong). Sau khi tải thêm, hệ thống coi người dùng **đang xem lịch sử** bất kể vị trí hình học còn cách đáy bao nhiêu; cơ chế bám-đáy tuyệt đối không kích hoạt cho tới khi người dùng TỰ cuộn về đáy. Nhờ vậy hội thoại nhiều ảnh / thẻ xem trước tải chậm không còn bị giật xuống đáy sau khi tải trang cũ.
- **Tin cũ tải về trong lúc người dùng vẫn đang cuộn tiếp:** vị trí neo được cập nhật liên tục theo thao tác cuộn, nên khi trang cũ chèn vào, khung nhìn giữ đúng chỗ người dùng đang đọc tại thời điểm đó (không quay về chỗ lúc bắt đầu tải).
- **Tải trang cũ thất bại (mất mạng) hoặc trang rỗng:** trạng thái chờ được dọn sạch, các lần tải sau và cơ chế bám đáy hoạt động lại bình thường, không bị khoá.
- **Tải thêm tin cũ chỉ diễn ra khi người dùng đã rời khỏi đáy (đang thực sự xem lịch sử).** Khi còn đứng ở đáy xem tin mới nhất, hệ thống KHÔNG tự tải trang cũ. Điều này đặc biệt quan trọng với hội thoại ngắn (tổng nội dung chỉ hơn một màn hình): trước đây tin cũ có thể tự nạp ngay cả khi đang ở đáy, và khi ảnh / thẻ xem trước trong tin cũ tải xong sẽ kéo khung chat giật xuống đáy — nay đã hết.
- Chuyển sang hội thoại khác: đặt lại về trạng thái bám đáy cho hội thoại mới.

## Quy tắc "rời đáy"
Khung chat chỉ **ngừng bám đáy** khi người dùng **thực sự cuộn lên**. Việc nội dung cao thêm ở phía dưới (ảnh / thẻ preview tải xong) không được coi là hành động rời đáy — đây là điểm mấu chốt tránh lỗi kẹt giữa chừng khi tải lại hoặc gửi/nhận tin có liên kết.

## Hạn chế
- Ảnh trong thẻ xem trước tải chậm (lazy). Trong tích tắc đầu khi ảnh chưa có kích thước, chiều cao có thể thay đổi — khung chat sẽ tự bù để bám đáy nên người dùng không thấy giật.
