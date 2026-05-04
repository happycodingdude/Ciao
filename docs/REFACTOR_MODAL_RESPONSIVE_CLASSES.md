# REFACTOR MODAL RESPONSIVE CLASSES

## Mục đích

Loại bỏ trùng lặp các chuỗi class responsive Tailwind giống hệt nhau ở 6 component modal. Trước refactor, các pattern dưới đây xuất hiện y hệt ở nhiều chỗ:

- `phone:w-80 laptop:w-100 desktop:w-[35%]`
- `phone:w-100 laptop:w-150 desktop:w-[35%]`
- `phone:h-100 laptop:h-120 laptop-lg:h-150 desktop:h-200`

Khi cần thay đổi kích thước modal, phải sửa nhiều file → dễ sót, dễ lệch giá trị giữa các modal.

## Cách hoạt động

Tận dụng `@utility` của Tailwind CSS v4 (đã được codebase sử dụng cho ~30 utility khác trong [index.css](../client/src/index.css)) để extract pattern thành 3 utility class:

```css
@utility modal-size-sm {
  @apply phone:w-80 laptop:w-100 desktop:w-[35%];
}

@utility modal-size-lg {
  @apply phone:w-100 laptop:w-150 desktop:w-[35%];
}

@utility modal-content-h {
  @apply phone:h-100 laptop:h-120 laptop-lg:h-150 desktop:h-200;
}
```

`@apply` giữ nguyên giá trị Tailwind tokens → CSS output không đổi → không thay đổi UI/behavior.

## Cách sử dụng

### Modal width nhỏ (forward message, add friend, share image)

```tsx
<BackgroundPortal className="modal-size-sm" ...>
  <div className="modal-content-h flex flex-col p-5">
    {/* content */}
  </div>
</BackgroundPortal>
```

### Modal width lớn (create group, add members)

```tsx
<BackgroundPortal className="modal-size-lg" ...>
  <div className="modal-content-h flex flex-col gap-4 p-7">
    {/* content */}
  </div>
</BackgroundPortal>
```

## Bảng breakpoints áp dụng

| Utility | phone (≥30rem) | laptop (≥80rem) | laptop-lg (≥95rem) | desktop (≥160rem) |
|---|---|---|---|---|
| `modal-size-sm` | w-80 | w-100 | — | w-[35%] |
| `modal-size-lg` | w-100 | w-150 | — | w-[35%] |
| `modal-content-h` | h-100 | h-120 | h-150 | h-200 |

## Files đã thay đổi

- [client/src/index.css](../client/src/index.css) — thêm 3 `@utility`
- [client/src/components/friend/AddFriend.tsx](../client/src/components/friend/AddFriend.tsx)
- [client/src/components/conversation/AddMembers.tsx](../client/src/components/conversation/AddMembers.tsx)
- [client/src/components/conversation/CreateGroupChat.tsx](../client/src/components/conversation/CreateGroupChat.tsx)
- [client/src/components/message/MessageMenu.tsx](../client/src/components/message/MessageMenu.tsx)
- [client/src/components/message/MessageMenu_Slide.tsx](../client/src/components/message/MessageMenu_Slide.tsx)
- [client/src/components/conversation/ShareImage.tsx](../client/src/components/conversation/ShareImage.tsx)

## Lưu ý khi sử dụng

- Khi cần đổi kích thước modal, **chỉ sửa 1 chỗ** duy nhất trong [index.css](../client/src/index.css).
- Không tự thêm class width/height responsive trực tiếp vào component nếu pattern đã có utility — dùng utility để giữ tính nhất quán.
- Nếu xuất hiện modal có kích thước hoàn toàn khác (ví dụ rất nhỏ hoặc rất to), tạo thêm utility mới (`modal-size-xs`, `modal-size-xl`...) thay vì hardcode trong component.
- Không thay đổi tên breakpoint (`phone`, `laptop`, `laptop-lg`, `desktop`) — đã được định nghĩa trong `@theme` block của index.css.
