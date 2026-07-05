# Kế hoạch triển khai — Phase 2: Làm cuộc trò chuyện sinh động hơn

> **Cập nhật:** 2026-07-05 · **Nguồn:** [`PRODUCT_ROADMAP.md`](./PRODUCT_ROADMAP.md)
> Kế hoạch nghiệp vụ Phase 2 kèm trạng thái triển khai của từng tính năng.
>
> ✅ **Đã hoàn thành:** Sticker, GIF, Bình chọn, Chia sẻ danh bạ, Dịch tin nhắn — xem hành vi nghiệp vụ chi tiết ở
> [`TINH_NANG_PHASE_2_STICKER_GIF_POLL_CONTACT_TRANSLATE.md`](./TINH_NANG_PHASE_2_STICKER_GIF_POLL_CONTACT_TRANSLATE.md).
> ⬜ **Chưa triển khai (giữ nguyên trong kế hoạch):** Đợt 2 — Tin nhắn thoại, Preview Link.

---

## 1. Phạm vi

| Tính năng | Trạng thái | Mục tiêu |
| --- | --- | --- |
| Sticker | ✅ Hoàn thành | Bộ sticker + sticker yêu thích |
| GIF | ✅ Hoàn thành | Tìm kiếm và gửi GIF động |
| Tin nhắn thoại | ⬜ Chưa triển khai | Ghi âm, hiển thị dạng sóng, phát lại |
| Preview Link | ⬜ Chưa triển khai | Thumbnail + tiêu đề + mô tả cho liên kết |
| Bình chọn (Poll) | ✅ Hoàn thành | Tạo bình chọn trong hội thoại |
| Chia sẻ danh bạ | ✅ Hoàn thành | Gửi thẻ liên hệ |
| Dịch tin nhắn | ✅ Hoàn thành | Dịch nội dung tin nhắn |

---

## 2. Các đợt triển khai

| Đợt | Mục tiêu | Trạng thái | Rủi ro chính | Phụ thuộc | Rollback |
| --- | --- | --- | --- | --- | --- |
| **Đợt 1** | Sticker + GIF | ✅ Hoàn thành | Bản quyền/nguồn nội dung, dung lượng | Kho sticker/GIF | Ẩn bảng chọn sticker/GIF |
| **Đợt 2** | Tin nhắn thoại + Preview Link | ⬜ Chưa triển khai | Xử lý media nặng, tải nội dung ngoài | Lưu trữ media | Tắt ghi âm / tắt preview |
| **Đợt 3** | Bình chọn + Chia sẻ danh bạ | ✅ Hoàn thành | Quyền riêng tư (danh bạ) | Quyền thiết bị | Ẩn tùy chọn tương ứng |
| **Đợt 4** | Dịch tin nhắn | ✅ Hoàn thành | Chất lượng dịch, chi phí dịch vụ | Dịch vụ dịch | Ẩn nút dịch |

---

## 3. Chi tiết nghiệp vụ

### 3.1 Sticker — ✅ Hoàn thành

- **Mục đích:** biểu đạt cảm xúc phong phú hơn emoji.
- **Hành vi:** chọn sticker từ bảng sticker → gửi như một loại tin nhắn riêng; có mục "yêu thích" để dùng nhanh; sticker hiển thị nổi bật, không bọc bong bóng như văn bản.
- **Input:** sticker được chọn. **Output:** tin nhắn sticker trong hội thoại.
- **Quy tắc:** sticker gửi độc lập (không kèm văn bản); danh sách yêu thích giới hạn số lượng hợp lý.
- **Trường hợp đặc biệt:** sticker không tải được → hiển thị placeholder.
- **Hạn chế:** giai đoạn đầu dùng bộ sticker có sẵn, chưa cho người dùng tự tải lên.

### 3.2 GIF — ✅ Hoàn thành

- **Mục đích:** gửi ảnh động biểu cảm.
- **Hành vi:** tìm kiếm GIF theo từ khóa, xem trước, chọn để gửi; GIF hiển thị và tự phát trong hội thoại.
- **Input:** từ khóa tìm kiếm / GIF được chọn. **Output:** tin nhắn GIF.
- **Quy tắc:** giới hạn dung lượng để tránh chậm; kết quả tìm kiếm phân trang.
- **Trường hợp đặc biệt:** không có kết quả → trạng thái rỗng; mạng chậm → hiển thị đang tải.
- **Hạn chế:** phụ thuộc nguồn cung cấp GIF bên ngoài.

### 3.3 Tin nhắn thoại — ⬜ Chưa triển khai

- **Mục đích:** gửi tin bằng giọng nói khi không tiện gõ.
- **Hành vi:** nhấn giữ để ghi âm, thả để gửi (hoặc thao tác dừng/gửi); hiển thị thời lượng và dạng sóng; người nhận nhấn để phát lại kèm thanh tiến trình.
- **Input:** đoạn ghi âm. **Output:** tin nhắn thoại phát lại được.
- **Quy tắc:** cần cấp quyền micro; giới hạn thời lượng tối đa; cho phép hủy trước khi gửi.
- **Trường hợp đặc biệt:** từ chối quyền micro → thông báo hướng dẫn; ghi âm quá ngắn → hủy.
- **Hạn chế:** chưa hỗ trợ chuyển giọng nói thành văn bản ở giai đoạn này.

### 3.4 Preview Link — ⬜ Chưa triển khai

- **Mục đích:** hiển thị liên kết trực quan (ảnh, tiêu đề, mô tả) thay vì URL trần.
- **Hành vi:** khi tin chứa liên kết → tự sinh thẻ xem trước (thumbnail, tiêu đề, mô tả, tên miền); nhấn vào mở liên kết.
- **Input:** liên kết trong nội dung tin. **Output:** thẻ xem trước đính kèm tin.
- **Quy tắc:** chỉ xử lý liên kết hợp lệ; lấy dữ liệu xem trước một lần và dùng lại.
- **Trường hợp đặc biệt:** liên kết không lấy được metadata → hiển thị liên kết thường; nhiều liên kết → ưu tiên liên kết đầu.
- **Hạn chế:** một số trang chặn lấy metadata → không có xem trước.

### 3.5 Bình chọn (Poll) — ✅ Hoàn thành

- **Mục đích:** ra quyết định nhóm nhanh.
- **Hành vi:** người tạo đặt câu hỏi + các lựa chọn; thành viên bỏ phiếu; hiển thị số phiếu và tỷ lệ theo thời gian thực; có thể cho chọn một hoặc nhiều đáp án.
- **Input:** câu hỏi + lựa chọn + phiếu bầu. **Output:** kết quả bình chọn cập nhật.
- **Quy tắc validate:** tối thiểu hai lựa chọn; cấu hình cho phép đổi phiếu hay không; ai được đóng bình chọn.
- **Trường hợp đặc biệt:** người tạo đóng bình chọn → khóa bỏ phiếu; thành viên rời nhóm → phiếu vẫn giữ.
- **Hạn chế:** bình chọn ẩn danh thuộc phạm vi Phase 5.

### 3.6 Chia sẻ danh bạ — ✅ Hoàn thành

- **Mục đích:** giới thiệu/chuyển thông tin liên hệ nhanh.
- **Hành vi:** chọn một liên hệ để gửi dưới dạng thẻ (tên, ảnh, thông tin cơ bản); người nhận có thể xem và bắt đầu trò chuyện/ kết bạn.
- **Input:** liên hệ được chọn. **Output:** thẻ danh bạ trong hội thoại.
- **Quy tắc:** chỉ chia sẻ thông tin được phép; tôn trọng quyền riêng tư của người được chia sẻ.
- **Trường hợp đặc biệt:** người được chia sẻ chưa có tài khoản → thẻ ở dạng thông tin tối thiểu.
- **Hạn chế:** phạm vi thông tin thẻ giới hạn theo chính sách riêng tư.

### 3.7 Dịch tin nhắn — ✅ Hoàn thành

- **Mục đích:** giao tiếp xuyên ngôn ngữ.
- **Hành vi:** chọn "Dịch" trên một tin → hiển thị bản dịch sang ngôn ngữ ưu tiên của người dùng; có thể ẩn/hiện bản gốc.
- **Input:** tin cần dịch + ngôn ngữ đích. **Output:** bản dịch hiển thị kèm tin.
- **Quy tắc:** giữ nguyên bản gốc; bản dịch là lớp phủ, không thay thế nội dung gốc.
- **Trường hợp đặc biệt:** không phát hiện được ngôn ngữ → dùng mặc định; nội dung không dịch được (chỉ emoji/sticker) → bỏ qua.
- **Hạn chế:** chất lượng phụ thuộc dịch vụ dịch; có thể phát sinh chi phí theo lượng dùng.

---

## 4. Rủi ro & lưu ý vận hành

- **Media nặng (thoại, GIF):** kiểm soát dung lượng và thời gian tải để không làm chậm hội thoại.
- **Quyền riêng tư (danh bạ):** luôn xin phép rõ ràng, cho phép dừng chia sẻ.
- **Nội dung ngoài (GIF, preview, dịch):** phụ thuộc dịch vụ bên thứ ba → cần phương án dự phòng khi lỗi.

---

## 5. Liên kết

- Roadmap tổng: [`PRODUCT_ROADMAP.md`](./PRODUCT_ROADMAP.md)
