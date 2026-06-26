# Kế hoạch: Áp dụng (enforce) Settings vào hệ thống

> **Mode:** PLANNING · Cập nhật: 2026-06-25
> **Mục tiêu:** Làm cho các toggle trong trang Settings **thật sự có hiệu lực**, thay vì chỉ lưu.
> Liên quan: [`TRANG_THAI_CONNECTIONS_SETTINGS.md`](./TRANG_THAI_CONNECTIONS_SETTINGS.md) · Nghiệm thu: [`AP_DUNG_CAI_DAT_NGHIEM_THU.md`](./AP_DUNG_CAI_DAT_NGHIEM_THU.md)

---

## 🔖 HANDOFF — Lần sau bắt đầu từ đây

**Tình trạng:** Phase 1-5 + 7 **đã code**, BE build sạch, FE typecheck sạch (trừ 2 lỗi pre-existing không liên quan). **Chưa verify end-to-end.**

### Việc còn lại (theo thứ tự)
1. ⚠️ **Restart backend** (`dotnet run --project Chat.API`) → nạp suppression + persistence mới. *(Phase 7 badge thuần FE, không cần.)*
2. ✅ **Verify end-to-end** theo checklist `AP_DUNG_CAI_DAT_NGHIEM_THU.md` (3 account + 1 group + 1 chat 1-1). Mẹo: banner chỉ hiện khi tab người nhận ở **nền**; xác minh payload qua console service worker.
3. ⏸ **Phase 6 — ShowLastSeen:** defer tới khi `lastLogout` được expose ra API mới enforce mask.
4. ✅ **Banner FCM title/body (đã làm 2026-06-26):** thay chuỗi cứng "Ciao notify" bằng câu có nghĩa. Helper mới `Application/Notifications/NotificationBanner.cs` derive `(title, body)` từ `(_event, data)`; wired vào `FirebaseFunction.SendMulticast` (chỉ khi `banner=true`). NewMessage giàu nhất: 1-1 → title=tên người gửi, body=preview; group → title=tên nhóm, body="{sender}: {preview}"; media → "📷 Photo"/"📎 File"/"N attachments". Reaction/friend-request hiện **fallback chung** (payload không kèm tên actor) — nâng cấp tên actor là follow-up (cần thread tên vào event data).

### Bản đồ file (nơi đã sửa — khỏi điều tra lại)
| Mảng | File chính |
|---|---|
| Suppression (P1/2) | `Application/Notifications/NotificationPolicy.cs` (mới) · `Infrastructure/Notifications/FirebaseFunction.cs` |
| Banner text | `Application/Notifications/NotificationBanner.cs` (mới) · `Infrastructure/Notifications/FirebaseFunction.cs` (`SendMulticast`) |
| Reaction + mention persist (P4/5) | `Infrastructure/BackgroundJobs/NotificationConsumer.cs` (`PersistReactionNotification`, `PersistMentionNotifications`) |
| Mention pipeline (P5) | `Domain/Entities/Message.cs` (`Mentions`) · `Application/Kafka/Model/KafkaMessage.cs` · `Application/DTOs/MessageDTO.cs` · `CacheConsumer.cs` (`Type`) |
| Mention FE (P5) | `hooks/useChatInputKeyboard.ts` · `utils/contentEditableUtils.ts` (`getMentionIds`) · `components/conversation/ChatInput.tsx` · `hooks/useSendMessage.ts` · `types/message.types.ts` |
| Sound (P3) | `client/public/sounds/notify.wav` · `utils/notificationSound.ts` · `utils/notificationHandlers.ts` (`onNewMessage`) |
| Badge unseen (P7) | `hooks/useUnseenConversationCount.ts` · `components/sidebar/UnseenBadge.tsx` · `layouts/SideBarMenu.tsx` · `sidebar/ChatIcon.tsx` |
| Display icon | `utils/notificationDisplay.ts` (`reaction`/`mention`) |

### Quyết định đã chốt (đừng mở lại)
- Tắt thông báo = gửi **data-only** (bỏ block `notification`), **không** ngừng gửi → realtime không vỡ.
- Event sync (delivered/read/edited/recalled/pinned/cancel/deny/unfriend) **luôn** data-only.
- Mention dùng **Option B** (userId, không parse tên) — tránh báo nhầm khi trùng tên.
- Lưu vào Informations: **reaction** + **mention** (+ friend_request có sẵn). **Không** lưu NewMessage thường.
- Notifications page: **refetch** khi vào trang (không realtime push cho badge notification).
- Không migration (field mới default rỗng).

### Lệnh
```bash
dotnet build Chat.API/Chat.API.csproj          # BE build
dotnet run   --project Chat.API                # BE restart (nạp logic mới)
cd client && node node_modules/typescript/bin/tsc --noEmit -p tsconfig.json   # FE typecheck
```

---

## ✅ Trạng thái triển khai (2026-06-24)

> Code xong Phase 1-5. **BE build sạch** (`dotnet build`, 0 errors). **FE typecheck sạch** ở mọi file đã sửa
> (còn 2 lỗi pre-existing không liên quan: `AddMembersModal.tsx`, `CreateGroupChatModal.tsx` — React 19 `useRef(undefined)`).
> ⚠️ **Chưa verify end-to-end với backend thật.** ⚠️ Cần **restart backend** để nạp logic mới.

| Phase | Trạng thái | Ghi chú |
|---|---|---|
| 1 — Per-type suppression | ✅ Code | `NotificationPolicy.cs` + `FirebaseFunction.Notify` phân nhóm banner/data-only |
| 2 — Master `PushEnabled` | ✅ Code | Gộp trong `ShouldShowBanner` (1 điều kiện AND) |
| 3 — SoundEnabled | ✅ Code | `notify.wav` + `notificationSound.ts`, phát khi tin mới ở conv không active |
| 4 — Lưu reaction | ✅ Code | `NotificationConsumer.PersistReactionNotification` (chỉ khi add, ≠ tự react) |
| 5 — @mention (Option B) | ✅ Code | `Message.Mentions` threaded FE→Kafka→entity; `PersistMentionNotifications` |
| 6 — ShowLastSeen | ⏸ Defer | Chưa expose `lastLogout` |
| 7 — Badge unseen conversations | ✅ Code | Badge đỏ trên icon Conversations (desktop + mobile), realtime kể cả ở menu khác |

**Việc còn lại:** restart backend → verify thật (tắt từng toggle, tag @người/@All, react, âm thanh).

---

## 0. Phân pha triển khai (ĐỌC TRƯỚC)

| Phase | Nội dung | Lớp | Giá trị | Rollback |
|---|---|---|---|---|
| **1** | **Per-type suppression** theo `NotifyOnMessage/FriendRequest/Reaction` tại chokepoint `FirebaseFunction.Notify` (+ event sync luôn data-only) | BE | ⭐ Chính — toggle từng loại có hiệu lực thật | revert 2 file BE |
| **2** | **Master switch `PushEnabled`** — tắt toàn bộ banner; chỉ là 1 điều kiện AND chồng lên cơ chế Phase 1 | BE | Tắt nhanh tất cả thông báo | revert 1 dòng |
| **3** | **Wire `SoundEnabled`**: phát âm khi có tin nhắn mới nếu user bật | FE | Phụ | revert FE + xoá asset |
| **4** | **Lưu `NewReaction` → Informations** (`Notification.Content`) | BE | Reaction hiện ở trung tâm thông báo | revert handler |
| **5** | **@mention notification (Option B — có cấu trúc)**: FE gắn `userId`, BE thêm `Message.Mentions`, tạo notification khi bị tag/`@All` | FE+BE | ⭐ Feature kiểu Teams | revert chuỗi DTO + field |
| **6** | **`ShowLastSeen`** — chỉ enforce khi `lastLogout` được expose ra ngoài | BE | Defer (chưa cần) | — |

> **Quyết định đã chốt:** mention dùng **Option B** (có `userId`, không parse tên — tránh báo nhầm khi trùng tên) và **gộp chung** đợt này. Banner text ("Ciao notify" → có nghĩa) **tách task riêng**, không làm ở đây.

### Trạng thái từng setting hiện tại

| Setting | Đã lưu? | Đã enforce? | Xử lý ở plan này |
|---|---|---|---|
| `ShowOnlineStatus` | ✅ | ✅ (mask 3 điểm qua `IsOnlineVisibleAsync`) | — đã xong |
| `NotifyOnMessage` | ✅ | ❌ | **Phase 1** |
| `NotifyOnFriendRequest` | ✅ | ❌ | **Phase 1** |
| `NotifyOnReaction` | ✅ | ❌ | **Phase 1** |
| `PushEnabled` | ✅ | ❌ | **Phase 2** |
| `SoundEnabled` | ✅ | ❌ (app chưa có âm thanh) | **Phase 3** |
| `ShowLastSeen` | ✅ | ❌ (`lastLogout` chưa expose) | **Phase 6 — defer** |

### Lưu `Notification.Content` (hiện trên trang Informations)

| Nguồn | Lưu hiện tại? | Phase |
|---|---|---|
| `friend_request` | ✅ `"{Name} send you a request"` (đề xuất sửa → `"sent you a friend request"`) | — / cleanup |
| `NewReaction` | ❌ | **Phase 4** |
| `@mention` | ❌ (chưa có dữ liệu mention ở BE) | **Phase 5** |
| `NewMessage` thường | ❌ — **cố ý không lưu** (đã có ở tab Chats, tránh nhân đôi) | — |

---

## 1. Phát hiện kỹ thuật cốt lõi (quyết định thiết kế)

| Sự thật | Hệ quả |
|---|---|
| Mọi message FCM hiện gắn `Notification{title=body="Ciao notify"}` **+** `Data` | Banner OS **và** realtime đi chung 1 gói |
| `firebase-messaging-sw.js` → `onBackgroundMessage` **không gọi `showNotification`** | Banner web **chỉ** đến từ block `notification` mà SDK tự hiện |
| FE realtime (`onMessage` + SW `postMessage`) chỉ cần block `data` | **Bỏ `notification`, giữ `data` ⇒ tắt banner mà KHÔNG vỡ realtime** |
| `UserCache.GetInfo(userId)` trả `Contact` kèm `Settings` từ Redis; `UpdateSettings` đã `SetInfoAsync` | Đọc preference per-recipient **không tốn DON DB**, luôn cập nhật |

> ⚠️ **KHÔNG được** "không gửi message" khi user tắt thông báo — sẽ chết đồng bộ realtime (tin nhắn không hiện khi đang mở app). **Đúng cách = gửi data-only.**

---

## 2. Thiết kế Phase 1 + 2 — Push suppression

### 2.1 Bảng policy: event → có banner? gate bằng preference nào

| Event | Loại | Gate Phase 1 (per-type) | Gate Phase 2 (thêm) |
|---|---|---|---|
| `NewMessage`, `NewConversation`, `NewMembers` | User-facing | `NotifyOnMessage` | `&& PushEnabled` |
| `NewReaction` | User-facing | `NotifyOnReaction` | `&& PushEnabled` |
| `NewFriendRequest`, `FriendRequestAccepted` | User-facing | `NotifyOnFriendRequest` | `&& PushEnabled` |
| `MessageDelivered/Read/Edited/Recalled`, `NewMessagePinned`, `FriendRequestCanceled/Denied`, `Unfriended` | Sync-only | **không bao giờ banner** (luôn data-only) | — |

> **Phase 2 = master switch:** chỉ thêm điều kiện `s.PushEnabled &&` vào hàm `ShouldShowBanner` (xem 2.3). Tắt `PushEnabled` ⇒ mọi event user-facing thành data-only.

> Lợi ích phụ: event sync chuyển data-only sẽ **dẹp luôn banner "Ciao notify" rác** đang bắn cho mọi receipt/edit hiện nay (đây là behavior change tích cực — cần nêu khi review).

### 2.2 Cơ chế

`Notify` phân nhóm recipient theo settings rồi gửi **tối đa 2 multicast**:
- Nhóm **banner**: `Notification` + `Data`.
- Nhóm **data-only**: chỉ `Data`.

Cả 2 nhóm đều nhận `Data` ⇒ realtime nguyên vẹn.

### 2.3 Code (mới) — `Application/Notifications/NotificationPolicy.cs`
```csharp
public static class NotificationPolicy
{
    // Không có trong map => sync-only (luôn data-only).
    static readonly Dictionary<string, Func<ContactSettings, bool>> Gates = new()
    {
        [ChatEventNames.NewMessage]            = s => s.NotifyOnMessage,
        [ChatEventNames.NewConversation]       = s => s.NotifyOnMessage,
        [ChatEventNames.NewMembers]            = s => s.NotifyOnMessage,
        [ChatEventNames.NewReaction]           = s => s.NotifyOnReaction,
        [ChatEventNames.NewFriendRequest]      = s => s.NotifyOnFriendRequest,
        [ChatEventNames.FriendRequestAccepted] = s => s.NotifyOnFriendRequest,
    };

    public static bool IsBannerable(string ev) => Gates.ContainsKey(ev);

    // Fail-open: settings null (cache miss) => vẫn banner. Đồng nhất IsOnlineVisibleAsync.
    // PHASE 1 (per-type):
    public static bool ShouldShowBanner(string ev, ContactSettings? s)
        => Gates.TryGetValue(ev, out var gate) && (s is null || gate(s));

    // PHASE 2 (thêm master switch) — đổi đúng 1 dòng thân hàm trên thành:
    //     => Gates.TryGetValue(ev, out var gate) && (s is null || (s.PushEnabled && gate(s)));
}
```

### 2.4 Refactor `FirebaseFunction.Notify` (giữ `(userId, token)` để phân nhóm)
```csharp
public async Task Notify(string _event, string[] userIds, object data)
{
    using var scope = _serviceProvider.CreateScope();
    var userCache = scope.ServiceProvider.GetRequiredService<UserCache>();

    var pairs = new List<(string userId, string token)>();
    foreach (var id in userIds) {
        var token = await userCache.GetUserConnection(id);
        if (!string.IsNullOrEmpty(token)) pairs.Add((id, token));
    }
    if (pairs.Count == 0) { _logger.Information("No connection"); return; }

    // Sync-only => 1 lần, data-only.
    if (!NotificationPolicy.IsBannerable(_event)) {
        await Send(_event, pairs.Select(p => p.token).ToArray(), data, banner: false);
        return;
    }

    var infoMap = (await userCache.GetInfo(pairs.Select(p => p.userId).ToArray()))
                  .ToDictionary(c => c.Id);

    var banner   = new List<string>();
    var dataOnly = new List<string>();
    foreach (var (uid, token) in pairs) {
        infoMap.TryGetValue(uid, out var c);
        (NotificationPolicy.ShouldShowBanner(_event, c?.Settings) ? banner : dataOnly).Add(token);
    }
    if (banner.Count   > 0) await Send(_event, banner.ToArray(),   data, banner: true);
    if (dataOnly.Count > 0) await Send(_event, dataOnly.ToArray(), data, banner: false);
}

// Tách phần build + gửi MulticastMessage; banner=false => bỏ field Notification.
Task Send(string ev, string[] tokens, object data, bool banner) { /* ...như cũ, Notification = banner ? new(){...} : null... */ }
```

---

## 3. Thiết kế Phase 3 — `SoundEnabled` (FE)

| Việc | Chi tiết |
|---|---|
| Asset | Thêm `client/public/sounds/notify.mp3` (app hiện chưa có) |
| Đọc setting | Lấy từ cache `["info"].settings.soundEnabled` (client tự quyết, không cần BE) |
| Trigger | Tại nơi nhận `NewMessage` realtime (`onMessage`/SW `postMessage` → `classifyNotification`): nếu `soundEnabled` và message **không phải** của chính mình và **không** đang mở đúng conversation → `new Audio('/sounds/notify.mp3').play()` |
| Lưu ý | Autoplay policy: cần đã có tương tác người dùng (app chat đã đăng nhập ⇒ thường thoả); bọc `.catch(()=>{})` |

---

## 3b. Thiết kế Phase 4 — Lưu `NewReaction`

Trong `NotificationConsumer.HandleNewReaction`:
- Lấy **tác giả message bị react** (`message.ContactId` qua messageId) làm recipient — **không** phải toàn bộ member.
- Bỏ qua nếu reactor == tác giả (tự react chính mình).
- `notificationRepository.Add(new Notification { ContactId = author, SourceType="reaction", SourceId=conversationId, Content=$"{reactorName} reacted to your message" })`.
- Push FCM giữ nguyên (gated `NotifyOnReaction` ở Phase 1).

| Field | Giá trị |
|---|---|
| Content | `"{ReactorName} reacted to your message"` |
| SourceType | `reaction` |
| SourceId | `conversationId` (click → mở conversation, đã hỗ trợ ở `onOpen`) |
| Recipient | tác giả message (≠ reactor) |

---

## 3c. Thiết kế Phase 5 — @mention notification (Option B)

### Luồng dữ liệu cần thread thêm `Mentions`

| Lớp | File | Thay đổi |
|---|---|---|
| FE input | `useChatInputKeyboard.ts` | mention span thêm `data-mention-id={userId}` (đang chỉ có `data-mention="@[name]"`) |
| FE serialize | `contentEditableUtils.ts` / `ChatInput.tsx` | lúc gửi: gom `userId` từ các span → `mentions: string[]` (sentinel `"all"` cho @All) |
| FE type/service | `message.types.ts`, `message.service.ts` | `SendMessageRequest.mentions?: string[]` |
| BE request | `SendMessageReq` | thêm `List<string> Mentions` |
| BE Kafka model | `NewMessageModel_Message` (`Application/Kafka/Model/KafkaMessage.cs`) + AutoMapper | mang `Mentions` qua |
| BE entity | `Domain/Entities/Message.cs` | thêm `List<string> Mentions = new()` (no migration — default rỗng) |
| BE persist | CacheConsumer (lưu message) | map `Mentions` vào entity |
| BE notify | `NotificationConsumer.HandleNewMessage` | nếu có `Mentions` → tạo Notification cho từng người bị tag |

### Logic tạo notification (trong `HandleNewMessage`)
```
recipients = Mentions.Contains("all")
    ? allMembers.Where(id != sender)
    : Mentions.Where(id => members.Contains(id) && id != sender)   // chỉ tag người thật trong group
foreach recipient:
    Add(new Notification {
        ContactId  = recipient,
        SourceType = "mention",
        SourceId   = conversationId,
        Content    = isAll ? $"{sender} mentioned everyone in {group}"
                           : $"{sender} mentioned you in {group}"
    })
```

| Field | Giá trị |
|---|---|
| Content | `"{Sender} mentioned you in {Group}"` / `"{Sender} mentioned everyone in {Group}"` |
| SourceType | `mention` |
| SourceId | `conversationId` |
| Điều kiện | chỉ group chat; recipient là member thật, ≠ sender |

### Lưu ý hiển thị
- Trang Informations đã render theo `sourceType` → cần thêm icon cho `reaction` / `mention` trong `notificationVisual` (`notificationDisplay.ts`) + nhánh `onOpen` (cả 2 đã rơi vào "else → mở conversation", nên deep-link **chạy sẵn**, chỉ cần icon).
- Badge sidebar / list: theo quyết định **refetch** — notification mới hiện khi vào trang / mở dropdown (không realtime). Muốn badge bật ngay realtime ⇒ cần đẩy 1 event data-only `NewNotification` để FE `invalidate(["notification"])` — **đánh dấu optional**, ngoài scope refetch đã chốt.

---

## 3d. Thiết kế Phase 7 — Badge unseen conversations (FE)

**Vấn đề:** icon Conversations ở sidebar không hiện số hội thoại chưa xem; cần tín hiệu realtime kể cả khi đang ở menu khác.

**Tận dụng sẵn có:** mỗi `ConversationModel` đã có cờ `unSeen` (set `!isActive` ở `onNewMessage`, `true` ở conversation mới, `false` khi mở hội thoại). `Home.tsx` đã đếm theo cách này.

| Thành phần | File | Vai trò |
|---|---|---|
| Hook đếm | `hooks/useUnseenConversationCount.ts` (mới) | `useConversation()` → đếm `conversations.filter(c => c.unSeen)` |
| Badge UI | `components/sidebar/UnseenBadge.tsx` (mới) | Chấm đỏ + số (99+), `pointer-events-none`, ẩn khi 0 |
| Desktop | `components/layouts/SideBarMenu.tsx` | gắn `<UnseenBadge>` vào Link Conversations |
| Mobile | `components/sidebar/ChatIcon.tsx` | wrap `relative` + `<UnseenBadge>` |

**Vì sao realtime ở mọi menu:** SideBar luôn mounted trong `_layout`; `onNewMessage` patch trực tiếp cache `["conversation"]` (`unSeen`), `useQuery` cùng key tự re-render badge — không phụ thuộc đang ở route nào. Mở hội thoại set `unSeen=false` → badge tự giảm (chung cache).

---

## 4. Rủi ro & Edge case

| Rủi ro | Xử lý |
|---|---|
| Cache miss settings (user-info evicted) | **Fail-open** = vẫn banner (giống privacy). Hiếm, chấp nhận được |
| Mixed group ⇒ gửi 2 multicast | Tăng nhẹ latency, không đáng kể; chỉ xảy ra khi nhóm có người bật người tắt |
| Behavior change: receipt/edit hết banner | Là cải thiện (giảm rác), nhưng **phải nêu khi review** vì khác hành vi cũ |
| `FriendRequestAccepted` gate dưới `NotifyOnFriendRequest` | Hợp lý; nếu muốn luôn báo "đã đồng ý" thì bỏ khỏi map → user-facing không gate. **Chốt: gate** |
| Autoplay bị chặn (Sound) | `.catch` nuốt lỗi, không crash |
| **Mention trùng tên** (lý do chọn Option B) | Dùng `userId` thay vì tên → không bao giờ báo nhầm |
| Mention `userId` không còn trong group (đã rời) | Lọc `members.Contains(id)` trước khi tạo notification |
| `@All` group lớn | Tạo N notification — cân nhắc giới hạn/bulk insert; group thường nhỏ, chấp nhận |
| Reaction recipient = chính tác giả tự react | Bỏ qua khi reactor == author |
| Spam notification khi react/unreact liên tục | Chỉ tạo khi **add** reaction (không tạo khi gỡ); cân nhắc bỏ qua nếu đã có notification chưa đọc cho cùng message |
| `ShowLastSeen` | **Không động tới** — `lastLogout` chưa expose; enforce sau khi expose |

---

## 5. Validation & Lệnh

```bash
# Backend build + restart (nạp policy mới)
"/path/to/dotnet" build Chat.API/Chat.API.csproj
"/path/to/dotnet" run --project Chat.API

# Frontend
cd client && node node_modules/typescript/bin/tsc --noEmit -p tsconfig.json
```

**Test thủ công Phase 1:**
1. User A tắt `NotifyOnMessage` → user B gửi tin → A **không thấy banner** nhưng tin **vẫn hiện realtime** khi mở app. ✅
2. A bật lại → banner trở lại ngay (không cần re-login, vì cache đã sync ở `UpdateSettings`). ✅
3. A tắt `NotifyOnReaction` nhưng giữ `NotifyOnMessage` → reaction im, tin nhắn vẫn báo. ✅

**Test thủ công Phase 2:**
4. A tắt `PushEnabled` → **mọi loại** đều không banner, realtime vẫn chạy. Bật lại → báo trở lại.

---

## 6. Files thay đổi

| File | Loại | Nội dung |
|---|---|---|
| `Application/Notifications/NotificationPolicy.cs` | **mới** | Bảng policy event → gate (Phase 1-2) |
| `Infrastructure/Notifications/FirebaseFunction.cs` | sửa | Phân nhóm recipient + tách `Send(banner)` (Phase 1-2) |
| `client/public/sounds/notify.mp3` | **mới** | Asset âm thanh (Phase 3) |
| `client/src/utils/notificationHandlers.ts` (hoặc nơi `onMessage`) | sửa | Phát sound nếu `soundEnabled` (Phase 3) |
| `Infrastructure/BackgroundJobs/NotificationConsumer.cs` | sửa | Lưu Notification cho reaction (P4) + mention (P5) |
| `Domain/Entities/Message.cs` | sửa | thêm `List<string> Mentions` (P5) |
| `Application/Kafka/Model/KafkaMessage.cs` + AutoMapper profile | sửa | thread `Mentions` qua pipeline (P5) |
| `SendMessageReq` (Presentation/Message) | sửa | thêm `Mentions` (P5) |
| `client/src/hooks/useChatInputKeyboard.ts`, `utils/contentEditableUtils.ts`, `components/conversation/ChatInput.tsx` | sửa | mention mang `userId` + gửi `mentions[]` (P5) |
| `client/src/services/message.service.ts`, `types/message.types.ts` | sửa | `SendMessageRequest.mentions` (P5) |
| `client/src/utils/notificationDisplay.ts` | sửa | icon cho `reaction` / `mention` (P4-5) |

---

## 7. Khuyến nghị
- Thứ tự đề xuất: **1 → 2 → 4 → 5 → 3**, để **6** lại (defer).
- **Phase 1** (per-type) tạo phần lớn giá trị suppression; **Phase 2** (`PushEnabled`) chồng lên đúng **1 dòng** — tách phase để review/rollback độc lập.
- **Phase 4** (reaction) độc lập, nhỏ, làm nhanh.
- **Phase 5** (@mention Option B) là phần nặng nhất — đụng cả pipeline gửi tin (FE input → Kafka → entity → consumer). Nên làm thành 1 mạch riêng, test kỹ luồng tag/`@All`.
- **Phase 3** (Sound) làm cuối, độc lập FE.
- **Migration:** chỉ thêm field default rỗng (`Message.Mentions`, `ContactSettings`) → **không cần migration**, backward-compatible (fail-open).
