# Media — Phân loại Ảnh / Video / File / Liên kết

> **Cập nhật:** 2026-07-11 · Thuộc Phase 3 — Cá nhân hóa (Đợt 2a) · Kế hoạch gốc: [`KE_HOACH_PHASE_3_CA_NHAN_HOA.md`](./KE_HOACH_PHASE_3_CA_NHAN_HOA.md)

## Các giai đoạn thực hiện

| Phase | Nội dung | Mục tiêu | Trạng thái |
| --- | --- | --- | --- |
| 1 | Chuẩn bị dữ liệu liên kết | Cung cấp danh sách liên kết của hội thoại theo trang, loại bỏ tin đã thu hồi | ✅ Xong (2026-07-09) |
| 2 | Phân loại media trong thông tin hội thoại | Người dùng thấy 4 nhóm Ảnh / Video / File / Liên kết ngay trong panel thông tin | ✅ Code xong (2026-07-11) — chờ nghiệm thu |
| 3 | Bộ lọc trong kho media | Xem toàn bộ media theo từng loại, đúng loại đang quan tâm | ✅ Code xong (2026-07-11) — chờ nghiệm thu |

## Mục đích

Trước đây mục "Attachments" trong thông tin hội thoại gom mọi loại tệp vào một danh sách duy nhất, và kho media chỉ lọc được Ảnh/File. Người dùng khó tìm lại một video, một tài liệu hay một đường link đã gửi. Tính năng này phân loại media thành 4 nhóm rõ ràng ở cả hai nơi: phần xem nhanh và kho media đầy đủ.

## Phạm vi

- Panel thông tin hội thoại: phần xem nhanh media.
- Kho media của hội thoại (mở từ "View all" hoặc biểu tượng trên đầu khung chat).
- Áp dụng cho cả chat 1-1 và chat nhóm.

## Hành vi nghiệp vụ

### Xem nhanh trong thông tin hội thoại

- Mục Attachments cũ được thay bằng **4 mục riêng: Images, Videos, Files, Links**.
- Mỗi mục hiển thị **tối đa 8 mục mới nhất**; tiêu đề mục luôn hiển thị, nếu chưa có nội dung thì ghi chú ngắn (ví dụ "No images yet").
- Ảnh hiển thị dạng lưới, bấm vào phóng to và lướt xem các ảnh khác.
- Video hiển thị khung hình đầu kèm nút phát; bấm vào mở video.
- File hiển thị tên kèm dung lượng; bấm vào mở/tải file.
- Liên kết hiển thị hình thu nhỏ, tiêu đề trang và tên trang nguồn; bấm vào mở trang ở thẻ mới.
- Mỗi mục có nút **View all** mở kho media và tự chọn đúng loại tương ứng.

### Kho media (bộ lọc 4 loại)

- Trên đầu có **4 nút lọc: Images / Files / Videos / Links**; chỉ hiển thị nội dung đúng loại đang chọn.
- Nội dung nhóm theo ngày gửi, mới nhất lên trước.
- Liên kết tải theo trang; khi còn dữ liệu sẽ có nút **Load more** để xem thêm.
- Mặc định mở ở loại **Images**; đóng kho media rồi mở lại từ biểu tượng trên đầu khung chat sẽ về mặc định này. Mở từ "View all" thì vào thẳng loại tương ứng.
- Đang xem một loại mà hội thoại nhận thêm tệp mới → vẫn giữ nguyên loại đang xem, không tự nhảy về Images.

## Luồng sử dụng

1. Mở hội thoại → mở "Chat information".
2. Xem nhanh 4 nhóm media; cần xem đầy đủ → bấm "View all" của nhóm đó.
3. Trong kho media, đổi loại bằng 4 nút lọc trên đầu; với Liên kết bấm "Load more" để tải thêm.
4. Bấm vào một mục để xem: ảnh phóng to tại chỗ, video/file/liên kết mở ở thẻ mới.

## Input/Output

- **Input:** hội thoại đang mở; thao tác chọn nhóm/bộ lọc; yêu cầu tải thêm liên kết.
- **Output:** danh sách media đúng loại, nhóm theo ngày (kho media) hoặc 8 mục mới nhất (xem nhanh); liên kết trả kèm tiêu đề, mô tả, hình thu nhỏ và tên trang nguồn nếu có.

## Quy tắc validate

- Liên kết lấy từ tin nhắn có thẻ xem trước; tin đã thu hồi không xuất hiện trong danh sách.
- Liên kết luôn mở ở thẻ mới và không cho trang đích truy cập ngược lại ứng dụng.
- Danh sách liên kết phân trang; chỉ tải khi người dùng thực sự mở đúng nơi cần dữ liệu.

## Các trường hợp đặc biệt

- Hội thoại chưa có loại media nào → mục đó vẫn hiển thị tiêu đề kèm ghi chú trống, không ẩn mục.
- Liên kết không có hình thu nhỏ → dùng biểu tượng thay thế; không có tiêu đề → hiển thị chính đường dẫn.
- File không rõ dung lượng → chỉ hiển thị tên.
- Đổi sang hội thoại khác khi kho media đang mở → quay về panel thông tin, không tải dữ liệu thừa cho hội thoại mới.

## Hạn chế

- Video mở ở thẻ mới của trình duyệt, chưa phát trong khung phóng to của ứng dụng.
- Nhóm Ảnh/Video/File trong kho media hiển thị toàn bộ dữ liệu đã tải của hội thoại (không phân trang riêng); chỉ nhóm Liên kết có tải thêm theo trang.

## Vấn đề đã biết (chưa xử lý)

- **Hình thu nhỏ của Liên kết lỗi tải (ghi nhận 2026-07-11):** danh sách Liên kết hiển thị icon ảnh vỡ thay vì hình thu nhỏ của trang đích (ví dụ các link CELLPHONES). Nguyên nhân khả dĩ: trang nguồn chặn tải ảnh từ nơi khác (hotlink/referrer) hoặc đường dẫn hình trong thẻ xem trước không còn hiệu lực. Hướng xử lý dự kiến: khi hình tải lỗi thì tự thay bằng biểu tượng liên kết mặc định (hiện fallback chỉ áp dụng khi thiếu hẳn đường dẫn hình, chưa áp dụng khi hình có nhưng tải lỗi).
