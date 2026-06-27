# Fix: Cài đặt Notification áp dụng tức thì (không cần reload)

> Mode: BACKEND (audit BE) + FRONTEND (fix). Phạm vi: toggle settings có hiệu lực ngay sau khi chỉnh, không phải reload.

## Triệu chứng

- Toggle các mục trong `Settings → Notifications` không có tác dụng ngay; phải reload trang mới áp dụng.

## Rà soát end-to-end

| Setting | Nơi enforce | Nguồn đọc | Tức thì? (trước fix) |
|---|---|---|---|
| `soundEnabled` | **FE** — `notificationHandlers.onNewMessage` phát âm | `userInfo.settings` | ❌ stale closure |
| `pushEnabled` (master) | **BE** — `NotificationPolicy.ShouldShowBanner` | Redis user-info cache | ✅ |
| `notifyOnMessage` | **BE** — gate `NewMessage/NewConversation/NewMembers` | Redis user-info cache | ✅ |
| `notifyOnReaction` | **BE** — gate `NewReaction` | Redis user-info cache | ✅ |
| `notifyOnFriendRequest` | **BE** — gate `NewFriendRequest/FriendRequestAccepted` | Redis user-info cache | ✅ |
| `showOnlineStatus`/`showLastSeen` | **BE** — `UserCache.IsOnlineVisibleAsync` | Redis user-info cache | ✅ |

### Vì sao BE đã tức thì

`UpdateSettings.Handler` (PUT `/contacts/settings`) ngoài Update DB (defer vào UoW) còn gọi `_userCache.SetInfoAsync(user)` ghi **nguyên** Contact kèm settings mới vào Redis user-info cache ngay lập tức. `GetInfoAsync()` trả full document từ Mongo nên không mất field khi ghi lại cache.

Mọi push đi qua `IFirebaseFunction.Notify(string[] userIds, object data)` → `FirebaseFunction` đọc `userCache.GetInfo(userIds)` (cache vừa sync) → `NotificationPolicy.ShouldShowBanner` quyết định gửi block `notification` (banner OS) hay data-only. ⇒ Tắt banner/notify-* có hiệu lực ngay cho event kế tiếp. `WebSocketProcessor` (`INotificationProcessor`) chỉ đăng ký DI nhưng **không được dùng** (dead code) → không bypass gate.

### Root cause FE (bug thực sự)

`client/src/context/SignalContext.tsx` — callback `onNotification` capture biến `info` trong closure của `useEffect` có deps `[info?.id, queryClient]`. Toggle settings chỉ đổi `info.settings`, **không đổi `info.id`** → effect không chạy lại → callback giữ `info` cũ → `soundEnabled` đọc giá trị cũ. Reload mới re-run effect với info mới.

## Fix (FE)

Áp dụng **latest-ref pattern**: subscription SignalR vẫn ổn định theo `info?.id` (tránh re-register FCM token/permission mỗi lần toggle), nhưng handler đọc `infoRef.current` để luôn lấy settings mới nhất.

```tsx
const infoRef = useRef(info);
infoRef.current = info; // cập nhật mỗi render

// trong onNotification:
const current = infoRef.current;
if (!current) return;
classifyNotification(notificationData, queryClient, current);
```

## Kết luận

- **FE**: 1 thay đổi tại `SignalContext.tsx` → `soundEnabled` áp dụng tức thì.
- **BE**: không cần sửa — đã đọc settings tươi từ Redis cache sync ngay trong `UpdateSettings`.
- Validate: `tsc --noEmit` không phát sinh lỗi mới ở file sửa. (Liên quan: trước đó đã bổ sung 2 env thiếu `VITE_ENDPOINT_CONTACT_SETTINGS/PASSWORD` để PUT settings không vỡ.)

### Đề xuất dọn dẹp (ngoài scope)
- Xoá `WebSocketProcessor`/`INotificationProcessor` nếu xác nhận không còn dùng.
</content>
