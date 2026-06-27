# Tổng kết: Settings notification + Banner + Chỉ báo tab (đã gỡ)

> Tổng hợp các thay đổi (FE + BE + Service Worker) quanh hệ thống
> thông báo. Chi tiết kỹ thuật từng phần xem các doc liên kết ở cuối.

---

## 1. Trạng thái nhanh

| # | Hạng mục | Loại | Trạng thái |
|---|---|---|---|
| 1 | Fix "Could not save settings" (thiếu env) | Bug · FE config | ✅ Xong |
| 2 | Settings notification áp dụng tức thì (không reload) | Bug · FE | ✅ Xong |
| 3 | Rà soát BE+FE settings áp dụng tức thì | Audit | ✅ Xong (BE vốn đã đúng) |
| 4 | In-app banner foreground (3 loại event) + điều hướng | Feature · FE+BE | ✅ Xong |
| 5 | Không banner khi đang ở trang conversations | Refinement · FE | ✅ Xong |
| 6 | Click banner OS khi ở tab khác (điều hướng) | Feature · SW | ⤳ Bỏ (đổi hướng sang #7) |
| 7 | Chỉ báo trên thanh tab khi ở tab khác (🔴 + favicon pulse) | Feature · FE+SW | 🗑️ Đã gỡ (đổi yêu cầu) |

⚠️ **Cần để chạy thật:** restart Backend (nạp payload mới).

---

## 2. Chi tiết từng hạng mục

### #1 — Fix "Could not save settings"
- **Nguyên nhân:** `client/.env` thiếu `VITE_ENDPOINT_CONTACT_SETTINGS` + `VITE_ENDPOINT_CONTACT_PASSWORD` → `req.url=undefined` → `withApiPrefix(undefined)` throw → mutation `onError` → toast lỗi. Trang đổi mật khẩu cũng hỏng cùng lý do.
- **Fix:** thêm 2 biến vào `.env` (`/contacts/settings`, `/contacts/password`). ⚠️ Cần restart Vite.

### #2 — Settings áp dụng tức thì
- **Nguyên nhân:** `SignalContext.tsx` callback `onNotification` capture `info` trong closure của `useEffect` với deps `[info?.id]` → toggle chỉ đổi `info.settings` (không đổi `info.id`) → effect không re-run → đọc `soundEnabled` cũ → phải reload.
- **Fix:** latest-ref pattern (`infoRef.current = info`) → handler luôn đọc settings mới nhất, không re-register FCM mỗi lần toggle.

### #3 — Rà soát áp dụng tức thì (BE + FE)
- **BE vốn đã đúng:** `UpdateSettings` ghi Redis user-info cache ngay (`SetInfoAsync`); `FirebaseFunction` đọc cache đó → `NotificationPolicy.ShouldShowBanner` quyết định banner vs data-only → tức thì. `WebSocketProcessor` là dead-code, không bypass gate.
- **FE:** chỉ `soundEnabled` được tiêu thụ phía client (đã fix ở #2).

### #4 — In-app banner foreground
Khi đang mở app, FCM `onMessage` không tự hiện banner OS → render toast clickable, gated theo settings.

| Event | Nội dung | Click → |
|---|---|---|
| `NewMessage` | "Tên — đã gửi tin nhắn đến Nhóm / đến bạn" | `/conversations/$id` |
| `NewFriendRequest` | "Tên — đã gửi lời mời kết bạn" | `/connections?tab=requests` |
| `NewReaction` | "Tên — đã thả [emoji] vào tin của bạn" | `/conversations/$id?messageId=…` (nhảy + highlight) |

- **BE enrich payload:** `EventNewReaction` (reactorName, messageOwnerId, type) + `EventNewFriendRequest.ContactName`; `NotificationConsumer.HandleNewReaction` load message 1 lần.
- **FE:** `utils/inAppNotification.tsx` (`buildBanner` + `showBannerToast`); route conversation thêm `validateSearch(messageId)`; `Chatbox` cuộn + highlight (`.message-highlight`).

### #5 — Không banner ở trang conversations
- `buildBanner` thêm gate: nếu `window.location.pathname` bắt đầu `/conversations` → không banner (đang chat không làm phiền). Banner vẫn hiện ở settings/connections/notifications.

### #6 — (Bỏ) Click banner OS điều hướng
- Đã thử `notificationclick` parse data → điều hướng, nhưng user đổi hướng. **Rút gọn** `notificationclick` còn chỉ focus tab. *(Về sau SW đã revert baseline khi gỡ #7 + fix Brave — xem §6.)*

### #7 — Chỉ báo trên thanh tab (🗑️ ĐÃ GỠ — đổi yêu cầu)
Tính năng chấm đỏ trên tiêu đề tab đã được **gỡ bỏ hoàn toàn** theo yêu cầu mới.

**Đã xóa/hoàn nguyên:**
- Xóa file `client/src/utils/tabBadge.ts`.
- `SignalContext.tsx`: gỡ import `notifyTabEvent`/`passesNotificationGate`, bỏ block foreground gọi `notifyTabEvent`, bỏ hẳn `useEffect` nghe SW message → tab badge.
- `public/firebase-messaging-sw.js`: ban đầu gỡ `postMessage`; **về sau revert toàn bộ về baseline** (bỏ `skipWaiting`/`clients.claim`/`notificationclick`) — xem §6 (fix Brave).

> Lịch sử thiết kế trước khi gỡ (bất biến `pending && document.hidden`, self-gate, simulation harness) xem git history. Banner in-app foreground (#4) **không bị ảnh hưởng**, vẫn hoạt động.

---

## 3. Danh sách file thay đổi

### Backend (.NET)
| File | Thay đổi |
|---|---|
| `Application/WebSocketEvents/ChatEventModels.cs` | `EventNewFriendRequest.ContactName/Avatar`; thêm `EventNewReaction` |
| `Presentation/Friend/AddFriend.cs` | set ContactName/Avatar người gửi |
| `Infrastructure/BackgroundJobs/NotificationConsumer.cs` | `HandleNewReaction` gửi `EventNewReaction`, load message 1 lần; persist trả bool |
| `Application/Notifications/NotificationBanner.cs` | banner OS reaction/friend dùng tên actor |

### Frontend (React/TS)
| File | Thay đổi |
|---|---|
| `client/.env` | + `VITE_ENDPOINT_CONTACT_SETTINGS`, `VITE_ENDPOINT_CONTACT_PASSWORD` |
| `src/context/SignalContext.tsx` | latest-ref (info, navigate); gọi banner (tab badge đã gỡ) |
| `src/utils/inAppNotification.tsx` (mới) | `passesNotificationGate`, `buildBanner`, `showBannerToast` |
| ~~`src/utils/tabBadge.ts`~~ | 🗑️ Đã xóa (gỡ tính năng chấm đỏ tab) |
| `src/routes/_layout.conversations.$conversationId.tsx` | `validateSearch(messageId)` |
| `src/components/conversation/Chatbox.tsx` | nhảy + highlight message theo `?messageId` |
| `src/styles/messagecontent.css` | `.message-highlight` |
| `src/types/notification.types.ts` | field enrich `NewReaction` + `NewFriendRequest` |
| `public/firebase-messaging-sw.js` | revert về baseline (xem §6 — fix Brave) |

---

## 4. Validate
- **BE:** `dotnet build Chat.API` → 0 error.
- **FE:** `tsr generate` + `tsc --noEmit` → chỉ 3 lỗi **pre-existing** (AddMembersModal/CreateGroupChatModal — `useRef` typing, không liên quan).
- **SW:** `node --check` OK.

## 5. Doc liên quan
- `docs/features/CAI_DAT_AP_DUNG_TUC_THI_FIX.md` — #1, #2, #3
- `docs/features/BANNER_THONG_BAO_IN_APP.md` — #4, #5, #6, #7 (chi tiết)

---

## 6. Cập nhật 2026-06-28 — Brave ngừng nhận FCM (đã fix)

**Nguyên nhân:** việc thêm `self.skipWaiting()` + `self.clients.claim()` + `notificationclick`
vào `firebase-messaging-sw.js` (cho tính năng chấm đỏ #7) đã can thiệp vào **chính SW mà
firebase giữ FCM push subscription**. Mỗi lần sửa SW → cài lại; `skipWaiting` swap đột ngột;
**Brave xử lý web-push nghiêm hơn Chrome** → mất push subscription, firebase giữ token cũ (hỏng).

**Fix:** revert `firebase-messaging-sw.js` về đúng bản committed (baseline Brave chạy tốt) —
các thêm thắt kia giờ thừa vì chấm đỏ đã gỡ. **Khôi phục:** Brave → Unregister SW + Clear site
data + reload 1 lần để re-subscribe token mới gửi lên BE.
