# Kế hoạch — Sticker, Reaction & Personal Theme System

> **Lập kế hoạch:** 2026-07-11 · **Tài liệu tính năng:** [`TINH_NANG_REACTION_STICKER.md`](./TINH_NANG_REACTION_STICKER.md)
> **Trạng thái:** ✅ Phase 1–3 ĐÃ NGHIỆM THU trên app thật (2026-07-11); Phase 4–5 làm đợt sau.
> **Quyết định đã chốt:** reaction động và bản tĩnh đồng bộ dùng bộ asset đã chọn sẵn; sticker động ship kèm dùng nguồn giấy phép mở, đóng gói theo định dạng sticker động chuẩn; kiến trúc Pack cho phép thay bộ asset khác về sau mà không sửa logic.

---

## Các giai đoạn thực hiện

| Phase | Mục tiêu | Phụ thuộc | Rollback | Trạng thái |
| --- | --- | --- | --- | --- |
| 1. Nền tảng Pack & Animation | Hệ thống Pack (Reaction/Sticker/Theme/Animation) data-driven + trình phát animation dùng chung, lazy load, cache, tôn trọng "giảm chuyển động" | — | Không ảnh hưởng tính năng hiện có | ✅ Nghiệm thu 2026-07-11 |
| 2. Reaction động | Bộ reaction mặc định 👍 ❤️ 😂 😮 😢 😡 dạng animated, hiệu ứng khi thêm/gỡ, tương thích reaction cũ đã lưu | Phase 1 | Quay về icon tĩnh hiện tại | ✅ Nghiệm thu 2026-07-11 |
| 3. Sticker động | Hỗ trợ sticker động; picker mới: Recent, Favorite, Search, tab theo Pack + tab Emoji | Phase 1 | Pack tĩnh cũ vẫn hoạt động | ✅ Nghiệm thu 2026-07-11 |
| 4. Personal Theme | 3 theme cá nhân (Christmas, Halloween, Valentine): nền, pattern, màu bong bóng, accent, icon, decoration — chỉ người bật nhìn thấy | Phase 1 | Tắt theme = trở về hiển thị hiện tại | ⏳ Đợt sau |
| 5. Seasonal Animation | Hiệu ứng trang trí theo mùa (tuyết rơi, tim bay, ma, bí ngô) gắn với theme, thuần trang trí | Phase 1, 4 | Tắt animation không ảnh hưởng chat | ⏳ Đợt sau |
| 6. Nghiệm thu & Tài liệu | Verify build/UI/console, cập nhật tài liệu tính năng | 1–5 | — | ✅ Nghiệm thu app thật 2026-07-11 (phần Phase 1–3) |

---

## Mục tiêu

- Nâng trải nghiệm chat sinh động như các ứng dụng nhắn tin hiện đại: reaction động, sticker động, theme cá nhân theo mùa.
- Kiến trúc Pack mở rộng được: thêm Reaction Pack / Sticker Pack / Theme Pack / Animation Pack mới chỉ bằng khai báo dữ liệu + tài nguyên, không sửa logic.

## Phạm vi

- Toàn bộ nằm ở phía giao diện; hệ thống máy chủ không thay đổi (reaction đã nhận loại reaction dạng chuỗi tự do).
- Personal Theme chỉ hiển thị cho chính người bật, lưu trên thiết bị, không đồng bộ giữa các thiết bị (giai đoạn đầu).
- Không thay đổi layout khung chat; theme chỉ đổi nền, pattern, màu bong bóng, màu accent, màu icon, trang trí.

## Hành vi nghiệp vụ

### Reaction
- Bộ mặc định: 👍 ❤️ 😂 😮 😢 😡, hiển thị dạng emoji động.
- Có hiệu ứng khi thêm hoặc gỡ reaction; danh sách reaction đang có trên tin vẫn hiển thị như hiện tại.
- Reaction kiểu cũ đã lưu (ví dụ "care") vẫn hiển thị đúng, không mất dữ liệu.
- Khi hệ điều hành bật "giảm chuyển động": reaction hiển thị tĩnh.

### Sticker
- Hỗ trợ sticker animated; sticker tĩnh hiện có giữ nguyên.
- Picker gồm: hàng Gần đây (tự ghi nhận khi gửi), mục Yêu thích (người dùng tự đánh dấu), ô Tìm kiếm theo từ khóa, và tab theo từng Pack.
- Sticker animated chỉ chạy khi đang hiển thị trong khung nhìn; dừng khi cuộn khỏi màn hình.

### Personal Theme
- Người dùng chọn theme trong phần tùy chỉnh đoạn chat, mục riêng ghi rõ "chỉ mình bạn nhìn thấy".
- Theme cá nhân (khi bật) được ưu tiên hiển thị hơn tùy chỉnh chung của hội thoại; tắt theme → trở về tùy chỉnh chung.
- Mỗi theme gồm: nền + pattern lặp, bảng màu bong bóng/accent/icon, trang trí, hiệu ứng mùa, và gợi ý sticker pack cùng chủ đề.

### Seasonal Animation
- Là lớp trang trí phủ trên khung chat, không chặn thao tác, không thay thế sticker/reaction.
- Chạy nhẹ, tự tôn trọng "giảm chuyển động" (tắt hoàn toàn khi bật).

## Quy tắc validate & trường hợp đặc biệt

| Trường hợp | Hành vi |
| --- | --- |
| Reaction kiểu cũ trong dữ liệu ("care", "laughing"…) | Vẫn hiển thị bằng icon tương ứng |
| Thiết bị bật "giảm chuyển động" | Reaction/sticker hiển thị khung hình tĩnh, hiệu ứng mùa tắt |
| Tài nguyên animation tải lỗi | Hiển thị icon/ảnh tĩnh thay thế, không vỡ giao diện |
| Sticker id lạ (pack đã gỡ) | Hiển thị placeholder như hiện tại |
| Theme cá nhân bật cùng lúc với theme hội thoại | Theme cá nhân thắng trên máy người bật |
| Nhiều sticker animated cùng màn hình | Chỉ phát khi trong khung nhìn để giữ hiệu năng |

## Hiệu năng

- Lazy load: trình phát animation, manifest từng Sticker Pack, theme asset, hiệu ứng mùa — chỉ tải khi dùng đến.
- Cache tài nguyên đã tải (trong phiên + HTTP cache), không tải lại khi mở lại picker.

## Rủi ro & điểm cần quyết định

| Rủi ro | Đánh giá | Hướng xử lý |
| --- | --- | --- |
| Nguồn asset animation | Cần đảm bảo bộ asset ship kèm có giấy phép phù hợp lâu dài | Kiến trúc Pack cho phép thay bộ asset khác sau này không sửa logic; ưu tiên nguồn giấy phép mở |
| Nguồn sticker | Định dạng sticker động là chuẩn mở; nội dung ship kèm cần giấy phép rõ ràng | Hỗ trợ đầy đủ định dạng; nội dung ship kèm chỉ dùng pack có giấy phép hợp lệ |
| Hiệu năng nhiều animation | Nhiều sticker/hiệu ứng chạy cùng lúc gây tốn CPU | Chỉ phát khi hiển thị, giới hạn số vòng lặp, tắt theo "giảm chuyển động" |
| Xung đột theme cá nhân ↔ theme hội thoại | Hai lớp tùy chỉnh chồng nhau | Quy tắc ưu tiên rõ: cá nhân thắng trên máy người bật |

## Hạn chế (giai đoạn đầu)

- Personal Theme chưa đồng bộ giữa các thiết bị.
- Chưa cho người dùng tự tải sticker pack riêng.
- Reaction pack mặc định là duy nhất; chọn pack khác là mở rộng tương lai.
