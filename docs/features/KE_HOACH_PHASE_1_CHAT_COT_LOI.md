# Kế hoạch triển khai — Phase 1: Hoàn thiện trải nghiệm chat cốt lõi

> **Cập nhật:** 2026-07-05 · **Nguồn:** [`PRODUCT_ROADMAP.md`](./PRODUCT_ROADMAP.md)
> Phạm vi: các tính năng **chưa hoàn thành** của Phase 1. Tài liệu mô tả ở mức nghiệp vụ.
> **Tiến độ:** Gửi lại tin lỗi, Draft, New Message Divider **đã hoàn thành** (2026-07-05).
> Typing **tạm hoãn** — chờ chốt hạ tầng realtime (SignalR hiện đang tắt, app dùng FCM).

---

## 1. Phạm vi

| Tính năng | Trạng thái | Mục tiêu |
| --- | --- | --- |
| Gửi lại tin nhắn lỗi | ✅ Hoàn thành | Cho phép gửi lại tin gửi thất bại |
| Draft | ✅ Hoàn thành | Lưu nội dung đang soạn dở theo hội thoại |
| New Message Divider | ✅ Hoàn thành | Vạch "Tin nhắn mới" đánh dấu ranh giới chưa đọc |
| Đang nhập (Typing) | ⏸️ Tạm hoãn | Hiện "đang nhập" thời gian thực trong hội thoại |

> **Ghi chú:**
> - "Xóa ở phía tôi" (Delete for me) đã **loại khỏi phạm vi** theo yêu cầu; xóa tin chỉ giữ ở dạng **thu hồi cho mọi người** (đã có).
> - **Typing tạm hoãn:** khảo sát cho thấy kênh realtime SignalR đang tắt (hub chưa map, FE chưa mở kết nối), app đang chạy realtime bằng FCM vốn không hợp tín hiệu tần suất cao. Typing sẽ làm khi chốt xong hạ tầng realtime (bật lại SignalR hoặc kênh presence chuyên dụng). Phần chi tiết nghiệp vụ Typing bên dưới giữ nguyên để triển khai sau.

---

## 2. Các đợt triển khai

| Đợt | Mục tiêu | Rủi ro chính | Phụ thuộc | Rollback |
| --- | --- | --- | --- | --- |
| **Đợt 1** | Gửi lại tin lỗi + Draft (tự chủ phía người dùng, không cần dữ liệu người khác) | Trùng lặp tin khi gửi lại | Không | Ẩn nút gửi lại / bỏ khôi phục draft |
| **Đợt 2** | New Message Divider | Xác định sai mốc chưa đọc | Cơ chế "đã đọc" hiện có | Ẩn vạch phân cách |
| **Đợt 3** | Đang nhập (Typing) | Nhiễu tín hiệu, tốn băng thông realtime | Kênh realtime | Tắt phát tín hiệu typing |

---

## 3. Chi tiết nghiệp vụ

### 3.1 Gửi lại tin nhắn lỗi (Retry)

- **Mục đích:** khi một tin gửi thất bại (mất mạng, quá hạn phản hồi), người gửi có thể gửi lại mà không phải gõ lại.
- **Hành vi:**
  - Tin lỗi hiển thị cờ lỗi + hành động "Gửi lại".
  - Chọn "Gửi lại" → tin chuyển về trạng thái đang gửi, dùng lại đúng nội dung và tệp đính kèm ban đầu.
  - Gửi lại thành công → tin trở thành tin bình thường; thất bại → quay lại trạng thái lỗi.
- **Input:** tin đang ở trạng thái lỗi (nội dung, đính kèm, hội thoại đích).
- **Output:** tin được gửi thành công hoặc giữ trạng thái lỗi.
- **Quy tắc:** gửi lại **luôn do người dùng bấm** (không tự động); một tin chỉ chiếm một vị trí; gửi lại **không** tạo tin trùng.
- **Bền vững:** tin lỗi được **lưu ở client** → **không mất khi tải lại trang**.
- **Trường hợp đặc biệt:** đóng/mở lại hội thoại hoặc reload khi còn tin lỗi → vẫn thấy và gửi lại được; tin lỗi không được tính là đã lưu ở máy chủ.
- **Hạn chế:** tin **có tệp đính kèm** sau khi **reload** không giữ được tệp gốc → cần đính kèm lại (tin text gửi lại bình thường sau reload).

### 3.2 Draft (Lưu nội dung đang soạn)

- **Mục đích:** không mất nội dung đang gõ khi chuyển hội thoại hoặc rời trang.
- **Hành vi:**
  - Nội dung đang soạn được lưu riêng theo từng hội thoại.
  - Quay lại hội thoại → khôi phục đúng nội dung đang soạn dở.
  - Gửi tin thành công → xóa draft của hội thoại đó.
  - Danh sách hội thoại có thể hiển thị chỉ báo "Bản nháp" ở hội thoại còn nội dung chưa gửi.
- **Input:** nội dung người dùng đang gõ + hội thoại hiện tại.
- **Output:** draft được lưu/khôi phục/xóa tương ứng.
- **Quy tắc validate:** draft rỗng (chỉ khoảng trắng) → không lưu; gửi thành công → phải xóa draft.
- **Trường hợp đặc biệt:** đang soạn kèm tệp đính kèm chưa gửi — phạm vi tối thiểu chỉ lưu phần văn bản.
- **Hạn chế:** draft là cục bộ theo thiết bị, không đồng bộ đa thiết bị ở giai đoạn này.

### 3.3 New Message Divider (Vạch tin nhắn mới — 2 bước)

- **Mục đích:** giúp người dùng chủ động xem tin mới sau khi vắng mặt.
- **Hành vi (2 bước):**
  - **Bước 1:** mở hội thoại có tin chưa đọc → tin mới **tạm ẩn**, chỉ hiện **dòng chữ nhấp nháy "n tin nhắn mới"**.
  - **Bước 2:** người dùng **bấm** dòng đó → hiện **vạch "Tin nhắn mới"** + toàn bộ tin mới bên dưới, cuộn tới đúng vạch.
  - Rời hội thoại rồi quay lại → mốc chưa đọc được tính lại theo trạng thái đã đọc mới nhất.
- **Input:** danh sách tin + mốc "đã đọc tới đâu" của người dùng.
- **Output:** dòng báo "n tin nhắn mới" (bước 1) → vạch phân cách + tin mới (bước 2).
- **Quy tắc:** không hiện gì nếu không có tin chưa đọc; chỉ tính tin của người khác; tin mới **chưa coi là đã đọc** tới khi người dùng bấm xem và đọc tới cuối; vạch khác biệt rõ so với vạch chia theo ngày.
- **Trường hợp đặc biệt:** đang hiện dòng báo mà người dùng **tự gửi tin** → tự mở phần tin mới (không giấu nội dung của chính mình).
- **Hạn chế:** mốc chưa đọc dựa trên cơ chế "đã đọc" hiện có; tin chưa đọc đầu tiên nằm ngoài phần lịch sử đã tải thì dòng báo có thể chưa hiện tới khi tải thêm.

### 3.4 Đang nhập (Typing indicator)

- **Mục đích:** tạo cảm giác trò chuyện sống động, biết đối phương đang soạn tin.
- **Hành vi:**
  - Khi người dùng bắt đầu gõ → phát tín hiệu "đang nhập" tới các thành viên còn lại của hội thoại.
  - Người nhận thấy chỉ báo "đang nhập" (chat nhóm: hiển thị ai đang nhập).
  - Ngừng gõ một khoảng ngắn hoặc gửi tin → tín hiệu tự tắt.
- **Input:** sự kiện gõ phím trong ô soạn tin.
- **Output:** chỉ báo "đang nhập" phía người nhận.
- **Quy tắc:** tín hiệu có thời gian sống ngắn, tự hết hạn để tránh kẹt trạng thái "đang nhập" vĩnh viễn; gộp tín hiệu để không phát quá dày.
- **Trường hợp đặc biệt:** nhiều người cùng nhập trong nhóm → hiển thị gọn (ví dụ "A và B đang nhập"); người nhập rời hội thoại → tín hiệu bị hủy.
- **Hạn chế:** phụ thuộc kênh realtime; tab ẩn/nền có thể không nhận tín hiệu kịp thời.

---

## 4. Rủi ro & lưu ý vận hành

- **Gửi lại tin lỗi:** đảm bảo idempotency để tránh nhân đôi tin khi mạng chập chờn.
- **Typing:** kiểm soát tần suất phát tín hiệu, tránh bão sự kiện realtime khi nhóm đông.
- **New Message Divider:** thống nhất một định nghĩa duy nhất về "đã đọc tới đâu" với các tính năng receipt hiện có để không mâu thuẫn.

---

## 5. Liên kết

- Roadmap tổng: [`PRODUCT_ROADMAP.md`](./PRODUCT_ROADMAP.md)
