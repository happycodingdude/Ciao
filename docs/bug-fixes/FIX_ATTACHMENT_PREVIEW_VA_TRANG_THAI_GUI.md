# FIX: Attachment preview tối đa 8 & tinh chỉnh trạng thái gửi tin nhắn

Gộp 3 tinh chỉnh UI trong khu vực khung chat (`MessageContent`, panel
`Information`) được thực hiện cùng phiên.

---

## 1. Attachment preview trong Chat Information giới hạn tối đa 8 item

### Mục đích

Phần preview "Attachments" trong panel thông tin hội thoại phải hiển thị **tối đa
8 item**. Hội thoại có nhiều hơn 8 attachment → cắt lấy đúng 8 item đầu, phần còn
lại xem ở "View all". Hội thoại có ≤ 8 → hiển thị hết.

### Nguyên nhân (root cause)

Số item preview trước đây lấy từ một hook responsive trả về **6 / 8 / 10** tùy bề
rộng màn hình:

- Laptop thường (~1280–1520px) → chỉ hiện **6** item.
- Màn siêu rộng (≥ 2560px) → hiện tới **10** item.

→ Không đúng yêu cầu "tối đa 8, có > 8 thì lấy đủ 8": vừa thiếu (6) ở laptop
thường, vừa dư (10) ở màn siêu rộng.

### Cách hoạt động sau khi fix

- Bỏ hook responsive, dùng **hằng số cố định = 8** làm ngưỡng cắt.
- Gộp toàn bộ attachment (theo mọi bucket ngày) rồi cắt lấy 8 item đầu tiên.
- Lưới hiển thị đổi về **4 cột** để 8 item luôn xếp gọn 2 hàng × 4 cột ở mọi kích
  thước màn hình (trước đây màn siêu rộng dùng 5 cột — thiết kế cho 10 item — nay
  bỏ để tránh hàng lẻ 5 + 3).

### File ảnh hưởng

- `client/src/components/conversation/InformationAttachments.tsx` (dùng hằng số 8,
  đổi lưới 4 cột)
- `client/src/hooks/useAttachmentLimit.tsx` (**đã xoá** — dead code sau khi bỏ
  logic responsive)

---

## 2. Chừa sẵn chỗ cho icon trạng thái gửi (chống xô lệch layout)

### Mục đích

Khi gửi tin nhắn thành công, icon trạng thái (Sent/Delivered) mới được chèn vào
dưới tin nhắn cuối của mình, làm layout bị đẩy lệch một khoảng nhỏ. Yêu cầu: chừa
sẵn chỗ cho icon ngay từ lúc đang gửi để khi icon hiện ra không xô lệch.

### Nguyên nhân (root cause)

Trạng thái gửi (avatar người xem / icon Sent/Delivered) chỉ được render khi tin
nhắn cuối là của mình **và đã gửi thành công** (confirmed). Trong lúc tin còn
đang gửi (pending), khối hiển thị trạng thái **hoàn toàn không tồn tại** → không
chiếm chỗ. Khi gửi xong, khối này xuất hiện → đẩy layout xuống một khoảng bằng
chiều cao icon.

### Cách hoạt động sau khi fix

- Xác định "tin cuối của hội thoại là của mình" **tính cả lúc pending** (không chỉ
  khi đã confirmed).
- Với tin đó, luôn render một **ô trạng thái (receipt slot) có chiều cao cố định**
  (~14px, bằng đúng kích thước icon/avatar) ngay từ lúc pending:
  - Lúc pending: ô rỗng nhưng vẫn chiếm chỗ.
  - Khi gửi thành công: icon Sent/Delivered lấp vào đúng ô đã chừa → **không đổi
    chiều cao, không xô lệch**.
  - Nếu đối phương đã đọc: ưu tiên hiển thị avatar người xem thay cho icon (cùng
    một ô).
- Quy tắc hiển thị trạng thái vẫn giữ nguyên: chỉ hiện ở tin **cuối cùng** của hội
  thoại và phải là **tin của mình**; các tin khác không đổi.

### File ảnh hưởng

- `client/src/components/conversation/Chatbox.tsx` (tính & truyền cờ "tin cuối là
  của mình, kể cả pending")
- `client/src/components/message/MessageContent.tsx` (gộp thành 1 ô trạng thái có
  chiều cao tối thiểu cố định)
- `client/src/types/message.types.ts` (thêm cờ `isLastMine`)

---

## 3. Tin gửi lỗi chỉ hiện icon, tooltip khi hover

### Mục đích

Tin gửi lỗi trước đây hiện cả icon lẫn dòng chữ "Gửi lỗi", chiếm chỗ và rối. Yêu
cầu: chỉ hiện **icon lỗi**, khi hover mới hiện tooltip chứa text "Gửi lỗi".

### Nguyên nhân (root cause)

- Ban đầu render đồng thời icon + text "Gửi lỗi".
- Lần sửa đầu dùng thuộc tính `title` HTML native để làm tooltip, nhưng tooltip
  native không hiển thị ổn định (có độ trễ ~1s, dễ bị element khác che) → thực tế
  hover không thấy tooltip.

### Cách hoạt động sau khi fix

- Chỉ hiển thị icon lỗi (chấm than đỏ), bỏ dòng chữ "Gửi lỗi".
- Dùng thư viện tooltip có sẵn của dự án (đang dùng ở component báo lỗi khác) thay
  cho `title` native → hover vào icon hiện tooltip "Gửi lỗi" ổn định.

### File ảnh hưởng

- `client/src/components/message/MessageContent.tsx`

---

## Kiểm thử

- Attachment preview: hội thoại > 8 attachment hiển thị đúng 8 item, xếp 2 × 4;
  hội thoại ≤ 8 hiển thị đủ.
- Trạng thái gửi: gửi tin mới không còn xô lệch khi icon Sent xuất hiện.
- Tin gửi lỗi: chỉ còn icon; hover hiện tooltip "Gửi lỗi".
