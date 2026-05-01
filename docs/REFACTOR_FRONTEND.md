# Frontend Codebase Refactor

## Phạm vi

Refactor toàn bộ `client/src/` — ~100 file TypeScript/React. Không thay đổi business logic, chỉ cải thiện chất lượng code.

---

## Các vấn đề đã xử lý

### 1. Xóa console.log debug

Xóa tất cả `console.log` / `console.warn` không cần thiết trong:

| File | Nội dung xóa |
|------|-------------|
| `context/SignalContext.tsx` | "Rendering useSignal", "Rendering SignalProvider", "🔔 On track", "Cleaning up Firebase" |
| `routes/_layout.tsx` | "Checking authentication", "Rendering AppLayout" |
| `routes/_layout.conversations.$conversationId.tsx` | "Rendering Conversation Layout for ID:" |
| `routes/auth._layout.tsx` | "User chưa đăng nhập" |
| `utils/signalManager.ts` | "✅ SignalR connected", "🛑 SignalR stopped" |
| `utils/uploadFile.ts` | "Uploaded Files:", "Upload failed:" |
| `pages/Home.tsx` | "Rendering HomeComponent" |
| `pages/Authentication.tsx` | "Rendering AuthenticationContainer" |
| `pages/Connection.tsx` | "Rendering ConnectionComponent" |
| `pages/Notification.tsx` | "Rendering NotificationComponent" |
| `pages/Setting.tsx` | "Rendering SettingComponent" |
| `components/layouts/SideBarMenu.tsx` | "Refreshing conversation list" |
| `components/layouts/ChatboxContainer.tsx` | "Rendering ChatboxContainer" |
| `components/conversation/ChatboxMenu.tsx` | "ChatboxMenu calling" |
| `components/conversation/ChatInput.tsx` | "text to search:", content debug |
| `services/notification.service.ts` | "Processing notification:", "NewFriendRequest:", "Token failed", "Error:" |

> **Giữ lại**: `console.error` cho media devices, copy failure — những lỗi runtime thực sự.

---

### 2. Xóa khối code comment lớn (dead code)

| File | Khối xóa |
|------|---------|
| `context/SignalContext.tsx` | Toàn bộ SignalR setup cũ (~90 dòng) — đã được thay bằng Firebase |
| `services/notification.service.ts` | Hàm `setupListeners` cũ (~55 dòng) — SignalR listeners không còn dùng |
| `pages/Home.tsx` | Drag-and-drop VideoCall code (~25 dòng) |
| `pages/Authentication.tsx` | Comment wrapper `<AuthenticationFormTogglesProvider>` thừa |
| `components/conversation/ChatInput.tsx` | Old `chooseMention` version, event listener blocks |
| `components/conversation/ChatboxMenu.tsx` | Old click handler div |
| `components/videocall/VideoCall.tsx` | Old `remoteStream` useEffect với setTimeout |
| `routes/_layout.conversations.$conversationId.tsx` | Lazy load comment block |
| `routes/_layout.tsx` | `ReactQueryDevtools` (không nên có trong production bundle) |

---

### 3. Fix React bugs

#### Rules of Hooks violations
Các component gọi hooks SAU conditional return — vi phạm React Rules of Hooks:

| File | Vấn đề | Fix |
|------|--------|-----|
| `components/conversation/Chatbox.tsx` | `Route.useParams()` sau `if (!conversations) return null` | Đổi thứ tự: hooks trước, early return sau |
| `components/common/BackgroundPortal.tsx` | `useCallback`, `useEventListener` sau `if (!show) return null` | Đổi thứ tự tương tự |

#### SideBarMenu — Critical bug
Ripple effect code chạy trong **component body** (không phải useEffect) → đăng ký `addEventListener` trùng lặp mỗi lần render:

```tsx
// TRƯỚC (bug): chạy mỗi render
document.querySelectorAll(".sidebar-item").forEach((item) => {
  item.addEventListener("click", ...);
});

// SAU: chạy 1 lần, có cleanup
useEffect(() => {
  // ... đăng ký
  return () => {
    // ... cleanup tất cả listeners
  };
}, []);
```

---

### 4. Fix deprecated APIs

Thay `keyCode` (deprecated) → `key` trên tất cả file:

| File | Trước | Sau |
|------|-------|-----|
| `BackgroundPortal.tsx` | `keyCode === 27` | `key === "Escape"` |
| `Notification.tsx` | `keyCode === 27` | `key === "Escape"` |
| `QuickChat.tsx` | `keyCode === 13`, `keyCode === 27` | `key === "Enter"`, `key === "Escape"` |
| `SigninForm.tsx` | `keyCode == 13` | `key === "Enter"` |

---

### 5. Fix JSX patterns

#### `""` → `null` trong conditional renders
React không render `null`, nhưng render `""` tạo ra empty text node — dùng `null` là đúng:

| File | Fix |
|------|-----|
| `ChatSection.tsx` | `: ""` → `: null` (2 chỗ) |
| `ListChat.tsx` | `: ""` → `: null` |
| `ListchatContent.tsx` | `: ""` → `: null` (online status dot) |
| `MessageReaction.tsx` | `: ""` → `: null` (reaction total) |
| `BackgroundPortal.tsx` | `noHeader ? "" :` → `!noHeader &&` |

#### Missing `key` props
| File | Fix |
|------|-----|
| `ListFriend.tsx` | `contacts.map((item, i) =>` → thêm `key={item.id}`, bỏ index `i` |
| `MessageReaction.tsx` | `topReactions.map` → thêm `key={item}` |

#### Simplify topReactions render
```tsx
// TRƯỚC: 6 if-else, 12 dòng
{message.topReactions.map((item) => {
  if (item === "like") return <div className="top-reaction bg-[url('/assets/like.svg')]" />
  if (item === "love") return <div className="top-reaction bg-[url('/assets/love.svg')]" />
  ...
})}

// SAU: 1 dòng
{message.topReactions.map((item) => (
  <div key={item} className={`top-reaction bg-[url('/assets/${item}.svg')]`} />
))}
```

---

### 6. Tailwind canonical classes

`ChatboxMenu.tsx`: Chuyển arbitrary values sang canonical:
- `top-[-10rem]` → `-top-40`
- `z-[10]` → `z-10`
- `gap-[.5rem]` → `gap-2`
- `gap-[1rem]` → `gap-4`
- `pl-[1rem]` → `pl-4`
- `leading-[4rem]` → `leading-16`
- `bg-[var(--bg-color)]` → `bg-(--bg-color)`
- `text-[var(--text-main-color)]` → `text-(--text-main-color)`
- `hover:bg-[var(--main-color-extrathin)]` → `hover:bg-(--main-color-extrathin)`
- `w-[3rem]` → `w-12`

---

### 7. Unused imports/variables

| File | Xóa |
|------|-----|
| `ChatInput.tsx` | `SendMessageResponse` (unused import), `hideMentionOnKey` (declared but event listener commented out) |
| `pages/Home.tsx` | `useInfo` hook (unused) |
| `pages/Connection.tsx` | `useInfo` hook (unused) |
| `pages/Notification.tsx` | `useInfo` hook (unused) |
| `pages/Setting.tsx` | `useInfo` hook (unused) |
| `services/notification.service.ts` | `ConversationModel_Member` (tạm xóa nhầm, đã restore vì `updateConversationCache` vẫn dùng) |
| `routes/_layout.tsx` | `ReactQueryDevtools` import |

---

### 8. Refactor notification.service.ts

- Xóa tham số `userInfo` và `members` không dùng khỏi `createNewConversation`
- Đổi `userInfo` → `_userInfo` (convention đánh dấu intentionally unused) trong `onNewMembers`, `onNewConversation`
- Xóa empty `console.log` stubs trong `NewFriendRequest`, `FriendRequestAccepted`, `FriendRequestCanceled` cases

---

---

### 9. Extract custom hooks

| Hook | File | Mô tả |
|------|------|-------|
| `useReply` | `hooks/useReply.ts` | Quản lý reply state dùng TanStack Query key `["reply"]` — thay thế `useQuery`/`setQueryData` inline |
| `usePinMessage` | `hooks/usePinMessage.ts` | Pin/unpin message với optimistic update — trích xuất từ `MessageMenu` và `MessageMenu_Slide` |

---

### 10. Extract pure cache utilities

File: `utils/conversationCache.ts`

| Function | Thay thế |
|----------|---------|
| `optimisticId()` | `Math.random().toString(36).substring(2, 7)` lặp lại ở 4 file |
| `syncConversations(oldData, updated)` | `{ ...oldData, conversations: updated, filterConversations: updated }` |
| `prependConversation(oldData, conv)` | Prepend + filter duplicate pattern |
| `replaceConversationId(oldData, tempId, realId)` | Inline `.map` để replace temp id |
| `findDirectConversation(conversations, contactId)` | Inline `.find` với `isGroup === false` check |
| `reopenMember(members, userId)` | Inline `.map` để set `isDeleted: false` |
| `buildOptimisticConversation(id, me, contact, extra?)` | Inline object literal `newConversation` lặp ở 3 file |

---

### 11. Apply hooks + utilities (deep refactor)

| File | Thay đổi |
|------|---------|
| `components/message/MessageMenu.tsx` | Dùng `usePinMessage` + `useReply`; fix named import |
| `components/message/MessageMenu_Slide.tsx` | Dùng `usePinMessage` + `useReply`; xóa inline pin logic; fix `classList.contains` |
| `components/message/ForwardMessageModal.tsx` | Dùng `optimisticId`, `buildOptimisticConversation`, `prependConversation`, `replaceConversationId`, `reopenMember`, `syncConversations` |
| `components/friend/FriendCtaButton.tsx` | **Fix Rules of Hooks** (hooks trước early return); dùng toàn bộ cache utilities |
| `components/friend/QuickChat.tsx` | **Fix Rules of Hooks** (hooks trước early return); dùng cache utilities; `useState<ContactModel \| undefined>` |
| `components/conversation/ChatInput.tsx` | Dùng `useReply()` thay `useQuery(["reply"])`; xóa `useQuery` import |

---

## Verify

```bash
cd /Users/trint/Desktop/Ciao/client && npx tsc --noEmit
# Output: (empty) — 0 errors
```
