# Đồng nhất style chat preview (notifications) với khung chat (conversations)

> MODE: FRONTEND. Pane review tin nhắn ở trang /notifications (`ConversationReview.tsx`)
> được chỉnh để khớp visual với khung chat thật (`MessageContent.tsx`).

## Thay đổi (chỉ `components/notification/ConversationReview.tsx`)

| Yếu tố | Trước | Sau (khớp khung chat) |
|---|---|---|
| Bong bóng | tin mình `bg-light-blue-500`/trắng chữ; người khác `bg-(--bg-color-extrathin)` | **`bg-white` + `shadow-[0_2px_10px_rgba(0,0,0,0.1)]` + `rounded-xl`** cho CẢ hai phía (phân biệt bằng canh lề + avatar) |
| Nền vùng tin | mặc định | `bg-(--bg-color)` (đúng backdrop chat → bong bóng trắng nổi nhờ shadow) |
| Avatar | `w-7`, hiện ở MỌI tin | `h-8`, **gom block** theo người gửi liên tiếp (avatar chỉ ở tin đầu block) |
| Tên người gửi (group) | `text-3xs` mờ, mọi tin | `text-(--text-main-color-thin) font-medium`, chỉ tin đầu block |
| Giờ | `h:mm A` | `HH:mm` (như `MessageContent`) |
| Tin thu hồi | "Message was recalled" | "Tin nhắn đã được thu hồi" (như khung chat) |
| Highlight tin nguồn | `bg-amber-200` đặc | `bg-amber-100 ring-amber-300` (mềm hơn trên nền trắng) |

Giữ nguyên: header pane + nút "Open in chat", logic fetch/highlight/scroll, read-only.
Không nhúng `MessageContent` (có menu/edit/reaction/reply — nặng & tương tác, không hợp
pane read-only) → chỉ match visual.

## Validate
- `tsc --noEmit` → sạch (3 lỗi pre-existing không liên quan).
- Thuần CSS class → xem qua dev server (HMR) ở /notifications, chọn 1 notification có hội thoại.

## Cập nhật 2026-06-28 — giảm cỡ chữ
Cỡ chữ bong bóng giảm `text-sm` → **`text-xs`** (padding `px-3.5 py-1.5`) cho gọn hơn.
