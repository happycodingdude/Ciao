# FIX: Không hiển thị thời gian tin nhắn khi hover

## Mục đích

Sửa lỗi `<p className="message-time">` không hiển thị (opacity vẫn = 0) khi người
dùng hover vào bubble tin nhắn hoặc menu hành động trong `MessageContent`.

## Nguyên nhân (root cause)

CSS trong `client/src/styles/messagecontent.css` sử dụng selector sibling
combinator:

```css
.message-time {
  opacity: 0;
  .peer:hover ~ &,
  .message-menu-container:hover ~ & {
    opacity: 1;
  }
}
```

Selector này yêu cầu `.message-time` PHẢI là **sibling đứng sau**
`.peer` (hoặc `.message-menu-container`) trong cùng một parent.

Tuy nhiên, trong JSX cũ, `<p.message-time>` bị bọc trong một wrapper:

```jsx
<div className="flex flex-col items-end gap-1">
  <p className="message-time">...</p>      // ← descendant của wrapper
  {receipt status}
</div>
```

→ `.message-time` trở thành **descendant**, không còn là sibling trực tiếp
của `.peer` nữa → selector `~` không match → hover không có hiệu lực.

## Cách hoạt động sau khi fix

Bỏ wrapper, đưa `<p.message-time>` ra ngoài làm sibling trực tiếp của `.peer`
và `.message-menu-container`. Vì `.message-time` đang dùng `position: absolute`,
nên việc move ra ngoài không ảnh hưởng layout (vẫn neo theo parent `relative`).

Cấu trúc DOM sau khi fix:

```
<div className="relative flex w-fit flex-col ...">      // parent (relative)
  <div className="peer ...">...</div>                   // [sibling] bubble
  {pin badge}                                            // [sibling]
  <MessageMenu_Slide />                                  // [sibling] .message-menu-container
  <p className="message-time">...</p>                    // [sibling] ✅ match selector ~
  {receipt status}                                       // [sibling] in-flow bên dưới
</div>
```

## Lưu ý khi sử dụng / khi bảo trì

- **KHÔNG** bọc `<p.message-time>` trong bất kỳ wrapper div nào. Nếu bọc,
  selector `.peer:hover ~ .message-time` sẽ ngừng hoạt động trở lại.
- Khi thêm element mới vào trong message bubble container, đảm bảo
  `.message-time` vẫn nằm cùng cấp với `.peer` và `.message-menu-container`.
- Nếu cần thêm nhiều phần tử "phụ" bên cạnh time (badge, status...), hãy giữ
  chúng làm sibling riêng biệt, hoặc cập nhật selector CSS cho phù hợp
  (ví dụ dùng `:has()` trên parent container).

## File ảnh hưởng

- `client/src/components/message/MessageContent.tsx` (bỏ wrapper)
- `client/src/styles/messagecontent.css` (giữ nguyên - không cần đổi)
