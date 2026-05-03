# Refactor Client — Frontend

## Mục đích

Làm sạch và tách concern trong các component lớn của thư mục `/client/src`, tập trung vào:
- Loại bỏ dead code
- Sửa Rules of Hooks
- Gom duplicate logic thành custom hooks
- Tách component quá lớn

---

## Luồng hoạt động

### Hooks mới

| Hook | Mục đích |
|---|---|
| `hooks/useMentionList.ts` | Build/filter danh sách mention từ members. Thay thế 3 chỗ duplicate trong `ChatInput.tsx` |
| `hooks/useSendMessage.ts` | Toàn bộ mutation gửi tin nhắn + optimistic cache update. Tách ra từ `ChatInput.tsx` |

### Components mới

| Component | Mục đích |
|---|---|
| `components/conversation/MentionDropdown.tsx` | UI dropdown hiển thị danh sách mention |
| `components/common/ReplyPreview.tsx` | UI preview tin nhắn đang reply |

---

## Thay đổi chính

### `ChatInput.tsx` (928 → 443 dòng)
- Extract `useMentionList` — loại bỏ 3 chỗ duplicate build mention list
- Extract `useSendMessage` — loại bỏ ~200 dòng mutation logic
- Extract `MentionDropdown` và `ReplyPreview` component
- Wrap `chat` và `chooseMention` trong `useCallback` — fix unstable reference trong dependency array
- Sửa `removeFile` dep array từ `[files]` → `[]`

### `Chatbox.tsx`
- Wrap `fetchMoreMessage` trong `useCallback([queryClient])` → `debounceFetch` via `useMemo` giờ stable, không tạo debounce mới mỗi render

### `MessageContent.tsx` (286 → 157 dòng)
- Xoá `reaction` state (derived từ `message` prop, không dùng trong JSX)
- Xoá `topReactions` state và `generateMostReaction` callback (dead code)
- Xoá `isExpanded` và `isOverflowing` state (đã chuyển sang `MessageItem.tsx`)
- Xoá `contentRef` (chỉ dùng cho overflow check đã xoá)
- Xoá `react()` function (không được gọi từ JSX)
- Dùng `isSelf` local variable thay vì tính lặp `message.contactId === info?.id`

---

---

## Refactor 2 — Gom logic gửi tin nhắn direct

### Hook mới

| Hook | Mục đích |
|---|---|
| `hooks/useDirectMessage.ts` | Gửi tin nhắn tới một contact (tìm/tạo direct conversation, update cache optimistically) |

### Updated files

| File | Trước | Sau |
|---|---|---|
| `components/friend/QuickChat.tsx` | 288 dòng | 132 dòng |
| `components/message/ForwardMessageModal.tsx` | 328 dòng | 121 dòng |

### Cách dùng `useDirectMessage`

```typescript
const { sendToContact } = useDirectMessage();

// Gửi text
await sendToContact(contact, { type: "text", content: "Hello" });

// Forward (có media)
await sendToContact(contact, {
  type: "media",
  content: null,
  attachments: [...],
  isForwarded: true,
});

// Quick chat (có navigate + prefetch)
await sendToContact(
  contact,
  { type: "text", content: "Hi" },
  {
    prefetch: true,
    onNavigate: (convId) => router.navigate({ to: `/conversations/${convId}` }),
  },
);
```

### Bug đã fix

`QuickChat.tsx` cũ dùng `["message"]` (không có conversationId) làm query key cho optimistic update → data bị mất khi `useMessage(realId)` query. Hook mới dùng đúng key `["message", conversationId]`.

---

## Lưu ý khi sử dụng

- `useSendMessage(conversationId)` trả về `mutate` function — gọi trực tiếp với `SendMessageRequest`
- `useMentionList(members, selfId)` cần re-init khi conversation thay đổi — gọi `resetMentions()` trong `useEffect([conversation?.id])`
- `MentionDropdown` dùng `data-show` attribute để control visibility qua Tailwind data- classes
