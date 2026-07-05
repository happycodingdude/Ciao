# Kế hoạch triển khai — Phase 6: AI hỗ trợ trò chuyện

> **Cập nhật:** 2026-07-05 · **Nguồn:** [`PRODUCT_ROADMAP.md`](./PRODUCT_ROADMAP.md)
> Phạm vi: toàn bộ tính năng Phase 6 hiện **chưa làm**. Mô tả ở mức nghiệp vụ.

---

## 1. Phạm vi

| Tính năng | Trạng thái | Mục tiêu |
| --- | --- | --- |
| AI Summary | ⬜ | Tóm tắt cả cuộc trò chuyện |
| AI Catch Up | ⬜ | Tóm tắt tin nhắn bỏ lỡ |
| AI Smart Reply | ⬜ | Gợi ý câu trả lời |
| AI Translation | ⬜ | Dịch bằng AI |
| AI Search | ⬜ | Tìm kiếm theo ngữ nghĩa |
| AI Caption | ⬜ | Sinh mô tả cho ảnh |
| AI Sticker | ⬜ | Sinh sticker từ mô tả |

---

## 2. Các đợt triển khai

| Đợt | Mục tiêu | Rủi ro chính | Phụ thuộc | Rollback |
| --- | --- | --- | --- | --- |
| **Đợt 1** | AI Catch Up + AI Summary | Chất lượng tóm tắt, quyền riêng tư nội dung | Dịch vụ AI | Ẩn nút tóm tắt |
| **Đợt 2** | AI Smart Reply + AI Translation | Gợi ý lệch ngữ cảnh, chi phí | Dịch vụ AI | Ẩn gợi ý / nút dịch |
| **Đợt 3** | AI Search | Độ chính xác tìm kiếm ngữ nghĩa | Chỉ mục nội dung | Về tìm kiếm từ khóa |
| **Đợt 4** | AI Caption + AI Sticker | Nội dung sinh không phù hợp | Dịch vụ AI | Ẩn tính năng sinh |

> **Nguyên tắc chung Phase 6:** mọi tính năng AI phải minh bạch (người dùng biết đang dùng AI), tôn trọng quyền riêng tư (kiểm soát dữ liệu gửi đi), và luôn có phương án dùng ứng dụng bình thường khi AI không khả dụng.

---

## 3. Chi tiết nghiệp vụ

### 3.1 AI Catch Up (Tóm tắt tin bỏ lỡ)

- **Mục đích:** giúp bắt kịp nhanh sau khi vắng mặt.
- **Hành vi:** với các tin chưa đọc, người dùng chọn "Tóm tắt tin bỏ lỡ" → nhận bản tóm tắt ngắn các ý chính; có lối nhảy tới tin gốc liên quan.
- **Input:** tập tin chưa đọc. **Output:** bản tóm tắt các điểm chính.
- **Quy tắc:** chỉ tóm tắt nội dung người dùng có quyền xem; nêu rõ đây là nội dung do AI tạo.
- **Trường hợp đặc biệt:** quá ít tin → không cần tóm tắt; nội dung nhạy cảm → xử lý theo chính sách riêng tư.
- **Hạn chế:** tóm tắt có thể bỏ sót sắc thái; luôn cho xem nội dung gốc.

### 3.2 AI Summary (Tóm tắt cuộc trò chuyện)

- **Mục đích:** nắm nhanh nội dung một đoạn/cả hội thoại dài.
- **Hành vi:** chọn khoảng thời gian/đoạn hội thoại → nhận tóm tắt theo chủ đề, quyết định, việc cần làm (nếu có).
- **Input:** đoạn hội thoại được chọn. **Output:** bản tóm tắt có cấu trúc.
- **Quy tắc:** minh bạch nguồn nội dung; không suy diễn thông tin ngoài hội thoại.
- **Trường hợp đặc biệt:** hội thoại rất dài → tóm tắt phân đoạn; nhiều ngôn ngữ → tóm tắt theo ngôn ngữ người dùng.
- **Hạn chế:** độ chính xác phụ thuộc chất lượng dịch vụ AI.

### 3.3 AI Smart Reply (Gợi ý trả lời)

- **Mục đích:** trả lời nhanh trong ngữ cảnh.
- **Hành vi:** dựa trên tin gần nhất → gợi ý vài câu trả lời ngắn; người dùng chọn để chèn vào ô soạn, có thể chỉnh trước khi gửi.
- **Input:** ngữ cảnh hội thoại gần nhất. **Output:** danh sách gợi ý trả lời.
- **Quy tắc:** gợi ý chỉ là đề xuất, không tự gửi; tôn trọng giọng điệu phù hợp.
- **Trường hợp đặc biệt:** ngữ cảnh mơ hồ → gợi ý trung tính hoặc bỏ qua.
- **Hạn chế:** gợi ý có thể không sát ý; luôn cho phép tự soạn.

### 3.4 AI Translation (Dịch bằng AI)

- **Mục đích:** dịch chất lượng cao, tự nhiên hơn.
- **Hành vi:** dịch tin sang ngôn ngữ ưu tiên; có thể bật dịch tự động cho hội thoại khác ngôn ngữ; giữ bản gốc song song.
- **Input:** tin + ngôn ngữ đích. **Output:** bản dịch.
- **Quy tắc:** không thay thế bản gốc; nêu rõ là bản dịch AI.
- **Trường hợp đặc biệt:** thuật ngữ/tiếng lóng → có thể sai sắc thái; nội dung phi văn bản → bỏ qua.
- **Hạn chế:** bổ sung cho tính năng dịch cơ bản ở Phase 2; phát sinh chi phí theo lượng dùng.

### 3.5 AI Search (Tìm kiếm ngữ nghĩa)

- **Mục đích:** tìm nội dung theo ý nghĩa, không chỉ trùng từ khóa.
- **Hành vi:** nhập mô tả tự nhiên → trả về tin/nội dung liên quan về mặt ngữ nghĩa, kèm ngữ cảnh và lối nhảy tới tin gốc.
- **Input:** truy vấn ngôn ngữ tự nhiên. **Output:** kết quả liên quan theo ngữ nghĩa.
- **Quy tắc:** chỉ tìm trong phạm vi người dùng có quyền; kết hợp với tìm kiếm từ khóa hiện có.
- **Trường hợp đặc biệt:** không có kết quả liên quan → gợi ý thu hẹp/mở rộng truy vấn.
- **Hạn chế:** cần xây dựng chỉ mục nội dung; độ trễ cập nhật chỉ mục cần kiểm soát.

### 3.6 AI Caption (Sinh mô tả ảnh)

- **Mục đích:** hỗ trợ mô tả ảnh (tiện lợi + tiếp cận cho người khiếm thị).
- **Hành vi:** khi gửi/xem ảnh → tùy chọn sinh mô tả ngắn cho ảnh; người dùng có thể chỉnh sửa mô tả.
- **Input:** ảnh. **Output:** mô tả gợi ý.
- **Quy tắc:** minh bạch là mô tả AI; cho phép chỉnh/không dùng.
- **Trường hợp đặc biệt:** ảnh không rõ nội dung → mô tả tổng quát; nội dung nhạy cảm → xử lý theo chính sách.
- **Hạn chế:** mô tả có thể chưa chính xác tuyệt đối.

### 3.7 AI Sticker (Sinh sticker từ mô tả)

- **Mục đích:** tạo sticker cá nhân hóa theo yêu cầu.
- **Hành vi:** nhập mô tả → sinh sticker theo mô tả; có thể lưu vào bộ sticker cá nhân và gửi.
- **Input:** mô tả văn bản. **Output:** sticker được tạo.
- **Quy tắc:** kiểm duyệt nội dung sinh ra; tôn trọng bản quyền/nguyên tắc cộng đồng.
- **Trường hợp đặc biệt:** mô tả vi phạm chính sách → từ chối sinh.
- **Hạn chế:** dựa trên nền tảng Sticker (Phase 2); chất lượng phụ thuộc dịch vụ sinh ảnh.

---

## 4. Rủi ro & lưu ý vận hành

- **Quyền riêng tư dữ liệu:** minh bạch nội dung nào được gửi cho AI; cho phép người dùng kiểm soát/tắt.
- **Chi phí & độ trễ:** tính năng AI có chi phí và độ trễ → cần giới hạn hợp lý và phản hồi trạng thái đang xử lý.
- **Độ tin cậy:** luôn coi kết quả AI là hỗ trợ, giữ nguyên nội dung gốc và cho phép người dùng chỉnh/không dùng.
- **Kiểm duyệt:** nội dung sinh (caption, sticker) cần lớp kiểm duyệt trước khi hiển thị/gửi.

---

## 5. Liên kết

- Roadmap tổng: [`PRODUCT_ROADMAP.md`](./PRODUCT_ROADMAP.md)
