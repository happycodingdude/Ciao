# Phase 3 — Đợt 1: Ghim cuộc trò chuyện & Bookmark (Tin nhắn đã lưu)

> **Cập nhật:** 2026-07-09 · Thuộc [`KE_HOACH_PHASE_3_CA_NHAN_HOA.md`](./KE_HOACH_PHASE_3_CA_NHAN_HOA.md)
> Trạng thái: **Code hoàn tất (BE + FE)** — chờ restart backend + kiểm thử E2E.

## 1. Mục đích

- **Ghim cuộc trò chuyện:** giữ hội thoại quan trọng luôn ở nhóm đầu danh sách chat.
- **Bookmark:** lưu tin nhắn quan trọng cho riêng mình để xem lại sau.

## 2. Phạm vi

- Áp dụng cho mọi hội thoại (nhóm và 1-1) của người dùng đăng nhập.
- Cả hai đều là dữ liệu **cá nhân**: người khác không thấy hội thoại bạn ghim hay tin bạn lưu.

## 3. Hành vi nghiệp vụ

### 3.1 Ghim cuộc trò chuyện

- Rê chuột lên một hội thoại trong danh sách chat → hiện nút ghim; hội thoại đã ghim luôn hiện biểu tượng ghim (màu cam).
- Ghim → hội thoại lên nhóm đầu danh sách; trong nhóm ghim, thứ tự vẫn theo hoạt động mới nhất.
- Bỏ ghim → trở về vị trí theo thứ tự thường.
- Ghim không đẩy hội thoại thành "mới hoạt động" (không đổi thứ tự của người khác, không tạo thông báo).
- Trạng thái ghim được lưu server-side → giữ nguyên sau khi đăng nhập lại.

### 3.2 Bookmark (Lưu tin nhắn)

- Menu "…" của một tin nhắn → "Lưu tin nhắn" / "Bỏ lưu tin nhắn". Tin đã lưu hiển thị biểu tượng màu cam trong menu.
- Trang **"Tin nhắn đã lưu"** (biểu tượng bookmark ở sidebar, đường dẫn `/saved`):
  - Liệt kê tin đã lưu, mới lưu trước, tải thêm theo trang.
  - Mỗi mục hiển thị: người gửi, hội thoại, thời điểm gửi, nội dung xem trước (tin media/poll/danh bạ có nhãn riêng).
  - Click một mục → mở hội thoại và nhảy tới tin gốc (highlight).
  - Nút xóa trên từng mục để bỏ lưu.
- Tin gốc bị thu hồi hoặc không còn → mục hiển thị "Tin nhắn không còn khả dụng", không click điều hướng được, vẫn có thể bỏ lưu.

## 4. Input/Output & Quy tắc validate

| Hành động | Input | Output | Quy tắc |
| --- | --- | --- | --- |
| Ghim/bỏ ghim hội thoại | hội thoại + trạng thái ghim | hội thoại vào/ra nhóm ghim | phải là thành viên hội thoại |
| Lưu/bỏ lưu tin | hội thoại + tin + trạng thái lưu | mục trong danh sách đã lưu | phải là thành viên; thao tác idempotent (lưu lại tin đã lưu không tạo trùng) |
| Xem tin đã lưu | trang | danh sách phân trang, mới trước | chỉ thấy bookmark của chính mình |

## 5. Trường hợp đặc biệt

- Tin đã lưu bị chỉnh sửa → nội dung trong danh sách phản ánh bản mới nhất (resolve lúc đọc, không snapshot).
- Tin đã lưu bị thu hồi → trạng thái "không còn khả dụng".
- Ghim rồi rời nhóm/xóa hội thoại → hội thoại không còn trong danh sách nên nhóm ghim không hiển thị nữa.

## 6. Hạn chế hiện tại

- Chưa giới hạn số hội thoại ghim (kế hoạch gốc đề "giới hạn hợp lý" — bổ sung sau nếu cần).
- Nhóm ghim chưa cho kéo-thả sắp xếp tay (theo đúng kế hoạch).
- Bookmark chưa hỗ trợ phân nhóm/nhãn (theo đúng kế hoạch).
- Hội thoại ghim nằm ở trang chưa tải (danh sách chat phân trang) chỉ hiện khi cuộn tới trang đó.
- Ghim/bookmark trên thiết bị khác chưa đồng bộ realtime (cập nhật khi tải lại danh sách).

## 7. Kiểm thử còn lại (bắt buộc trước khi chốt)

- Restart backend (schema/endpoint mới) → smoke test: ghim/bỏ ghim, lưu/bỏ lưu, trang `/saved`, nhảy về tin gốc, tin bị thu hồi.
