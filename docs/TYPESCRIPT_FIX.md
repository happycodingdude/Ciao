# TypeScript Strict Null Checks Fix

## Bối cảnh

TypeScript 6.0.3 bật `strictNullChecks` mặc định (khác TS 4/5). Codebase trước đó viết không có assumption này, dẫn đến **657 lỗi** trong `client/src/`. Toàn bộ được fix properly — không tắt `strictNullChecks`.

---

## Kết quả

| Trước | Sau |
|-------|-----|
| 657 lỗi TypeScript | **0 lỗi** |

---

## Những thay đổi chính

### 1. `client/tsconfig.json`
- Thêm `"skipLibCheck": true` → loại bỏ 3 lỗi từ node_modules (`@tanstack`, `@types/react`)

### 2. `client/src/declarations.d.ts` (file mới)
- Tạo local type shim cho `lodash-es` vì package v4.17.23 không có bundled `.d.ts`
- Khai báo `debounce<T extends (...args: any[]) => any>` với `DebouncedFunc<T>`

### 3. `client/src/types/conv.types.ts`
- Uncomment `selected?: ConversationModel | null` và `reload?: boolean` trong `ConversationCache`
- Các field này bị comment nhầm, gây TS2339 ở nhiều component downstream

### 4. `client/src/types/message.types.ts`
- Thêm `id?: string` và `pinned?: boolean` vào `MessageMenuProps` (bị thiếu, gây TS2339 khi destructure trong `MessageMenu.tsx`)

### 5. `client/src/types/base.types.ts`
- Cập nhật `CustomInputProps.inputRef` sang `MutableRefObject<(HTMLInputElement & { reset?: () => void }) | undefined>`

---

## Pattern fixes áp dụng toàn codebase

| Pattern cũ | Pattern mới | Lý do |
|-----------|------------|-------|
| `useRef<T>()` (DOM) | `useRef<T>(null)` | DOM refs phải init với `null` |
| `useRef<T>()` (non-DOM) | `useRef<T \| undefined>(undefined)` | Cho `MutableRefObject<T \| undefined>` |
| `obj.prop` (nullable) | `obj?.prop` | Optional chaining |
| `arr.find(...)` | `arr?.find(...)` | Array có thể undefined |
| `callback()` (optional) | `callback?.()` | Optional function call |
| `value` (possibly null) | `value ?? fallback` | Nullish coalescing |
| `if (!x) return;` (React) | `if (!x) return null;` | React component phải return ReactNode |
| `debounce(fn, ms)` from lodash-es | `debounce(fn, ms)` — fixed shim | Shim dùng `any[]` thay `unknown[]` |
| `to={\`/path/${id}\`}` (TanStack Router) | `to="/path/$param" params={{ param: id }}` | Type-safe routing |
| `e.target.classList` | `(e.target as HTMLElement \| null)?.classList` | EventTarget không có classList |
| `ref.current` (ForwardedRef) | `typeof ref === "function" \| \| !ref ? null : ref.current` | ForwardedRef có thể là callback |

---

## Các file đã chỉnh sửa

### Types
- `src/types/conv.types.ts`
- `src/types/message.types.ts`
- `src/types/base.types.ts`

### Lib / Services / Utils
- `src/lib/fetch.ts`
- `src/services/notification.service.ts`
- `src/utils/call.ts`
- `src/declarations.d.ts` (mới)

### Context
- `src/context/SignalContext.tsx`
- `src/context/ListchatFilterContext.tsx`
- `src/context/ChatDetailTogglesContext.tsx`

### Auth
- `src/components/auth/SignupForm.tsx`
- `src/components/auth/SigninForm.tsx`
- `src/components/auth/ForgotPasswordForm.tsx`

### Common
- `src/components/common/CustomInput.tsx`
- `src/components/common/CustomContentEditable.tsx`

### Conversation (11 files)
- `src/components/conversation/ChatInput.tsx`
- `src/components/conversation/Information.tsx`
- `src/components/conversation/ListchatContent.tsx`
- `src/components/conversation/AddMembersModal.tsx`
- `src/components/conversation/ChatboxHeader.tsx`
- `src/components/conversation/CreateGroupChatModal.tsx`
- `src/components/conversation/UpdateConversation.tsx`
- `src/components/conversation/Chatbox.tsx`
- `src/components/conversation/ChatboxHeaderMenu_Mobile.tsx`
- `src/components/conversation/ShareImage.tsx`
- `src/components/conversation/Attachment.tsx`
- `src/components/conversation/ChatboxMenu.tsx`
- `src/components/conversation/MemberToAdd_LargeScreen.tsx`
- `src/components/conversation/MemberToAdd_Phone.tsx`

### Message (4 files)
- `src/components/message/MessageContent.tsx`
- `src/components/message/ForwardMessageModal.tsx`
- `src/components/message/MessageMenu_Slide.tsx`
- `src/components/message/MessageMenu.tsx`
- `src/components/message/MessageMenuItem.tsx`
- `src/components/message/MessageReaction.tsx`
- `src/components/message/MessageImageGrid.tsx`
- `src/components/message/MessageItem.tsx`

### Friend (3 files)
- `src/components/friend/QuickChat.tsx`
- `src/components/friend/FriendCtaButton.tsx`
- `src/components/friend/ListFriend.tsx`
- `src/components/friend/FriendItem.tsx`
- `src/components/friend/AcceptButton.tsx`
- `src/components/friend/AddButton.tsx`
- `src/components/friend/CancelButton.tsx`

### Layouts / Profile / Sidebar
- `src/components/layouts/ChatboxContainer.tsx`
- `src/components/layouts/ChatSection.tsx`
- `src/components/layouts/ListChatContainer.tsx`
- `src/components/layouts/SideBarMenu.tsx`
- `src/components/layouts/SideBarMenu_Mobile.tsx`
- `src/components/profile/ProfileSection.tsx`
- `src/components/sidebar/Notification.tsx`

### Video Call
- `src/components/videocall/VideoCall.tsx`
- `src/components/videocall/ReceiveOffer.tsx`

### Pages
- `src/pages/Authentication.tsx`

---

## Lưu ý quan trọng

1. **`lodash-es` không có types**: Phải dùng local shim `declarations.d.ts`. Constraint `any[]` (không phải `unknown[]`) là bắt buộc vì TypeScript contravariance rules.

2. **ForwardedRef pattern**: `typeof ref === "function" || !ref ? null : ref.current` — cần thiết bất cứ khi nào access `.current` trên `ForwardedRef<T>`.

3. **`ConversationCache.selected` bị comment**: Đây là root cause của nhiều lỗi downstream — nếu tương lai refactor type này cần giữ field này hoặc update tất cả consumer.
