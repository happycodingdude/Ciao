# Thu gọn panel thông tin hội thoại — Members, Theme & Media

> **Trạng thái:** ✅ **HOÀN THÀNH — user đã nghiệm thu trên app thật (2026-07-11)** toàn bộ Phase 1–3 (gồm cả các chỉnh sửa: tóm tắt ngang hàng cạnh tiêu đề, fix cắt ring swatch, cố định chiều cao header khi toggle, đồng bộ nhịp hiệu ứng thu/mở giữa 2 mục, đổi tên mục thành "Theme").
> **Liên quan:** [`TUY_CHINH_DOAN_CHAT.md`](./TUY_CHINH_DOAN_CHAT.md) (Rev 6 — phần thu gọn mục Theme).

## Các giai đoạn thực hiện

| Phase | Mục tiêu | Trạng thái |
| --- | --- | --- |
| 1 — Thu gọn Members | Khi thu gọn danh sách thành viên, hiển thị dải avatar tròn xếp chồng thay vì ẩn hoàn toàn | ✅ Xong |
| 2 — Thu gọn Theme | Cho phép thu gọn mục tùy chỉnh theme; khi thu gọn hiển thị tên theme đang áp dụng | ✅ Xong |
| 3 — Giới hạn chiều cao Videos / Files / Links | Mỗi section media chỉ chiếm một chiều cao cố định trong panel; nội dung tràn thì cuộn bên trong section | ✅ Xong — đã nghiệm thu |

## Mục đích

Panel thông tin hội thoại chứa nhiều mục dọc (Members, Theme, media, tin đã lưu…). Khi người dùng thu gọn một mục, thay vì mất hẳn thông tin, mục đó vẫn cho thấy tóm tắt hữu ích: ai đang trong hội thoại, theme nào đang áp dụng — giúp panel gọn mà không mù thông tin.

## Phạm vi

- Áp dụng trong panel **Chat information** của mọi hội thoại (1-1 và nhóm).
- Trạng thái thu gọn/mở là lựa chọn **riêng của từng người trên từng trình duyệt**, được ghi nhớ qua các lần mở lại — không đồng bộ giữa các thành viên.

## Hành vi nghiệp vụ

### Members thu gọn — dải avatar xếp chồng

- Khi mục Members đang **mở**: hiển thị danh sách đầy đủ như trước (không đổi hành vi).
- Khi **thu gọn** (bấm mũi tên): thay danh sách bằng một hàng avatar tròn **xếp chồng lên nhau**, hiển thị **ngang hàng ngay bên cạnh** tiêu đề "Members (N)" (không nằm ở dòng dưới) — vòng sau nằm **dưới** vòng trước và chỉ lộ **một nửa**; mỗi vòng có viền màu nền để tách nhau.
- Hiển thị tối đa **5** avatar; thứ tự giữ nguyên quy tắc của danh sách (Admin đứng trước).
- Từ thành viên thứ **6** trở đi: gộp thành một vòng cuối ghi **"+N"** (N = số thành viên còn lại chưa hiện). Ví dụ nhóm 8 người → 5 avatar + vòng "+3".
- Bấm vào dải avatar (hoặc mũi tên) → mở lại danh sách đầy đủ.
- Di chuột lên từng avatar hiện tên thành viên; di lên vòng "+N" hiện số thành viên còn lại.

### Theme thu gọn — tên theme đang áp dụng

- Mục tùy chỉnh theme đổi tiêu đề từ "Customize chat" thành **"Theme"** (Rev 6), có mũi tên thu gọn/mở giống mục Members.
- Khi **mở**: hiển thị như trước — ghi chú "Áp dụng cho mọi thành viên trong đoạn chat" + hàng Themes.
- Khi **thu gọn**: hiển thị **tên theme đang được áp dụng** kèm một ô màu thu nhỏ (nền theme + chấm màu bong bóng), **ngang hàng ngay bên cạnh** tiêu đề "Theme" (không nằm ở dòng dưới):
  - Đang dùng một chủ đề trong bộ preset → tên chủ đề đó (ví dụ "Halloween").
  - Chưa đổi theme → "Default".
  - Hình nền và màu bong bóng lệch nhau, không khớp chủ đề nào (chỉ xảy ra nếu bật lại 2 hàng chọn riêng lẻ) → "Custom".
- Bấm vào dòng tên theme (hoặc mũi tên) → mở lại phần chọn theme.
- Theme do thành viên khác đổi trong lúc mục đang thu gọn → tên theme hiển thị **tự cập nhật** theo (dựa trên đồng bộ realtime sẵn có).

### Videos / Files / Links — chiều cao cố định, cuộn bên trong (Phase 3)

- Ba section **Videos**, **Files**, **Links** trong panel thông tin chỉ chiếm tối đa một chiều cao cố định (khoảng 3 dòng file/link, hoặc hơn 1 hàng thumbnail video).
- Nội dung nhiều hơn mức hiển thị → **cuộn dọc ngay bên trong section** (thanh cuộn ẩn, đồng bộ với các vùng cuộn khác của app); panel tổng không còn bị kéo dài quá mức.
- Số item mỗi section vẫn tối đa 8 như trước; muốn xem toàn bộ vẫn dùng **View all** để mở panel Attachment đúng tab.
- Section **Images** giữ nguyên (lưới 2 hàng, không cuộn) — không thuộc phạm vi yêu cầu.

## Luồng sử dụng

1. Mở hội thoại → mở panel **Chat information**.
2. Bấm mũi tên cạnh **Members** → danh sách gọn lại thành dải avatar xếp chồng (tối đa 5 + vòng "+N").
3. Bấm mũi tên cạnh **Theme** → phần chọn theme gọn lại, chỉ còn tên theme hiện tại.
4. Bấm lại mũi tên (hoặc bấm trực tiếp vào phần tóm tắt) để mở rộng từng mục.

## Input / Output

- **Input:** thao tác bấm thu gọn/mở từng mục.
- **Output:** mục Members thu gọn hiện dải avatar chồng; mục Theme thu gọn hiện tên theme; trạng thái được nhớ lại cho lần mở panel sau trên cùng trình duyệt.

## Trường hợp đặc biệt

- Hội thoại đúng 5 thành viên → hiện đủ 5 avatar, **không** có vòng "+N".
- Hội thoại 1-1 (2 thành viên) → dải chỉ có 2 avatar.
- Thành viên không có ảnh đại diện → vòng dùng ảnh mặc định như các nơi khác trong app.
- Trong nhóm, thành viên thường không thấy mục Theme (quy tắc phân quyền sẵn có — Rev 4 của tính năng theme) → phần thu gọn theme cũng không hiện với họ.
- Thành viên vào/rời nhóm khi mục Members đang thu gọn → dải avatar và số "+N" cập nhật theo dữ liệu hội thoại.

## Hạn chế

- Dải avatar thu gọn không hiển thị trạng thái online và không mở thẻ nhắn nhanh (QuickChat) — cần mở rộng danh sách để dùng các thao tác đó.
- Trạng thái thu gọn dùng chung cho mọi hội thoại (thu gọn ở hội thoại này thì hội thoại khác cũng thu gọn), giống hành vi ghi nhớ sẵn có của mục Members.
