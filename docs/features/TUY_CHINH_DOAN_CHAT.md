# Tùy chỉnh đoạn chat — Hình nền & Màu bong bóng (Phase 3 — Đợt 3)

> **Trạng thái:** ✅ **HOÀN THÀNH — user đã nghiệm thu trên app thật (2026-07-11)**, đủ các rev 1→6.
> **Nguồn kế hoạch:** [`KE_HOACH_PHASE_3_CA_NHAN_HOA.md`](./KE_HOACH_PHASE_3_CA_NHAN_HOA.md) · Handoff: [`PHASE3_HANDOFF.md`](./PHASE3_HANDOFF.md)
> **Rev 2 (2026-07-11, theo yêu cầu user):** theme chuyển từ "riêng từng người" thành **chung cho cả hội thoại** — mọi thành viên đều thấy, đồng bộ realtime; đồng thời tăng tương phản chữ màu trong bong bóng.
> **Rev 3 (2026-07-11, theo yêu cầu user):** (1) màu bong bóng áp cho **tất cả tin nhắn** hai phía, không chỉ tin của người xem; (2) mỗi lần đổi theme sinh **dòng tin hệ thống** "… changed the chat theme" trong khung chat; (3) thêm **3 chủ đề sự kiện** (Noel, Halloween, Valentine) — một lựa chọn đổi đồng bộ cả hình nền lẫn màu bong bóng.
> **Rev 3.1 (2026-07-11, theo yêu cầu user):** **tạm ẩn** 2 hàng chọn riêng lẻ Chat wallpaper và Bubble color — giao diện chỉ còn hàng **Themes** (kèm ô Default để về mặc định). Bộ preset riêng lẻ vẫn giữ nguyên trong mã nguồn để bật lại khi cần.
> **Rev 4 (2026-07-11, theo yêu cầu user):** (1) trong **nhóm** chỉ **trưởng nhóm** mới được đổi theme (chat 1-1 không đổi hành vi — cả hai phía đều đổi được); (2) dòng tin hệ thống nêu rõ **tên chủ đề** vừa đổi sang.
> **Rev 5 (2026-07-11, theo yêu cầu user):** tối ưu tốc độ lưu — thao tác đổi theme phản hồi **ngay lập tức** với người đổi; việc lưu bền và đồng bộ tới các thành viên khác diễn ra ngay sau đó ở hậu trường (độ trễ không đáng kể, hành vi nhìn thấy không đổi).
> **Rev 6 (2026-07-11, theo yêu cầu user):** (1) mục Customize chat **đổi tên thành "Theme"**; (2) mục này có thể **thu gọn** trong panel thông tin — khi thu gọn hiển thị **tên theme đang áp dụng** (ngang hàng cạnh tiêu đề) kèm ô màu thu nhỏ. Chi tiết: [`THU_GON_PANEL_THONG_TIN.md`](./THU_GON_PANEL_THONG_TIN.md).

## Các giai đoạn thực hiện

| Phase | Mục tiêu | Trạng thái |
| --- | --- | --- |
| 1 — Nền tảng lưu trữ | Lưu được lựa chọn hình nền + màu bong bóng cho từng cuộc trò chuyện (chung cho cả hội thoại); xóa lựa chọn = quay về mặc định | ✅ Xong (rev 2: chuyển từ lưu theo người dùng sang lưu theo hội thoại) |
| 2 — Bộ preset | Định nghĩa bộ hình nền và bộ màu bong bóng có sẵn, hoạt động tốt ở cả giao diện sáng và tối; mọi chữ trong bong bóng (kể cả chữ có màu riêng như nhắc tên, trích dẫn trả lời, nút xem thêm) đều đọc rõ trên màu nền mới | ✅ Xong |
| 3 — Giao diện chọn | Mục "Customize chat" trong panel thông tin hội thoại: chọn hình nền, chọn màu bong bóng, có ô "Default" để quay về mặc định; ghi chú rõ áp dụng cho mọi thành viên | ✅ Xong |
| 4 — Áp dụng vào khung chat | Hình nền phủ toàn khung trò chuyện; màu bong bóng áp cho tin nhắn của chính mình; giữ khả năng đọc chữ trên nền | ✅ Xong |
| 5 — Đồng bộ giữa các thành viên | Một người đổi theme → mọi thành viên khác trong hội thoại thấy ngay lập tức, không cần tải lại trang | ✅ Xong — đã nghiệm thu |
| 6 — Mở rộng (Rev 3) | Màu bong bóng áp cho mọi tin nhắn; dòng tin hệ thống báo ai đã đổi chủ đề; bộ 3 chủ đề sự kiện đổi đồng bộ nền + bong bóng | ✅ Xong — đã nghiệm thu |
| 7 — Phân quyền & tên chủ đề (Rev 4) | Nhóm: chỉ trưởng nhóm được đổi theme — thành viên thường ẩn hẳn mục Customize chat, máy chủ cũng chặn; dòng tin hệ thống nêu tên chủ đề vừa đổi sang | ✅ Xong — đã nghiệm thu |
| 8 — Tối ưu tốc độ lưu (Rev 5) | Đổi theme phản hồi ngay với người đổi; lưu bền + đồng bộ thành viên khác xử lý ở hậu trường, không làm chậm thao tác | ✅ Xong — đã nghiệm thu |

## Mục đích

Cho phép cá nhân hóa giao diện của từng cuộc trò chuyện: đổi hình nền khung chat và đổi màu bong bóng tin nhắn. Theme là **của chung cuộc trò chuyện** — bất kỳ thành viên nào đổi thì tất cả thành viên đều thấy theme mới (kiểu Messenger).

## Phạm vi

- Áp dụng cho mọi hội thoại (chat 1-1 và nhóm).
- Theme áp dụng cho **tất cả thành viên** của hội thoại đó.
- Quyền đổi theme (Rev 4): trong **nhóm** chỉ **trưởng nhóm** được đổi — thành viên thường **không thấy** mục Customize chat trong panel thông tin (ẩn hẳn, không hiện dạng khóa); theme đang áp dụng vẫn hiển thị bình thường trong khung chat. Chat **1-1** không có trưởng nhóm — cả hai phía đều đổi được.
- Chỉ chọn từ bộ preset có sẵn — không hỗ trợ tải ảnh nền tùy ý hay chọn mã màu tự do.

## Hành vi nghiệp vụ

### Hình nền chat

- 6 lựa chọn: **Default** + 5 preset (Mint, Sunset, Lavender, Rose, Graphite).
- Hình nền phủ toàn bộ khung trò chuyện của hội thoại đó.
- Mỗi preset có hai biến thể sáng/tối, tự chuyển theo chế độ giao diện đang dùng — nền luôn đủ tương phản để đọc chữ, không cần lớp phủ.

### Màu bong bóng

- 6 lựa chọn: **Default** + 5 preset (Blue, Teal, Violet, Amber, Rose) — mọi màu đạt chuẩn tương phản với chữ trắng.
- Áp cho bong bóng của **tất cả tin nhắn** trong hội thoại (tin dạng chữ, trả lời, chuyển tiếp) — cả tin mình gửi lẫn tin người khác; hai phía phân biệt bằng vị trí trái/phải, avatar và tên người gửi.
- Chữ trong bong bóng chuyển sang màu trắng; các chữ vốn có màu riêng (nhắc tên @, tiêu đề "Trả lời...", "đã chuyển tiếp", nút Xem thêm/Thu gọn, vạch trích dẫn) cũng được đổi sang trắng/trắng mờ để luôn đọc rõ trên màu nền mới.
- Không áp cho: tin đã thu hồi, sticker/GIF, danh thiếp, bình chọn, thẻ xem trước link — các loại này giữ khung riêng như cũ.

### Chủ đề sự kiện

- 3 chủ đề theo dịp lễ: **Noel**, **Halloween**, **Valentine**.
- Chọn một chủ đề = đổi **đồng thời** hình nền và màu bong bóng theo tông của dịp lễ đó (Noel: xanh thông – đỏ; Halloween: cam bí ngô – tím; Valentine: hồng).
- Mỗi chủ đề có biến thể sáng/tối cho hình nền như các preset thường; màu bong bóng đạt chuẩn tương phản với chữ trắng.
- Hàng Themes có ô **Default** ở đầu: bấm để đưa cả hình nền lẫn màu bong bóng về mặc định.
- (Tạm ẩn từ Rev 3.1) Hai hàng chọn riêng lẻ hình nền / màu bong bóng không hiển thị — chỉ đổi giao diện qua Themes; các preset riêng lẻ được giữ lại để mở lại trong tương lai.

### Dòng tin hệ thống khi đổi chủ đề

- Mỗi lần đổi theme (chủ đề sự kiện, hình nền, màu bong bóng, kể cả bấm Default), khung chat hiện một dòng hệ thống ở giữa. Nội dung (Rev 4) nêu rõ tên chủ đề:
  - Chọn một chủ đề trong bộ preset → "**\<tên người đổi\> changed the chat theme to \<tên chủ đề\>**" (ví dụ: "An changed the chat theme to Noel").
  - Bấm Default → "**\<tên người đổi\> reset the chat theme to default**".
  - Trường hợp không xác định được một tên chủ đề duy nhất (hình nền và màu bong bóng lệch nhau — chỉ xảy ra khi bật lại 2 hàng chọn riêng lẻ) → câu chung "**\<tên người đổi\> changed the chat theme**".
- Dòng này được lưu như tin nhắn của hội thoại: mọi thành viên đều thấy (kể cả đang offline — thấy khi mở lại chat), giữ nguyên sau khi tải lại trang.
- Người đổi thấy dòng này ngay khi lưu thành công; thành viên khác đang mở app thấy qua đồng bộ realtime.
- Đổi chủ đề nhiều lần liên tiếp → mỗi lần một dòng riêng, không gộp.
- Dòng hệ thống không đẩy hội thoại lên đầu danh sách và không thay đổi phần xem trước tin nhắn cuối.

## Luồng sử dụng

1. Mở hội thoại → mở panel **Chat information** (icon ⓘ trên header).
2. Trong mục **Customize chat** (có ghi chú "Áp dụng cho mọi thành viên trong đoạn chat"): bấm một ô ở hàng **Themes** — mỗi chủ đề đổi cả hình nền lẫn màu bong bóng. Với nhóm, mục này chỉ hiện với **trưởng nhóm**; thành viên thường không thấy (Rev 4).
3. Giao diện đổi ngay lập tức với người đổi; các thành viên khác đang mở app cũng thấy theme mới ngay (đồng bộ realtime). Khung chat hiện dòng hệ thống cho biết ai vừa đổi chủ đề.
4. Muốn quay về mặc định → bấm ô **Default** ở đầu hàng Themes.

## Input / Output

- **Input:** lựa chọn preset (hoặc Default) cho từng hạng mục, trên hội thoại đang mở.
- **Output:** khung chat của **tất cả thành viên** hiển thị theo lựa chọn; lựa chọn được lưu lại — đăng nhập lại, tải lại trang hay đổi thiết bị vẫn giữ nguyên.

## Quy tắc validate

- Chỉ key preset hợp lệ mới được áp dụng; key lạ (dữ liệu cũ/sai) được coi như mặc định, không gây lỗi hiển thị.
- Lưu thất bại → giao diện tự quay về lựa chọn trước đó và hiện thông báo lỗi.
- Bấm lại đúng lựa chọn đang áp dụng → không gọi lưu thừa.
- (Rev 4) Thành viên thường của nhóm gọi lưu theme → máy chủ từ chối với thông báo "Only the group leader can change the chat theme" — quyền được kiểm tra ở máy chủ, không chỉ ẩn nút ở giao diện.
- (Rev 4) Tên chủ đề trong dòng hệ thống chỉ lấy từ danh sách preset đã biết — key lạ không bao giờ được ghi vào nội dung tin nhắn.

## Trường hợp đặc biệt

- Đổi chế độ sáng/tối: hình nền tự chuyển sang biến thể tương ứng; màu bong bóng giữ nguyên (đã chọn màu đạt tương phản ở cả hai chế độ).
- Hai hạng mục độc lập: đổi hình nền không làm mất lựa chọn màu bong bóng và ngược lại.
- Tin nhắn chỉ có ảnh/file đính kèm (không bọc bong bóng) → không đổi màu.
- Hai thành viên đổi theme gần như cùng lúc → lựa chọn lưu sau cùng thắng, mọi người hội tụ về cùng một theme.
- Thành viên đang offline khi theme đổi → thấy theme mới ở lần tải danh sách hội thoại kế tiếp.

## Hạn chế

- Chưa hỗ trợ ảnh nền tùy ý (upload) hay bảng màu tự do — chỉ preset.
- (Rev 5) Vì lưu bền diễn ra ở hậu trường sau khi đã báo thành công: trong trường hợp hệ thống gặp sự cố đúng khoảnh khắc đó, lựa chọn vừa đổi có thể không được giữ lại sau khi tải lại trang (xác suất rất thấp; đổi lại lần nữa là được).
- Màu bong bóng không áp cho khung sticker/GIF/danh thiếp/bình chọn/thẻ link (theo thiết kế).
- Quyền đổi theme trong nhóm cố định là trưởng nhóm — chưa có tùy chọn cho trưởng nhóm mở quyền cho mọi thành viên (dự kiến xem xét sau).
- Lựa chọn theme cũ theo từng người (bản rev 1, nếu có) không được chuyển sang — hội thoại bắt đầu từ mặc định.
