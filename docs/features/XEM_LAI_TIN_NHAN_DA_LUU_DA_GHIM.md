# Xem lại tin nhắn: Đã lưu & Đã ghim (luồng thống nhất)

> **Cập nhật:** 2026-07-23
> Trạng thái: 🟡 Code hoàn tất (backend + frontend build sạch) — còn bước **vận hành**: restart API, migration dữ liệu ghim cũ, tạo index, verify UI.
> Checklist chi tiết & lệnh vận hành: [`../api-changes/XEM_LAI_TIN_NHAN_DA_LUU_DA_GHIM_API_CHANGES.md`](../api-changes/XEM_LAI_TIN_NHAN_DA_LUU_DA_GHIM_API_CHANGES.md) (mục 0).

## 1. Mục đích

Chuẩn hóa hai tính năng xem lại tin nhắn về **một luồng thống nhất**:

- **Tin nhắn đã lưu** (riêng tư từng người): mỗi người tự lưu tin quan trọng để xem lại.
- **Tin nhắn đã ghim** (dùng chung cả hội thoại): mọi thành viên cùng thấy các tin được ghim.

Cả hai đều trả lời cùng một câu hỏi: *"Hội thoại này có những tin nào đã được lưu / đã được ghim?"* và được xem lại theo cùng một cách ở khung Thông tin của hội thoại.

## 2. Phạm vi

- Áp dụng cho mọi hội thoại (nhóm và 1-1) của người dùng đăng nhập.
- **Đã lưu** là dữ liệu cá nhân: người khác không thấy tin bạn lưu.
- **Đã ghim** là dữ liệu chung: ghim/bỏ ghim ảnh hưởng tới mọi thành viên và được đồng bộ tức thời.
- Nội dung mỗi tin trong danh sách luôn phản ánh trạng thái mới nhất của tin gốc (đã sửa / đã thu hồi).

## 3. Các giai đoạn thực hiện (Phase)

| Phase | Mục tiêu |
| --- | --- |
| **Phase 1 — Tách riêng cách lưu trạng thái ghim + di trú dữ liệu cũ** | Mỗi hội thoại có danh sách tin đã ghim độc lập, thống nhất mô hình với tin đã lưu. Chuyển toàn bộ tin đang được ghim theo cách cũ sang cách lưu mới để không mất dữ liệu ghim hiện có. |
| **Phase 2 — Chuẩn hóa thao tác lưu và lấy dữ liệu (có phân trang)** | Thao tác lưu/bỏ lưu và ghim/bỏ ghim đều bền vững và không tạo bản trùng. Danh sách lấy về theo **trang** để không kéo toàn bộ dữ liệu một lần. |
| **Phase 3 — Hiển thị ở khung Thông tin với tải thêm mượt** | Người dùng xem lại danh sách đã lưu / đã ghim ngay trong khung Thông tin của hội thoại; cuộn tới cuối tự tải thêm; có ô tìm kiếm theo nội dung. |

Các Phase là bắt buộc, không được lược bỏ hay gộp; **Phase 1 bao gồm bước di trú dữ liệu** và phải giữ nguyên.

## 4. Hành vi nghiệp vụ

### 4.1 Đã ghim (dùng chung)

- Trong menu thao tác của một tin → **Ghim / Bỏ ghim**. Tin đã ghim hiển thị dấu ghim nổi trên tin và biểu tượng menu đổi màu.
- Ghim/bỏ ghim được đồng bộ **tức thời** cho các thành viên khác đang mở hội thoại (dấu ghim và danh sách tự cập nhật).
- Ghim là idempotent: ghim một tin đã ghim không tạo thêm bản ghi; bỏ ghim một tin chưa ghim không gây lỗi.
- Trạng thái ghim được giữ nguyên sau khi đăng nhập lại.

### 4.2 Đã lưu (riêng tư)

- Trong menu thao tác của một tin → **Lưu / Bỏ lưu**. Tin đã lưu hiển thị biểu tượng đánh dấu trong menu.
- Lưu/bỏ lưu chỉ ảnh hưởng tới chính người thao tác; không tạo thông báo, người khác không thấy.
- Lưu là idempotent (không tạo bản trùng) và được giữ nguyên sau khi đăng nhập lại.

### 4.3 Xem lại trong khung Thông tin (chung cho cả hai)

- Mở panel **"Tin nhắn đã lưu"** hoặc **"Tin đã ghim"** từ khung Thông tin của hội thoại.
- Danh sách sắp xếp **mới nhất trước** (mới lưu / mới ghim trước).
- Mỗi mục hiển thị: người gửi (tên + ảnh đại diện), thời điểm gửi, nội dung xem trước theo loại tin (tin ảnh/sticker/bình chọn/danh bạ có nhãn xem trước riêng).
- Cuộn tới cuối danh sách → **tự tải thêm trang kế** (load more) mượt, không giật.
- Ô tìm kiếm lọc trực tiếp trong phần đã tải; nếu không khớp, hệ thống tự tìm tiếp theo từ khóa trong toàn bộ danh sách của hội thoại.
- Click một mục → mở đúng tin trong khung chat và làm nổi bật tin đó; panel vẫn mở.

## 5. Luồng sử dụng

1. Người dùng ghim (hoặc lưu) một tin từ menu thao tác của tin.
2. Trạng thái phản hồi ngay trên tin và trong menu; với ghim, các thành viên khác cũng thấy ngay.
3. Người dùng mở panel tương ứng trong khung Thông tin để xem lại toàn bộ.
4. Cuộn để tải thêm, hoặc gõ từ khóa để tìm nhanh.
5. Click một mục để nhảy về đúng tin trong hội thoại.

## 6. Input / Output & Quy tắc validate

| Hành động | Input | Output | Quy tắc |
| --- | --- | --- | --- |
| Ghim / Bỏ ghim | Hội thoại + tin + trạng thái ghim mong muốn | Cập nhật danh sách ghim của hội thoại; đồng bộ tức thời cho thành viên khác | Chỉ thành viên hội thoại được thao tác; idempotent |
| Lưu / Bỏ lưu | Hội thoại + tin + trạng thái lưu mong muốn | Cập nhật danh sách lưu của riêng người dùng | Chỉ thành viên hội thoại được thao tác; idempotent |
| Xem danh sách (đã lưu / đã ghim) | Hội thoại + trang | Một trang các mục (mới nhất trước) kèm cờ *còn dữ liệu để tải thêm* | Chỉ thành viên hội thoại được xem |
| Tìm theo từ khóa | Hội thoại + từ khóa | Các mục có nội dung khớp | Bỏ qua tin không còn khả dụng khi tìm |

## 7. Trường hợp đặc biệt

- **Tin bị thu hồi:** tự động **bỏ ghim** và biến mất khỏi danh sách ghim; ở danh sách đã lưu, mục hiển thị "Tin nhắn không còn khả dụng", không click điều hướng được (vẫn có thể bỏ lưu).
- **Tin bị chỉnh sửa:** nội dung xem trước trong danh sách phản ánh bản mới nhất.
- **Nhiều thiết bị / thao tác đồng thời:** ghim/lưu lặp lại không tạo bản trùng; kết quả cuối cùng nhất quán.

## 8. Hạn chế

- Ô tìm kiếm theo từ khóa trả về toàn bộ kết quả khớp trong hội thoại (không phân trang riêng cho chế độ tìm) — phù hợp vì số tin đã lưu / đã ghim của một hội thoại thường nhỏ.
- Nội dung xem trước của một tin cần tin đó còn trong bộ nhớ đọc gần đây của hội thoại; tin quá cũ chưa được nạp lại có thể tạm hiển thị "không khả dụng" cho tới khi hội thoại được nạp lại.
