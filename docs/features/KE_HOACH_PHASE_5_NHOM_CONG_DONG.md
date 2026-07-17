# Kế hoạch triển khai — Phase 5: Nâng cao trải nghiệm nhóm và cộng đồng

> **Cập nhật:** 2026-07-05 · **Nguồn:** [`PRODUCT_ROADMAP.md`](./PRODUCT_ROADMAP.md)
> Phạm vi: các tính năng **chưa hoàn thành** của Phase 5 (⬜) và phần còn thiếu của tính năng 🟡.

---

## 1. Phạm vi

| Tính năng | Trạng thái | Mục tiêu |
| --- | --- | --- |
| Thông báo nhóm | ⬜ | Bảng thông báo nổi bật cho nhóm |
| Sự kiện (Event & RSVP) | ⬜ | Tạo sự kiện + xác nhận tham dự |
| Link mời & QR | ✅ NGHIỆM THU 2026-07-17 (gồm đợt fix + modal hoá preview — [`FIX_REJOIN_LINK_TIN_NHAN.md`](./FIX_REJOIN_LINK_TIN_NHAN.md)) | Mời vào nhóm qua liên kết/QR |
| Yêu cầu tham gia | ✅ NGHIỆM THU 2026-07-17 | Duyệt yêu cầu vào nhóm |
| Rời nhóm | 🟡 Đã code (2026-07-12), chờ nghiệm thu — [`ROI_NHOM.md`](./ROI_NHOM.md) | Thành viên chủ động rời nhóm |
| Phân quyền quản trị | ⏸️ | **Dời lại, chưa làm ở Phase 5** (2026-07-12, theo yêu cầu) — giao diện bổ nhiệm/thu hồi quyền |
| Bình chọn ẩn danh | ⬜ | Bỏ phiếu không lộ danh tính |
| Thread | ⬜ | Thảo luận theo nhánh |

---

## 2. Các đợt triển khai

| Đợt | Mục tiêu | Rủi ro chính | Phụ thuộc | Rollback |
| --- | --- | --- | --- | --- |
| **Đợt 1** | Thông báo nhóm (Phân quyền quản trị dời lại 2026-07-12, không còn trong đợt này) | Lạm quyền đăng/gỡ thông báo | Vai trò quản trị hiện có | Ẩn bảng thông báo |
| **Đợt 2** | Link mời & QR + Yêu cầu tham gia — ✅ NGHIỆM THU 2026-07-17 · [`LINK_MOI_VA_YEU_CAU_THAM_GIA.md`](./LINK_MOI_VA_YEU_CAU_THAM_GIA.md) | Vào nhóm trái phép, spam yêu cầu | Cơ chế thành viên nhóm | Vô hiệu liên kết / tắt duyệt |
| **Đợt 2b** | Rời nhóm (bổ sung 2026-07-12) — 🟡 ĐÃ CODE (2026-07-12), chờ nghiệm thu · [`ROI_NHOM.md`](./ROI_NHOM.md) | Đổi nhầm hành vi mở-lại của chat 1-1; người rời vẫn nhận tin | Cơ chế thành viên + Link mời (Đợt 2) cho luồng quay lại | Ẩn nút rời nhóm |
| **Đợt 3** | Sự kiện & RSVP | Lệch múi giờ, nhắc nhở | Không | Ẩn tạo sự kiện |
| **Đợt 4** | Bình chọn ẩn danh + Thread | Bảo toàn ẩn danh, phức tạp hiển thị | Bình chọn (Phase 2) | Về bình chọn thường / tắt thread |

---

## 3. Chi tiết nghiệp vụ

### 3.1 Phân quyền quản trị (hoàn thiện) — ⏸️ DỜI LẠI, chưa làm ở Phase 5 (2026-07-12)

- **Mục đích:** quản trị viên có thể trao/thu quyền cho thành viên khác.
- **Hành vi:** trong danh sách thành viên, quản trị viên có thao tác bổ nhiệm quản trị / thu hồi quyền; các hành động quản trị (thêm/xóa thành viên, đổi thông tin nhóm, thu hồi tin của người khác) tuân theo quyền.
- **Input:** thành viên đích + hành động phân quyền. **Output:** vai trò thành viên được cập nhật.
- **Quy tắc:** chỉ quản trị viên được phân quyền; không để nhóm mất toàn bộ quản trị; hành động phân quyền ghi nhận để đối soát.
- **Trường hợp đặc biệt:** tự hạ quyền của mình khi là quản trị duy nhất → chặn; người bị thu quyền đang thao tác → áp dụng quyền mới ngay.
- **Hạn chế:** hiện đã có khái niệm quản trị (người tạo là quản trị, hiển thị nhãn, thu hồi theo quyền); phần còn thiếu là giao diện bổ nhiệm/thu hồi.

### 3.2 Thông báo nhóm (Announcement)

- **Mục đích:** truyền đạt thông tin quan trọng tới cả nhóm.
- **Hành vi:** quản trị đăng thông báo nổi bật; thành viên thấy thông báo ở vị trí ưu tiên; có thể xem lại danh sách thông báo.
- **Input:** nội dung thông báo. **Output:** thông báo hiển thị nổi bật cho nhóm.
- **Quy tắc:** chỉ quản trị được đăng/gỡ; thông báo tách biệt với tin nhắn thường.
- **Trường hợp đặc biệt:** nhiều thông báo → sắp theo mới nhất/ghim; gỡ thông báo → không còn nổi bật.
- **Hạn chế:** phạm vi ban đầu là thông báo văn bản.
- **Phân định với Ghim tin nhắn (Phase 3, đã có kèm panel xem lại):** hai tính năng cùng "đánh dấu nội dung cho cả nhóm thấy" nhưng khác bản chất — ghim đánh dấu **tin nhắn có sẵn** trong luồng chat, ai cũng ghim được, không đẩy thông báo; thông báo nhóm là **nội dung soạn riêng**, chỉ quản trị đăng/gỡ, hiển thị nổi bật và chủ động báo tới mọi thành viên. Khi triển khai nên tái dùng hạ tầng ghim (đánh dấu + danh sách xem lại) và chỉ bổ sung phần khác biệt: quyền quản trị, vị trí hiển thị nổi bật, đẩy thông báo. Phân tích chi tiết: 2026-07-12.

### 3.3 Link mời & QR — ✅ NGHIỆM THU 2026-07-17

- **Mục đích:** mời người vào nhóm nhanh, không cần thêm thủ công từng người.
- **Hành vi:** tạo liên kết mời (kèm mã QR); người có liên kết có thể xin vào/được vào nhóm theo cấu hình; quản trị có thể thu hồi hoặc đặt thời hạn liên kết.
- **Input:** yêu cầu tạo liên kết. **Output:** liên kết + QR chia sẻ được.
- **Quy tắc:** liên kết có thể hết hạn/bị thu hồi; kiểm soát ai được tạo liên kết.
- **Trường hợp đặc biệt:** liên kết hết hạn/bị thu hồi → từ chối vào nhóm; nhóm đầy → chặn.
- **Hạn chế:** cần đi kèm cơ chế chống lạm dụng (spam liên kết).

### 3.4 Yêu cầu tham gia (Join Request) — ✅ NGHIỆM THU 2026-07-17

- **Mục đích:** kiểm soát người vào nhóm khi cần duyệt.
- **Hành vi:** người dùng gửi yêu cầu vào nhóm; quản trị thấy hàng chờ và duyệt/từ chối; người dùng được thông báo kết quả.
- **Input:** yêu cầu tham gia. **Output:** thành viên được thêm hoặc bị từ chối.
- **Quy tắc:** cấu hình nhóm quyết định cần duyệt hay vào thẳng; tránh yêu cầu trùng lặp.
- **Trường hợp đặc biệt:** rút yêu cầu trước khi duyệt; bị từ chối rồi gửi lại theo chính sách.
- **Hạn chế:** đi cùng Link mời để tạo luồng vào nhóm hoàn chỉnh.

### 3.4b Rời nhóm (Leave Group) — 🟡 ĐÃ CODE (2026-07-12), chờ nghiệm thu

- **Mục đích:** thành viên chủ động rời nhóm; nhóm được thông báo minh bạch; người rời không nhận nội dung nữa.
- **Hành vi:** nút rời trong panel thông tin nhóm (icon có sẵn) → xác nhận → rời; dòng hệ thống "{user} left the group"; hội thoại biến khỏi danh sách người rời (mọi thiết bị); quay lại chỉ qua được-thêm-lại hoặc link mời.
- **Quy tắc:** chỉ nhóm; quản trị duy nhất không được rời khi nhóm còn thành viên (chờ Phân quyền quản trị để trao quyền trước); idempotent.
- **Điểm phải sửa nền:** tin nhắn mới đang tự mở lại member đã rời (đúng cho chat 1-1, sai cho nhóm) + check tư cách thành viên chưa xét trạng thái đã rời.
- **Chi tiết đầy đủ (3 đợt 2b-1 → 2b-3):** [`KE_HOACH_ROI_NHOM.md`](./KE_HOACH_ROI_NHOM.md)

### 3.5 Sự kiện & RSVP

- **Mục đích:** tổ chức và theo dõi tham dự trong nhóm.
- **Hành vi:** tạo sự kiện (tên, thời gian, mô tả); thành viên phản hồi Tham dự / Không / Có thể; hiển thị danh sách phản hồi; nhắc trước giờ diễn ra.
- **Input:** thông tin sự kiện + phản hồi RSVP. **Output:** sự kiện + thống kê tham dự.
- **Quy tắc validate:** thời gian hợp lệ; theo múi giờ người xem; ai được tạo/sửa/hủy sự kiện.
- **Trường hợp đặc biệt:** đổi giờ sự kiện → thông báo lại; hủy sự kiện → cập nhật trạng thái cho mọi người.
- **Hạn chế:** giai đoạn đầu tập trung sự kiện trong phạm vi nhóm.

### 3.6 Bình chọn ẩn danh

- **Mục đích:** thu ý kiến trung thực mà không lộ danh tính người bầu.
- **Hành vi:** khi tạo bình chọn có tùy chọn ẩn danh → kết quả chỉ hiển thị tổng hợp, không cho biết ai bầu gì.
- **Input:** cấu hình ẩn danh + phiếu bầu. **Output:** kết quả tổng hợp, ẩn danh tính.
- **Quy tắc:** bảo đảm không truy ngược người bầu; vẫn chống bầu trùng của cùng một người.
- **Trường hợp đặc biệt:** nhóm quá nhỏ → cảnh báo khả năng suy đoán danh tính.
- **Hạn chế:** dựa trên nền tảng bình chọn thường (Phase 2) đã có.

### 3.7 Thread (Thảo luận theo nhánh)

- **Mục đích:** thảo luận sâu một chủ đề mà không làm rối luồng chính.
- **Hành vi:** mở nhánh từ một tin → các phản hồi nằm trong nhánh; luồng chính có chỉ báo số phản hồi và lối vào nhánh.
- **Input:** tin gốc + phản hồi trong nhánh. **Output:** nhánh thảo luận gắn với tin gốc.
- **Quy tắc:** tin trong nhánh vẫn theo quy tắc thông báo/đã đọc; xóa/thu hồi tin gốc xử lý nhất quán với nhánh.
- **Trường hợp đặc biệt:** nhánh dài → điều hướng và đếm phản hồi rõ ràng; thông báo cho người theo dõi nhánh.
- **Hạn chế:** tăng độ phức tạp hiển thị; cân nhắc phạm vi áp dụng ban đầu.

---

## 4. Rủi ro & lưu ý vận hành

- **Kiểm soát truy cập:** Link mời + Yêu cầu tham gia + Phân quyền phải nhất quán để tránh vào nhóm/thao tác trái phép.
- **Ẩn danh:** bình chọn ẩn danh phải bảo đảm không truy ngược, kể cả phía quản trị.
- **Đối soát:** hành động quản trị (phân quyền, duyệt thành viên) nên ghi nhận để truy vết khi tranh chấp.

---

## 5. Liên kết

- Roadmap tổng: [`PRODUCT_ROADMAP.md`](./PRODUCT_ROADMAP.md)
