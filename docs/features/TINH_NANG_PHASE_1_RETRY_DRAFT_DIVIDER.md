# Tính năng Phase 1 — Gửi lại tin lỗi · Draft · Vạch tin nhắn mới

> **Trạng thái:** ✅ Đã triển khai (2026-07-05).
> **Kế hoạch gốc:** [`KE_HOACH_PHASE_1_CHAT_COT_LOI.md`](./KE_HOACH_PHASE_1_CHAT_COT_LOI.md) · **Roadmap:** [`PRODUCT_ROADMAP.md`](./PRODUCT_ROADMAP.md)
> Tài liệu mô tả hành vi nghiệp vụ đã bàn giao (không mô tả chi tiết kỹ thuật).

Bàn giao 3/4 tính năng chưa xong của Phase 1. Tính năng **Đang nhập (Typing)** tạm hoãn — chờ chốt hạ tầng realtime.

---

## 1. Gửi lại tin nhắn lỗi (Retry)

- **Mục đích:** khi một tin gửi thất bại (mất mạng, quá hạn phản hồi, lỗi tải tệp), người gửi gửi lại được ngay mà không phải gõ/chọn tệp lại.
- **Luồng sử dụng:**
  1. Tin gửi thất bại → hiển thị cờ lỗi kèm hai thao tác: **Gửi lại** và **Copy** nội dung.
  2. Chọn **Gửi lại** → tin trở về trạng thái đang gửi, dùng lại đúng nội dung, tệp đính kèm và ngữ cảnh trả lời (reply) ban đầu.
  3. Thành công → tin trở thành tin bình thường; thất bại tiếp → quay lại trạng thái lỗi để gửi lại lần nữa.
- **Input:** một tin đang ở trạng thái lỗi. **Output:** tin được gửi thành công hoặc giữ trạng thái lỗi.
- **Quy tắc:** gửi lại **luôn do người dùng bấm** (không tự động); một tin luôn chiếm **đúng một vị trí** — gửi lại **không** tạo tin trùng; tin lỗi không được tính là đã lưu ở máy chủ.
- **Bền vững khi tải lại trang:** tin lỗi được **lưu ở client** nên **không mất khi reload** — mở lại vẫn thấy tin lỗi để gửi lại.
- **Trường hợp đặc biệt:** đóng/mở lại hội thoại hoặc tải lại trang khi còn tin lỗi → tin lỗi vẫn hiển thị và gửi lại được.
- **Hạn chế:** với tin **có tệp đính kèm**, sau khi **tải lại trang** thì tệp gốc không còn giữ được → hệ thống báo người dùng **đính kèm và gửi lại** (tin text thì gửi lại bình thường sau reload).

---

## 2. Draft — Lưu nội dung đang soạn

- **Mục đích:** không mất nội dung đang gõ khi chuyển hội thoại hoặc rời trang.
- **Luồng sử dụng:**
  1. Đang gõ dở ở một hội thoại rồi chuyển sang hội thoại khác → nội dung được lưu tự động.
  2. Quay lại hội thoại → nội dung soạn dở được khôi phục vào ô nhập.
  3. Gửi tin thành công → draft của hội thoại đó bị xóa.
  4. Hội thoại còn nội dung soạn dở → danh sách chat hiển thị chỉ báo **"Bản nháp:"** kèm trích đoạn.
- **Input:** nội dung đang gõ + hội thoại hiện tại. **Output:** draft được lưu / khôi phục / xóa tương ứng.
- **Quy tắc validate:** draft rỗng (chỉ khoảng trắng) → không lưu và không hiện chỉ báo; đang **chỉnh sửa** một tin cũ thì không tính là draft.
- **Trường hợp đặc biệt:** chèn emoji cũng được lưu vào draft; chuyển nhiều hội thoại qua lại → mỗi hội thoại giữ draft riêng.
- **Hạn chế:** draft **cục bộ theo thiết bị/trình duyệt**, không đồng bộ đa thiết bị; phạm vi lưu là phần **văn bản** (đề cập @mention có thể lưu ở dạng rút gọn).

---

## 3. New Message Divider — Vạch "Tin nhắn mới" (2 bước)

- **Mục đích:** giúp người dùng chủ động xem tin mới sau khi vắng mặt, không bị "nhảy" nội dung ngoài ý muốn.
- **Luồng sử dụng (2 bước):**
  1. **Bước 1 — Báo có tin mới:** mở hội thoại có tin chưa đọc → các tin mới **tạm ẩn**, chỉ hiện một **dòng chữ nhấp nháy "n tin nhắn mới"** (n = số tin mới) để thu hút chú ý.
  2. **Bước 2 — Xem tin mới:** người dùng **bấm** vào dòng đó → hiện **vạch "Tin nhắn mới"** kèm **toàn bộ tin mới bên dưới**, đồng thời cuộn tới đúng vạch để đọc tiếp.
  3. Rời hội thoại rồi quay lại → mốc chưa đọc được tính lại theo trạng thái đã đọc mới nhất.
- **Input:** danh sách tin + mốc "đã đọc tới đâu" của chính người dùng. **Output:** dòng báo "n tin nhắn mới" (bước 1) → vạch phân cách + tin mới (bước 2).
- **Quy tắc:**
  - Chỉ tính tin **của người khác** là "tin mới"; không có tin chưa đọc → không hiện gì.
  - Tin mới **chưa được coi là đã đọc** cho tới khi người dùng bấm xem và đọc tới cuối → badge chưa đọc ở danh sách chat giữ nguyên cho đến lúc đó.
  - Vạch "Tin nhắn mới" (đường kẻ ngang, nhãn nhấn) khác hẳn vạch chia **theo ngày**.
- **Trường hợp đặc biệt:** nếu trong lúc đang hiện dòng báo mà **người dùng tự gửi tin** (hoặc có tin lỗi của mình mới hơn mốc) → hệ thống **tự mở** phần tin mới ngay (không giấu nội dung của chính người dùng).
- **Hạn chế:** mốc chưa đọc dựa trên cơ chế "đã đọc" hiện có; nếu tin chưa đọc đầu tiên nằm sâu ngoài phần lịch sử đã tải thì dòng báo có thể chưa hiển thị cho tới khi tải thêm.

---

## 4. Ngoài phạm vi lần này

- **Đang nhập (Typing):** tạm hoãn. Lý do và định hướng: xem ghi chú trong [`KE_HOACH_PHASE_1_CHAT_COT_LOI.md`](./KE_HOACH_PHASE_1_CHAT_COT_LOI.md) (chờ chốt hạ tầng realtime — SignalR hiện đang tắt, app dùng FCM).
- **Xóa ở phía tôi (Delete for me):** đã loại khỏi phạm vi theo yêu cầu; chỉ giữ thu hồi cho mọi người.
