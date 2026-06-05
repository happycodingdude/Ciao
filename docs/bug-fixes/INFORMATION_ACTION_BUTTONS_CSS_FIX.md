# INFORMATION_ACTION_BUTTONS_CSS_FIX

## Mục đích

Fix CSS lệch kích thước cho danh sách action buttons (Add member, Search, Video call, Leave group) trong Information panel.

## Cách hoạt động

Class `.conversation-action` trong [client/src/styles/information.css](../client/src/styles/information.css) trước đây chỉ có `aspect-ratio: 1/1` mà không có `width` cố định → mỗi button "co" theo kích thước icon bên trong, dẫn đến:

- Các button không đồng đều (icon `UsergroupAddOutlined` rộng hơn `SearchOutlined`)
- Hội thoại đơn (direct chat) chỉ render 2 button (Search + Video) → 2 chấm nhỏ phân bố qua `space-evenly` trông rất lệch
- Riêng wrapper AddMembers có `laptop:w-10 laptop-lg:w-12` áp inline → vô tình che một phần triệu chứng ở group chat, làm bug khó phát hiện

### Fix

- Thêm `width` cố định cho `.conversation-action`: 2.5rem (40px) mặc định, 3rem (48px) từ breakpoint `laptop-lg` (95rem / 1520px) trở lên
- Xóa class `laptop:w-10 laptop-lg:w-12` thừa ở wrapper AddMembers trong [Information.tsx](../client/src/components/conversation/Information.tsx) → tất cả button share cùng 1 nguồn width

## Lưu ý khi sử dụng

- Mọi button trong `.conversation-action-container` giờ có cùng kích thước; nếu sau này cần thay đổi size → sửa trong [information.css](../client/src/styles/information.css), không sửa inline
- Aspect-ratio 1/1 vẫn được giữ để đảm bảo button luôn tròn
