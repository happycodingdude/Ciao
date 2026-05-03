# Fix: IME Double-fire Bug trong useChatInputKeyboard

## Mục đích
Sửa bug `keydownBindingFn` bị gọi 2 lần khi dùng bộ gõ tiếng Việt (hoặc bất kỳ IME nào) trên Mac.

## Luồng hoạt động
Khi dùng bộ gõ IME (Telex, VNI, Unikey...), browser bắn **2 keydown event** khi nhấn Enter:

1. `keydown` với `isComposing = true` → IME đang commit ký tự đang compose
2. `keydown` với `isComposing = false` → phím thật sự được nhấn

Trước khi fix, cả 2 event đều được xử lý → `chat()` bị gọi 2 lần, tin nhắn gửi đôi.

## Fix
Chỉ thêm guard vào `keydownBindingFn` — **không** thêm vào `keyupBindingFn`:

```ts
// keydownBindingFn — guard ở đây để ngăn double chat()
if (e.nativeEvent.isComposing) return;
```

**Tại sao không guard keyupBindingFn:**
`keyupBindingFn` chứa logic `filterMentions()`. Khi gõ tiếng Việt, toàn bộ quá trình gõ có `isComposing = true`, nếu guard ở đây thì mention search không bao giờ chạy được.

## Lưu ý khi sử dụng
- Fix này áp dụng cho mọi IME: tiếng Việt, Nhật, Trung, Hàn
- Không ảnh hưởng tiếng Anh (không có IME → `isComposing` luôn `false`)
- Chỉ guard `keydown` — double-fire xảy ra ở keydown (Enter commit IME), không phải keyup
