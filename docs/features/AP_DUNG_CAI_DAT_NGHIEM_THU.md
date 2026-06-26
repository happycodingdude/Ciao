# Nghiệm thu — Áp dụng Settings + Notification (reaction/mention/sound)

> Checklist test end-to-end. Tick `[x]` khi pass. Liên quan: [`AP_DUNG_CAI_DAT_TRIEN_KHAI.md`](./AP_DUNG_CAI_DAT_TRIEN_KHAI.md)

---

## 0. Chuẩn bị (BẮT BUỘC trước khi test)

| # | Việc | Lý do |
|---|---|---|
| 1 | **Restart backend**: `dotnet run --project Chat.API` | Nạp `NotificationPolicy`, suppression, persistence mới |
| 2 | Build/chạy FE: `cd client && node node_modules/vite/bin/vite.js dev` (hoặc build) | Nạp mention/sound mới |
| 3 | **3 tài khoản**: A, B, C. Tạo **1 group** có cả A,B,C + **1 chat 1-1** A↔B | Cần group để test @mention/@All |
| 4 | Mỗi account mở ở **trình duyệt/profile riêng** (hoặc ẩn danh) | Tránh share session/token FCM |
| 5 | Đã **cho phép Notification** (chuông trình duyệt) cho cả A,B,C | Banner chỉ hiện khi đã grant permission |

### Mẹo quan sát (rất quan trọng)
- **Banner OS chỉ hiện khi tab người nhận ở NỀN** (minimize hoặc chuyển tab khác). Khi tab đang focus → FCM gọi `onMessage`, KHÔNG hiện banner (đúng thiết kế) nhưng tin vẫn realtime.
- **Xác minh ở mức payload (chuẩn nhất):** mở DevTools → Application → Service Workers → bấm **inspect** `firebase-messaging-sw.js`. Console SW log `payload` mỗi message nền:
  - Có key **`notification`** → thuộc nhóm **banner**.
  - **Không** có `notification`, chỉ có `data` → **data-only** (đã bị suppress). ✅
- **Kiểm tra notification lưu DB** (Mongo):
  ```js
  // mongosh
  db.Notification.find({ ContactId: "<userId>" }).sort({ CreatedTime: -1 }).limit(5)
  ```

---

## 1. Phase 1 — Suppression per-type

### 1a. NotifyOnMessage
- [ ] A vào **Settings → Notifications**, **tắt** "Message". B (tab A để **nền**) gửi tin cho A.
  → **Pass:** A **không** hiện banner; mở lại tab A thấy tin **đã có** (realtime ok). SW console: payload **không** có `notification`.
- [ ] A **bật lại** "Message". B gửi tiếp.
  → **Pass:** A hiện banner trở lại **ngay** (không cần re-login).

### 1b. NotifyOnReaction
- [ ] A tắt "Reaction", giữ "Message" bật. B thả tym vào tin của A (tab A nền).
  → **Pass:** A **không** banner reaction. B gửi tin thường → A **vẫn** banner. (suppress đúng từng loại)

### 1c. NotifyOnFriendRequest
- [ ] A tắt "Friend request". C gửi lời mời kết bạn cho A (tab A nền).
  → **Pass:** A không banner. (Lời mời vẫn lưu — xem mục 4 không áp dụng; check trang Informations vẫn có dòng request khi mở lại.)

### 1d. Event sync không còn banner rác
- [ ] A & B đang chat (A nền). B **đọc** tin / **sửa** / **thu hồi** tin.
  → **Pass:** A **không** nhận banner "Ciao notify" cho các sự kiện này (trước đây có). Trạng thái Seen/Edited/Recalled **vẫn** cập nhật realtime.

---

## 2. Phase 2 — Master switch PushEnabled
- [ ] A **tắt PushEnabled** (master). B gửi tin, C react, gửi lời mời (tab A nền).
  → **Pass:** A **không** banner ở **mọi** loại; nhưng mọi thứ **vẫn realtime** khi mở app.
- [ ] A **bật lại PushEnabled**. B gửi tin.
  → **Pass:** banner trở lại theo từng toggle per-type.

---

## 3. Phase 3 — SoundEnabled
- [ ] A bật "Sound". A đang mở conversation X, B gửi tin ở **conversation Y khác** (Y không mở).
  → **Pass:** nghe tiếng "ding".
- [ ] A đang mở đúng conversation Y, B gửi tin trong Y.
  → **Pass:** **không** kêu (đang xem thì không làm phiền — đúng thiết kế `!isActive`).
- [ ] A **tắt** "Sound". B gửi tin ở conv khác.
  → **Pass:** **không** kêu.
> Lưu ý: lần phát đầu có thể bị chặn nếu chưa từng tương tác trang (autoplay policy) — click vào app 1 lần rồi test lại.

---

## 4. Phase 4 — Notification reaction (lưu DB + hiện ở Informations)
- [ ] B thả tym vào **tin của A**. A mở trang **Informations**.
  → **Pass:** thấy dòng **"{B} reacted to your message"**, icon ❤️. Bấm vào → mở đúng conversation.
  → DB: `db.Notification.find({SourceType:"reaction"})` có bản ghi `ContactId = A`.
- [ ] B **gỡ** tym (unreact).
  → **Pass:** **KHÔNG** tạo thêm notification mới (không spam khi gỡ).
- [ ] A tự thả tym vào **tin của chính A**.
  → **Pass:** **KHÔNG** có notification (không tự báo mình).

---

## 5. Phase 5 — @mention (Option B)
### 5a. Tag một người
- [ ] Trong group, B gõ `@` chọn **A**, gửi "hello @A".
  → **Pass:** A mở Informations thấy **"{B} mentioned you in {group}"**, icon @. Bấm → mở group.
  → DB: `db.Notification.find({SourceType:"mention", ContactId:"<A>"})` tồn tại.
- [ ] C (cùng group, **không** bị tag) kiểm tra.
  → **Pass:** C **không** có notification mention.

### 5b. Tag @All
- [ ] B gõ `@` chọn **All**, gửi.
  → **Pass:** **A và C** đều có **"{B} mentioned everyone in {group}"**; **B (người gửi) không** có.

### 5c. Đúng người (lý do chọn Option B)
- [ ] Nếu group có **2 người trùng tên** (vd 2 "John"): B tag đúng 1 John.
  → **Pass:** chỉ **đúng userId** được tag nhận notification, người trùng tên còn lại **không** nhận. (parse theo tên sẽ sai chỗ này)

### 5d. Người đã rời nhóm
- [ ] Tag userId không còn trong group (nếu dựng được).
  → **Pass:** không tạo notification cho người đã rời (lọc member thật).

---

## 5e. Badge unseen conversations (Phase 7)
- [ ] A đang ở menu **Home** (không phải Conversations). B gửi tin cho A.
  → **Pass:** icon **Conversations** ở sidebar hiện **badge đỏ** với số (ngay lập tức, không cần chuyển menu).
- [ ] B gửi thêm tin ở **hội thoại thứ 2**.
  → **Pass:** số badge tăng theo **số hội thoại** chưa xem (không phải tổng số tin).
- [ ] A mở 1 hội thoại chưa xem.
  → **Pass:** badge **giảm** tương ứng; xem hết → badge **biến mất**.
- [ ] (Mobile) lặp lại trên màn hình điện thoại.
  → **Pass:** badge hiện trên `ChatIcon` mobile.

---

## 5f. Banner text có nghĩa (thay "Ciao notify")
> Banner chỉ hiện khi tab người nhận ở **nền** + đã grant permission.
- [ ] Chat 1-1: B gửi text "hello" cho A (tab A nền).
  → **Pass:** banner title = **tên B**, body = **"hello"** (không còn "Ciao notify").
- [ ] Group: B gửi "hi team" trong group X (tab A nền).
  → **Pass:** title = **tên group X**, body = **"{B}: hi team"**.
- [ ] B gửi 1 ảnh (media) trong group.
  → **Pass:** body = **"{B}: 📷 Photo"** (nhiều ảnh → "📷 N photos"; file → "📎 File").
- [ ] C gửi lời mời kết bạn cho A.
  → **Pass:** banner fallback **"You have a new friend request"** (chưa có tên — đã biết, follow-up).

---

## 6. Kiểm tra REALTIME KHÔNG vỡ (an toàn lõi)
> Mục quan trọng nhất — đảm bảo suppression không giết đồng bộ.
- [ ] A tắt **toàn bộ** thông báo (PushEnabled off). A **mở** app (tab focus). B gửi tin liên tục.
  → **Pass:** tin hiện **ngay lập tức** trong khung chat của A dù không có banner nào. Danh sách hội thoại, unseen, seen, reaction realtime **đều cập nhật bình thường**.

---

## Tổng kết nghiệm thu
- [ ] Tất cả mục trên pass → tính năng áp dụng settings hoàn tất.
- Ghi chú lỗi (nếu có): ________________
