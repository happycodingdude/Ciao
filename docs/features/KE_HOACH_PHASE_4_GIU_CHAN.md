# Kế hoạch triển khai — Phase 4: Cá nhân hóa và giữ chân người dùng

> **Cập nhật:** 2026-07-05 · **Nguồn:** [`PRODUCT_ROADMAP.md`](./PRODUCT_ROADMAP.md)
> Phạm vi: các tính năng **chưa hoàn thành** của Phase 4 (⬜) và phần còn thiếu của tính năng 🟡.

---

## 1. Phạm vi

| Tính năng | Trạng thái | Mục tiêu |
| --- | --- | --- |
| Emoji động | ⬜ | Emoji chuyển động |
| Emoji cỡ lớn | ⬜ | Tin chỉ chứa emoji hiển thị cỡ lớn |
| Hiệu ứng tin nhắn | ⬜ | Pháo hoa, trái tim, confetti |
| Khung avatar | ⬜ | Khung trang trí quanh ảnh đại diện |
| Theme hệ thống | 🟡 | Bổ sung biến thể Gradient |
| Hiệu ứng sinh nhật | ⬜ | Hiệu ứng ngày sinh nhật |
| Chat Streak | ⬜ | Chuỗi ngày trò chuyện liên tục |
| Memories | ⬜ | Kỷ niệm "hôm nay năm ngoái" |

---

## 2. Các đợt triển khai

| Đợt | Mục tiêu | Rủi ro chính | Phụ thuộc | Rollback |
| --- | --- | --- | --- | --- |
| **Đợt 1** | Emoji cỡ lớn + Emoji động | Hiệu năng render hoạt họa | Không | Về emoji tĩnh cỡ thường |
| **Đợt 2** | Hiệu ứng tin nhắn + Theme Gradient | Gây phân tán/nhiễu, tương phản chữ | Hệ theme sáng/tối | Tắt hiệu ứng / bỏ gradient |
| **Đợt 3** | Khung avatar | Che khuất ảnh đại diện | Không | Ẩn khung |
| **Đợt 4** | Chat Streak + Memories + Sinh nhật | Cần dữ liệu ngày sinh, tính chuỗi chính xác | Dữ liệu hồ sơ/lịch sử | Ẩn widget tương ứng |

---

## 3. Chi tiết nghiệp vụ

### 3.1 Emoji cỡ lớn (Big Emoji)

- **Mục đích:** nhấn mạnh cảm xúc khi chỉ gửi emoji.
- **Hành vi:** tin chỉ gồm một vài emoji (không kèm chữ) → hiển thị cỡ lớn, không bọc bong bóng.
- **Input:** nội dung tin. **Output:** kiểu hiển thị emoji lớn/thường.
- **Quy tắc:** áp dụng khi số emoji dưới ngưỡng và không có ký tự chữ; vượt ngưỡng → hiển thị cỡ thường.
- **Trường hợp đặc biệt:** emoji lẫn khoảng trắng → vẫn coi là emoji-only; emoji ghép phức tạp → giữ nguyên ý nghĩa.
- **Hạn chế:** ngưỡng số emoji cố định theo cấu hình.

### 3.2 Emoji động (Animated Emoji)

- **Mục đích:** tăng tính biểu cảm sống động.
- **Hành vi:** một số emoji hỗ trợ chuyển động khi hiển thị; có thể giảm chuyển động theo tùy chọn hệ thống.
- **Input:** emoji trong tin. **Output:** emoji tĩnh hoặc chuyển động.
- **Quy tắc:** tôn trọng tùy chọn "giảm chuyển động" của người dùng/thiết bị.
- **Trường hợp đặc biệt:** thiết bị yếu → hạ về emoji tĩnh để giữ mượt.
- **Hạn chế:** chỉ một tập emoji hỗ trợ chuyển động.

### 3.3 Hiệu ứng tin nhắn (Fireworks / Hearts / Confetti)

- **Mục đích:** tạo khoảnh khắc bất ngờ, vui vẻ.
- **Hành vi:** một số nội dung/từ khóa kích hoạt hiệu ứng toàn khung chat (pháo hoa, mưa tim, confetti); hiệu ứng chạy một lần rồi tắt.
- **Input:** nội dung/kích hoạt hiệu ứng. **Output:** hoạt họa tạm thời trên khung chat.
- **Quy tắc:** hiệu ứng không cản thao tác; có thể tắt trong cài đặt.
- **Trường hợp đặc biệt:** nhiều hiệu ứng liên tiếp → gộp/giới hạn để tránh rối; tôn trọng "giảm chuyển động".
- **Hạn chế:** tập hiệu ứng định sẵn ở giai đoạn đầu.

### 3.4 Khung avatar (Avatar Frame)

- **Mục đích:** cá nhân hóa ảnh đại diện.
- **Hành vi:** chọn khung trang trí bao quanh ảnh đại diện; khung hiển thị ở các nơi có avatar.
- **Input:** khung được chọn. **Output:** avatar kèm khung.
- **Quy tắc:** khung không che mặt/nội dung chính của avatar; có tùy chọn bỏ khung.
- **Trường hợp đặc biệt:** avatar mặc định (chữ cái) → khung vẫn áp dụng hài hòa.
- **Hạn chế:** bộ khung định sẵn; chưa cho tải khung tùy chỉnh.

### 3.5 Theme hệ thống — biến thể Gradient

- **Mục đích:** hoàn thiện bộ giao diện Sáng / Tối / Gradient (hiện đã có Sáng/Tối).
- **Hành vi:** thêm lựa chọn nền chuyển sắc (gradient) cho giao diện; áp dụng nhất quán toàn ứng dụng như các theme hiện có.
- **Input:** lựa chọn theme. **Output:** giao diện áp dụng gradient.
- **Quy tắc:** bảo đảm tương phản chữ trên nền gradient ở mọi khu vực; đồng bộ với cơ chế chuyển theme sẵn có.
- **Trường hợp đặc biệt:** khu vực nhiều nội dung → kiểm soát gradient để không giảm khả năng đọc.
- **Hạn chế:** một vài bộ gradient chọn lọc, tránh phân mảnh giao diện.

### 3.6 Chat Streak (Chuỗi ngày trò chuyện)

- **Mục đích:** khuyến khích duy trì trò chuyện đều đặn.
- **Hành vi:** đếm số ngày liên tiếp hai người có trao đổi; hiển thị chỉ báo chuỗi; đứt chuỗi khi bỏ lỡ một ngày.
- **Input:** lịch sử trao đổi theo ngày. **Output:** số ngày chuỗi hiện tại.
- **Quy tắc:** định nghĩa rõ mốc "một ngày" theo múi giờ người dùng; điều kiện duy trì (cả hai cùng gửi hay chỉ cần có trao đổi).
- **Trường hợp đặc biệt:** lệch múi giờ giữa hai người → cần quy ước nhất quán; khôi phục chuỗi (nếu có) theo chính sách rõ ràng.
- **Hạn chế:** giai đoạn đầu áp dụng cho hội thoại trực tiếp.

### 3.7 Memories (Kỷ niệm)

- **Mục đích:** gợi nhớ khoảnh khắc cũ, tăng gắn kết.
- **Hành vi:** nhắc lại nội dung/ảnh đáng nhớ vào đúng dịp (ví dụ "hôm nay năm ngoái"); hiển thị dưới dạng thẻ gợi nhớ, có thể chia sẻ lại.
- **Input:** lịch sử hội thoại theo mốc thời gian. **Output:** thẻ kỷ niệm phù hợp dịp.
- **Quy tắc:** chỉ hiển thị nội dung của chính người dùng/hội thoại liên quan; tôn trọng nội dung đã thu hồi/xóa.
- **Trường hợp đặc biệt:** không có kỷ niệm phù hợp → không hiển thị; nội dung nhạy cảm → cân nhắc loại trừ.
- **Hạn chế:** chất lượng gợi nhớ phụ thuộc độ dày lịch sử.

### 3.8 Hiệu ứng sinh nhật (Birthday Effect)

- **Mục đích:** tạo dấu ấn cá nhân trong ngày đặc biệt.
- **Hành vi:** vào ngày sinh nhật của thành viên → hiển thị hiệu ứng/ lời chúc gợi ý trong hội thoại liên quan.
- **Input:** ngày sinh trong hồ sơ. **Output:** hiệu ứng/gợi ý chúc mừng.
- **Quy tắc:** cần có dữ liệu ngày sinh và sự đồng ý hiển thị; tôn trọng quyền riêng tư.
- **Trường hợp đặc biệt:** người dùng ẩn ngày sinh → không kích hoạt hiệu ứng.
- **Hạn chế:** phụ thuộc việc bổ sung trường ngày sinh vào hồ sơ (chưa có ở hiện tại).

---

## 4. Rủi ro & lưu ý vận hành

- **Hoạt họa (emoji động, hiệu ứng):** ưu tiên hiệu năng, tôn trọng "giảm chuyển động", cho phép tắt.
- **Gradient/khung:** không đánh đổi khả năng đọc và nhận diện.
- **Streak/Memories/Sinh nhật:** phụ thuộc dữ liệu (ngày, lịch sử) → cần bổ sung dữ liệu trước khi bật tính năng.

---

## 5. Liên kết

- Roadmap tổng: [`PRODUCT_ROADMAP.md`](./PRODUCT_ROADMAP.md)
