# Tách thông báo link mời sang xử lý nền

**Ngày:** 2026-07-13 · **Loại:** refactoring (không đổi hành vi) · **Trạng thái:** ✅ Đã verify runtime qua nghiệm thu luồng link mời trên app thật 2026-07-17

## 1. Mục đích

Khi một người dùng thao tác với link mời nhóm (gửi yêu cầu tham gia, hoặc vào thẳng nhóm), phần **báo cho quản trị** trước đây được thực hiện ngay trong bước xử lý yêu cầu — người bấm phải chờ cả việc ghi thông báo và việc đẩy realtime xong mới nhận phản hồi. Nay phần báo quản trị được **tách sang xử lý nền qua hàng đợi sự kiện** (cùng cơ chế với các thông báo khác của ứng dụng: tin nhắn, reaction, nhắc tên…), giúp:

- Phản hồi cho người bấm nhanh hơn, không phụ thuộc dịch vụ đẩy realtime.
- Gom toàn bộ logic "ghi thông báo bền + đẩy realtime" về một nơi duy nhất, bớt trùng lặp.

## 2. Phạm vi

Chỉ luồng **người có link bấm "Tham gia nhóm"**, cả 2 nhánh:

| Nhánh | Thông báo được tách |
| --- | --- |
| Nhóm bật duyệt → "pending" | Thông báo bền "X requested to join …" cho từng quản trị + tín hiệu realtime làm mới hàng chờ |
| Nhóm vào thẳng → "joined" | Thông báo bền "X joined … via invite link" cho từng quản trị + banner realtime kèm tên/avatar người vào |

Luồng **duyệt/từ chối** của quản trị KHÔNG thuộc phạm vi lần này (giữ nguyên).

## 3. Hành vi được bảo toàn

- Nội dung, loại và người nhận của mọi thông báo **không đổi**.
- Tên sự kiện realtime và nội dung gói tin **không đổi** — giao diện không cần sửa gì.
- Các kết quả trả về ("joined" / "pending" / "member") và mã lỗi **không đổi**.
- Chống trùng yêu cầu tham gia (bấm 2 thiết bị đồng thời) **không đổi**.
- Nhóm không có quản trị nào để báo → không phát sinh gì (như cũ).
- Thứ tự bảo đảm: việc **vào nhóm** vẫn được phát đi trước việc **báo quản trị**; lỗi ở phần thông báo không ảnh hưởng việc vào nhóm (như cam kết cũ).

## 4. Khác biệt có chủ đích

- Thông báo bền giờ được ghi **sau khi** người bấm đã nhận phản hồi (trước đây ghi xong mới phản hồi ở nhánh pending). Độ trễ cỡ mili-giây tới giây; quản trị vốn xem thông báo bất đồng bộ nên không ảnh hưởng trải nghiệm.
- Nếu hệ thống hàng đợi ngừng hoạt động đúng lúc bấm: trước đây phần thông báo bền vẫn ghi được (chỉ realtime rớt), nay cả hai chờ hàng đợi phục hồi rồi xử lý bù — không mất thông báo, chỉ tới muộn.

## 5. Hạn chế / việc còn lại

- ~~Chưa verify runtime end-to-end~~ → Đã verify qua nghiệm thu 2026-07-17 (checklist ở `LINK_MOI_VA_YEU_CAU_THAM_GIA.md` mục 1 và `FIX_REJOIN_LINK_TIN_NHAN.md` mục 6 đều pass trên app thật).
- Luồng duyệt/từ chối của quản trị vẫn ghi thông báo ngay trong bước xử lý — có thể tách tương tự ở đợt sau nếu cần.
