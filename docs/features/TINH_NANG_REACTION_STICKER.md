# Reaction động & Sticker động

> **Cập nhật:** 2026-07-11 · **Kế hoạch:** [`KE_HOACH_EMOJI_STICKER_THEME.md`](./KE_HOACH_EMOJI_STICKER_THEME.md) · **Yêu cầu gốc:** [`TINH_NANG_EMOJI.md`](./TINH_NANG_EMOJI.md)
> **Trạng thái:** ✅ Phase 1–3 ĐÃ NGHIỆM THU trên app thật (2026-07-11). Phase 4–5 (Personal Theme, Seasonal Animation) làm đợt sau.

---

## 1. Các giai đoạn thực hiện

| Phase | Mục tiêu | Trạng thái |
| --- | --- | --- |
| 1. Nền tảng Pack & Animation | Hệ thống Pack mở rộng được + trình phát animation dùng chung (lazy load, cache, tôn trọng "giảm chuyển động") | ✅ Nghiệm thu 2026-07-11 |
| 2. Reaction động | Bộ reaction 👍 ❤️ 😂 😮 😢 😡 dạng emoji động, hiệu ứng khi thêm/gỡ | ✅ Nghiệm thu 2026-07-11 |
| 3. Sticker động | Sticker động + panel Emoji & Sticker chung: tab Emoji, Gần đây, Yêu thích, Tìm kiếm, tab theo Pack | ✅ Nghiệm thu 2026-07-11 |
| 4. Personal Theme | 3 theme cá nhân (Christmas, Halloween, Valentine) chỉ người bật nhìn thấy | ⏳ Đợt sau |
| 5. Seasonal Animation | Hiệu ứng trang trí theo mùa gắn với theme | ⏳ Đợt sau |
| 6. Nghiệm thu & Tài liệu | Verify + tài liệu | ✅ Nghiệm thu app thật 2026-07-11 (phần Phase 1–3) |

## 2. Mục đích

- Thả cảm xúc lên tin nhắn bằng emoji động, sinh động như các ứng dụng nhắn tin hiện đại.
- Gửi sticker động; quản lý sticker theo pack, tìm nhanh, lưu yêu thích.
- Nền tảng Pack cho phép bổ sung bộ reaction/sticker mới về sau mà không đổi hành vi hiện có.

## 3. Phạm vi

- Áp dụng trong mọi hội thoại (direct và nhóm).
- Reaction áp dụng cho tin đã gửi thành công và chưa thu hồi, **trừ tin sticker** (tin sticker chỉ có duy nhất thao tác Xóa — không reaction, không reply/forward/pin/copy/lưu/dịch).
- Sticker tĩnh hiện có giữ nguyên; bổ sung pack sticker động mới.
- Chưa bao gồm: theme cá nhân, hiệu ứng trang trí theo mùa (Phase 4–5), reaction trên nhiều thiết bị đồng bộ tức thời ngoài luồng realtime sẵn có.

## 4. Hành vi nghiệp vụ

### 4.1 Reaction

- Bộ mặc định 6 cảm xúc: 👍 Thích, ❤️ Yêu thích, 😂 Haha, 😮 Wow, 😢 Buồn, 😡 Phẫn nộ.
- Nút thả cảm xúc là mục **đầu tiên trong thanh menu** hiện khi di chuột lên tin; di chuột lên nút → mở bảng 6 emoji **động** phía trên menu.
- Chọn emoji → reaction áp ngay (không chờ mạng); người khác trong hội thoại thấy qua realtime.
- Mỗi người chỉ có 1 reaction trên 1 tin: chọn loại khác = đổi; bấm lại loại đang chọn = gỡ.
- Bấm nhanh nút thả cảm xúc khi chưa react = thả 👍; khi đã react = gỡ.
- Tin có reaction hiển thị chip ở **góc dưới phía trong** của bong bóng (tin của mình: góc trái — không che icon trạng thái Đã gửi/Đã xem; tin người khác: góc phải): tối đa 3 loại nhiều nhất + tổng số, hiệu ứng pop mỗi khi thêm/gỡ.
- Tin bình chọn không có menu thao tác nên cũng không có reaction (mọi thao tác poll nằm trong card).

### 4.2 Emoji & Sticker (panel chung)

- Toolbar chỉ còn **1 nút mặt cười** mở panel chung Emoji & Sticker (nút emoji rời và nút giấy note cũ đã gộp).
- Panel gồm các tab: **Emoji** (mặc định — bộ chọn emoji đầy đủ, có tìm kiếm riêng, chọn emoji chèn vào ô nhập và panel không tự đóng để chèn liên tiếp), **Gần đây** (tự ghi nhận khi gửi), **Yêu thích** (tự đánh dấu ⭐ trên từng sticker), và tab theo từng **Pack** sticker.
- Ô **Tìm sticker** theo từ khóa (Việt/Anh) hiện ở các tab sticker.
- Pack "Animated": 10 sticker động. Pack "Smileys" (emoji to dạng ảnh tĩnh) đã bỏ khỏi bảng chọn — thay bằng tab Emoji; các tin sticker Smileys đã gửi trước đây vẫn hiển thị bình thường.
- Sticker động phát ngay trong bảng chọn và trong khung chat; chỉ phát khi đang hiển thị trên màn hình, cuộn khỏi màn hình thì tạm dừng.
- Click sticker → gửi ngay như trước.

## 5. Luồng sử dụng

1. Người dùng hover tin nhắn → hover nút mặt cười → bảng emoji động mở ra → chọn 1 emoji.
2. Reaction hiện ngay dưới tin cho chính mình; các thành viên khác nhận realtime.
3. Người dùng bấm nút mặt cười → panel mở ở tab Emoji để chèn emoji vào tin; chuyển tab để gửi sticker (gõ từ khóa tìm nhanh) → tin sticker gửi đi, hiển thị động cho cả hai phía.
4. Người dùng bấm ⭐ trên sticker hay dùng → sticker vào tab Yêu thích của riêng mình.

## 6. Input / Output

| Input | Output |
| --- | --- |
| Chọn 1 trong 6 emoji trên bảng reaction | Reaction áp lên tin, chip tổng cập nhật, đồng bộ realtime |
| Bấm lại emoji đang chọn | Gỡ reaction, chip giảm tương ứng |
| Gõ từ khóa vào ô tìm sticker | Danh sách sticker khớp trên mọi pack |
| Bấm ⭐ trên sticker | Thêm/gỡ khỏi tab Yêu thích (lưu trên thiết bị) |
| Gửi sticker động | Tin sticker phát animation, không bọc bong bóng |

## 7. Quy tắc validate

- Không thả reaction lên tin đang gửi, tin gửi lỗi, tin đã thu hồi hoặc tin sticker.
- Tin sticker: người gửi chỉ thấy thao tác Xóa; người nhận không có thao tác nào.
- Trong lúc một reaction đang gửi, các thao tác reaction khác trên tin đó tạm khóa (chống bấm dồn).
- Reaction loại cũ/không còn trong bộ hiện hành (nếu có trong dữ liệu) được bỏ qua khi hiển thị, không gây lỗi.

## 8. Trường hợp đặc biệt

| Trường hợp | Hành vi |
| --- | --- |
| Gửi reaction thất bại (mất mạng) | Tự hoàn tác về trạng thái trước đó |
| Thiết bị bật "giảm chuyển động" | Bảng reaction dùng icon tĩnh; sticker động đứng yên ở khung hình đầu |
| Sticker/animation tải lỗi | Hiển thị placeholder, không vỡ giao diện |
| Sticker id không còn trong catalog (pack đã gỡ) | Bỏ qua ở tab Gần đây/Yêu thích; trong khung chat hiển thị placeholder |
| Nhiều sticker động cùng màn hình | Chỉ sticker trong khung nhìn phát animation |
| Danh sách Gần đây | Tối đa 16 sticker, mới nhất trước, tự khử trùng lặp |

## 9. Hạn chế

- Gần đây/Yêu thích lưu trên thiết bị, chưa đồng bộ giữa các thiết bị.
- Bộ reaction mặc định là duy nhất; chưa cho chọn bộ khác (kiến trúc đã sẵn sàng).
- Chưa cho người dùng tự tải sticker pack riêng.
- Hiệu ứng khi thêm/gỡ reaction hiển thị cho chính người thao tác; phía người nhận chip cập nhật số lượng (có pop) nhưng không phát lại emoji động.

## 10. Liên kết

- Kế hoạch tổng: [`KE_HOACH_EMOJI_STICKER_THEME.md`](./KE_HOACH_EMOJI_STICKER_THEME.md)
- Yêu cầu gốc: [`TINH_NANG_EMOJI.md`](./TINH_NANG_EMOJI.md)
