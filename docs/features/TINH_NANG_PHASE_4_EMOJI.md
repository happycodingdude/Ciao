# Phase 4 — Đợt 1: Emoji cỡ lớn + Emoji động

> **Cập nhật:** 2026-07-11 · **Kế hoạch:** [`KE_HOACH_PHASE_4_GIU_CHAN.md`](./KE_HOACH_PHASE_4_GIU_CHAN.md)
> **Trạng thái:** ✅ Đã code (2026-07-11) — chờ nghiệm thu trên app thật.

---

## 1. Mục đích

- **Emoji cỡ lớn:** nhấn mạnh cảm xúc khi người dùng chỉ gửi emoji — tin hiển thị nổi bật, không bọc bong bóng.
- **Emoji động:** tăng tính biểu cảm sống động — một tập emoji quen thuộc có chuyển động nhẹ khi hiển thị.

## 2. Phạm vi

- Áp dụng cho tin nhắn văn bản trong mọi hội thoại (direct và nhóm).
- Không áp dụng cho: tin thu hồi, tin chuyển tiếp, tin trả lời, tin kèm ảnh/tệp, sticker, GIF, thẻ liên hệ, bình chọn.
- Emoji động giai đoạn đầu chỉ áp dụng trong tin emoji-only hiển thị cỡ lớn (chưa áp dụng cho emoji lẫn trong câu chữ).

## 3. Các giai đoạn thực hiện

| Giai đoạn | Mục tiêu | Trạng thái |
| --- | --- | --- |
| Đợt 1 — Emoji cỡ lớn | Tin chỉ chứa emoji trong ngưỡng hiển thị cỡ lớn, không bong bóng | ✅ Đã code |
| Đợt 1 — Emoji động | Tập emoji hỗ trợ có chuyển động vài nhịp rồi dừng | ✅ Đã code |

## 4. Hành vi nghiệp vụ

### 4.1 Emoji cỡ lớn

- Tin **chỉ gồm emoji** (tối đa **5 emoji**, không kèm chữ/số) → hiển thị **cỡ lớn, không bọc bong bóng** (tương tự sticker).
- Cỡ hiển thị **giảm dần theo số lượng**: 1 emoji lớn nhất; 4–5 emoji nhỏ hơn nhưng vẫn lớn hơn chữ thường.
- Vượt ngưỡng (≥ 6 emoji) hoặc lẫn ký tự chữ/số → hiển thị **cỡ thường trong bong bóng** như tin văn bản bình thường.
- Các thao tác trên tin (reply, forward, pin, reaction, thu hồi, chỉnh sửa, hover xem giờ gửi…) hoạt động như tin văn bản thường.

### 4.2 Emoji động

- Emoji thuộc **tập hỗ trợ** khi hiển thị cỡ lớn sẽ có chuyển động phù hợp ngữ nghĩa (tim đập, cười lắc lư, pháo tung, vẫy tay…).
- Chuyển động chạy **vài nhịp rồi dừng** (không lặp vô hạn) để tránh gây nhiễu và giữ hiệu năng.
- **Tôn trọng tùy chọn "giảm chuyển động"** của hệ điều hành/trình duyệt: khi bật, emoji hiển thị tĩnh hoàn toàn.
- Emoji ngoài tập hỗ trợ hiển thị tĩnh.

## 5. Luồng sử dụng

1. Người dùng gửi tin chỉ chứa emoji (ví dụ "❤️" hoặc "😂😂😂").
2. Tin hiển thị cỡ lớn ngay cho cả người gửi và người nhận, không bọc bong bóng.
3. Emoji thuộc tập hỗ trợ chuyển động vài nhịp rồi đứng yên.
4. Nếu tin được chỉnh sửa thành có chữ kèm theo → tự trở về hiển thị thường; chỉnh sửa thành emoji-only → hiển thị cỡ lớn.

## 6. Input / Output

| Input | Output |
| --- | --- |
| Nội dung tin chỉ chứa 1–5 emoji (có thể lẫn khoảng trắng) | Emoji cỡ lớn, không bong bóng; emoji hỗ trợ có chuyển động |
| Nội dung ≥ 6 emoji hoặc lẫn chữ/số | Hiển thị thường trong bong bóng |
| Hệ thống bật "giảm chuyển động" | Emoji tĩnh, giữ nguyên cỡ lớn |

## 7. Quy tắc validate

- Chỉ xét tin văn bản thuần: tin thu hồi/chuyển tiếp/trả lời/kèm đính kèm không bao giờ áp dụng cỡ lớn.
- Khoảng trắng (space, xuống dòng) giữa các emoji **không** phá điều kiện emoji-only.
- Đếm emoji theo **ký tự hiển thị hoàn chỉnh**: emoji ghép (gia đình 👨‍👩‍👧‍👦, cờ 🇻🇳, tông da 👍🏽, keycap 1️⃣) tính là **một** emoji và giữ nguyên ý nghĩa.

## 8. Trường hợp đặc biệt

| Trường hợp | Hành vi |
| --- | --- |
| Emoji lẫn khoảng trắng ("😂 😂") | Vẫn coi là emoji-only, hiển thị cỡ lớn |
| Emoji ghép phức tạp (ZWJ, cờ, tông da) | Tính 1 emoji, không bị tách rời ý nghĩa |
| Đúng ngưỡng 5 emoji | Vẫn cỡ lớn (cỡ nhỏ nhất trong dải) |
| 6 emoji trở lên | Cỡ thường, có bong bóng |
| Tin emoji bị thu hồi | Placeholder "Tin nhắn đã được thu hồi" như tin thường |
| Thiết bị/trình duyệt bật "giảm chuyển động" | Toàn bộ emoji hiển thị tĩnh |
| Trình duyệt quá cũ không phân tách được emoji | Tự động về hiển thị thường (an toàn) |

## 9. Hạn chế

- Ngưỡng số emoji cố định theo cấu hình (hiện là 5), chưa cho người dùng tùy chỉnh.
- Chỉ một tập emoji định sẵn có chuyển động; các emoji khác hiển thị tĩnh.
- Emoji động chưa áp dụng cho emoji nằm lẫn trong câu chữ và trong reaction.
- Chưa có cài đặt riêng trong app để tắt chuyển động (hiện theo tùy chọn hệ thống).

## 10. Liên kết

- Kế hoạch Phase 4: [`KE_HOACH_PHASE_4_GIU_CHAN.md`](./KE_HOACH_PHASE_4_GIU_CHAN.md)
- Roadmap tổng: [`PRODUCT_ROADMAP.md`](./PRODUCT_ROADMAP.md)
