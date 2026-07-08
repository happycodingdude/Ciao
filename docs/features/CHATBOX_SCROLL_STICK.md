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
- **Cuộn lên tải thêm tin cũ (load more): khung chat GIỮ NGUYÊN vị trí đang đọc, KHÔNG bị kéo xuống đáy.** Trang tin cũ được chèn ở phía trên; vị trí đọc được bù chính xác nên nội dung không nhảy. Cơ chế bám-đáy-khi-cao-thêm chỉ áp dụng cho nội dung tăng ở PHÍA DƯỚI (ảnh/thẻ tải xong), tuyệt đối không kích hoạt cho đợt tin cũ chèn ở phía trên.
- **Tải thêm tin cũ chỉ diễn ra khi người dùng đã rời khỏi đáy (đang thực sự xem lịch sử).** Khi còn đứng ở đáy xem tin mới nhất, hệ thống KHÔNG tự tải trang cũ. Điều này đặc biệt quan trọng với hội thoại ngắn (tổng nội dung chỉ hơn một màn hình): trước đây tin cũ có thể tự nạp ngay cả khi đang ở đáy, và khi ảnh / thẻ xem trước trong tin cũ tải xong sẽ kéo khung chat giật xuống đáy — nay đã hết.
- Chuyển sang hội thoại khác: đặt lại về trạng thái bám đáy cho hội thoại mới.

## Quy tắc "rời đáy"
Khung chat chỉ **ngừng bám đáy** khi người dùng **thực sự cuộn lên**. Việc nội dung cao thêm ở phía dưới (ảnh / thẻ preview tải xong) không được coi là hành động rời đáy — đây là điểm mấu chốt tránh lỗi kẹt giữa chừng khi tải lại hoặc gửi/nhận tin có liên kết.

## Hạn chế
- Ảnh trong thẻ xem trước tải chậm (lazy). Trong tích tắc đầu khi ảnh chưa có kích thước, chiều cao có thể thay đổi — khung chat sẽ tự bù để bám đáy nên người dùng không thấy giật.
