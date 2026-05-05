# PANEL_LAYOUT_CONSISTENCY

## Mục đích

Đảm bảo 2 sidebar (ListChat trái, Information/Attachment phải) và 3 panel header (ChatboxHeader, Information header, Attachment header) đồng bộ về kích thước. Trước đây các giá trị này được hardcode rời rạc ở từng component → khi sửa 1 chỗ phải đi tìm và sửa nhiều file, dễ lệch.

## Cách hoạt động

Hai utility class được khai báo tập trung trong [client/src/index.css](../client/src/index.css):

### `sidebar-w`
- Áp dụng cho 2 panel sidebar (cùng độ rộng).
- Width: `clamp(17rem, 22%, 20rem)` ở breakpoint `laptop`, `clamp(20rem, 22%, 30rem)` ở `laptop-lg`.

### `panel-header-h`
- Áp dụng cho header của các panel có border-bottom dùng làm divider.
- Height: `h-24` ở breakpoint `phone`, `h-16` ở `laptop`. Kèm `shrink-0` tránh bị flex co lại.
- Đảm bảo border-bottom của tất cả panel header **nằm trên cùng 1 đường ngang** với ChatboxHeader.

## Cách sử dụng

Khi tạo panel mới có header có border:
```tsx
<div className="border-b-(--border-color) panel-header-h flex items-center border-b-[.1rem] bg-white px-4">
  ...
</div>
```

Khi tạo sidebar mới cần cùng độ rộng với ListChat / Information:
```tsx
<div className="sidebar-w ...">...</div>
```

## Vị trí đang dùng

| Utility | File |
|---|---|
| `sidebar-w` | [routes/_layout.conversations.tsx](../client/src/routes/_layout.conversations.tsx) — sidebar trái |
| `sidebar-w` | [components/layouts/ChatboxContainer.tsx](../client/src/components/layouts/ChatboxContainer.tsx) — sidebar phải |
| `panel-header-h` | [components/conversation/ChatboxHeader.tsx](../client/src/components/conversation/ChatboxHeader.tsx) |
| `panel-header-h` | [components/conversation/Information.tsx](../client/src/components/conversation/Information.tsx) |
| `panel-header-h` | [components/conversation/Attachment.tsx](../client/src/components/conversation/Attachment.tsx) |

## Lưu ý

- KHÔNG hardcode lại `clamp(17rem,22%,20rem)` hoặc `phone:h-24 laptop:h-16` ở các component mới — luôn dùng utility.
- Nếu cần đổi kích thước sidebar/header, **chỉ sửa trong `index.css`** — toàn bộ panel sẽ đồng bộ tự động.
