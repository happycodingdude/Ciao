# Bug Fix: React Rules of Hooks Violations

## Vấn đề

Sau khi logout → login thành công, app crash với lỗi:

```
Error: Rendered more hooks than during the previous render.
    at ListChatContainer (ListChatContainer.tsx:82:25)
```

Ngoài ra còn phát hiện thêm 5 file khác có cùng loại vi phạm trong toàn bộ codebase.

---

## Root Cause

React Rules of Hooks yêu cầu hooks **luôn được gọi theo cùng thứ tự và số lượng** ở mỗi lần render. Vi phạm xảy ra khi hook được gọi **sau một conditional return** (early return).

### Cơ chế crash tại ListChatContainer

| Render | Trạng thái | Hooks được gọi |
|--------|-----------|----------------|
| Thứ 1 (isLoading=true) | Hit early return | 10 hooks (query/state + useRef) |
| Thứ 2 (isLoading=false) | Vượt qua early return | 13 hooks (+useMemo +useCallback +useEventListener) |

React phát hiện 13 > 10 → throw "Rendered more hooks than during the previous render".

---

## Các file đã fix

### 1. `ListChatContainer.tsx` — **Critical (crash sau login)**

**Vi phạm:** `useMemo`, `useCallback`, `useEventListener` đứng sau `if (isLoading || isRefetching) return <ListchatLoading />`.

**Fix:** Move toàn bộ `lockScroll`, `fetchMoreConversations`, `useMemo(debounceFetch)`, `useCallback(handleScroll)`, `useEventListener` lên trước early return.

---

### 2. `ChatboxHeader.tsx`

**Vi phạm:** `Route.useParams()` gọi sau `if (!conversations) return null`.

**Fix:** Move `const { conversationId } = Route.useParams()` lên trước early return.

---

### 3. `SideBarMenu_Mobile.tsx`

**Vi phạm:** `useEffect` gọi sau `if (!info) return null`.

**Fix:** Move `useEffect` lên trước, thêm guard `if (!info) return` bên trong effect body, đổi dep array `info.avatar` → `info?.avatar`.

---

### 4. `VideoCall.tsx`

**Vi phạm:** `useRef` (x2), `useSignal`, `useDraggable`, `useEffect` (x2) đều sau `if (contact === null) return null`.

**Fix:** Move tất cả hooks lên trước early return. Đổi `contact.id` → `contact?.id` để type-safe.

---

### 5. `UpdateConversation.tsx`

**Vi phạm:** `useQueryClient`, `useRef`, `useState` (x2), `useEffect` đều sau `if (!selected) return null`.

**Fix:** Move tất cả hooks lên trước. Đổi `selected.avatar` → `selected?.avatar`, `selected.title` → `selected?.title`. Thêm `[selected]` vào dep array của useEffect.

---

### 6. `MessageContent.tsx`

**Vi phạm:** Toàn bộ hooks (`useQueryClient`, `useInfo`, `useConversation`, `Route.useParams`, `useState` x3, `useEffect` x2, `useCallback`, `useRef`) đều sau `if (!message) return null`.

**Fix:** Move tất cả hooks lên trước. Đổi lazy initializer `message.likeCount` → `message?.likeCount ?? 0`. Thêm guard `if (!message) return` trong useEffect body.

---

### Files đã fix trong session trước (refactor deep)

| File | Vi phạm gốc |
|------|------------|
| `FriendCtaButton.tsx` | `useQueryClient`, `useLoading`, `useInfo`, `useConversation` sau `if (!friend) return null` |
| `QuickChat.tsx` | Tất cả hooks sau `if (!profile) return null` |
| `BackgroundPortal.tsx` | `useCallback`, `useEventListener` sau `if (!show) return null` |
| `Chatbox.tsx` | `Route.useParams()` sau `if (!conversations) return null` |

---

## Nguyên tắc phòng tránh

1. **Hooks luôn đặt ở đầu component**, trước bất kỳ `return` nào.
2. Nếu hook cần dữ liệu từ prop nullable: dùng optional chaining (`prop?.value ?? default`) trong initializer/dependency.
3. Guard logic (`if (!data) return`) đặt **sau** tất cả hooks, **trước** business logic.
4. Pattern đúng:

```tsx
const Component = ({ data }) => {
  // 1. TẤT CẢ HOOKS TRƯỚC
  const [state, setState] = useState(data?.value ?? "");
  useEffect(() => {
    if (!data) return; // guard bên trong effect
    // ...
  }, [data?.id]);

  // 2. EARLY RETURN SAU HOOKS
  if (!data) return null;

  // 3. Business logic & JSX
  return <div>{state}</div>;
};
```

---

## Verify

```bash
cd /Users/trint/Desktop/Ciao/client && npx tsc --noEmit
# Output: (empty) — 0 errors
```
