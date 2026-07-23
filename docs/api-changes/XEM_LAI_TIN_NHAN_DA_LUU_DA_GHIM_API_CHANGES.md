# XEM_LAI_TIN_NHAN_DA_LUU_DA_GHIM_API_CHANGES

> Cập nhật: 2026-07-23 — chuẩn hóa "Đã lưu" & "Đã ghim" về luồng thống nhất (tách lưu trữ, phân trang, load-more).

> ⚠️ **Route trong doc này đã đổi (2026-07-23):** `messages/pinned` → `pins`, `bookmarks/messages`
> → `bookmarks`, và id inline chuyển xuống `pins/ids` / `bookmarks/ids`. Nguồn chuẩn hiện tại:
> `DOI_ENDPOINT_PINS_BOOKMARKS_VA_LAZY_LOAD_INFORMATION.md`.

## 0. Trạng thái triển khai & checklist khi quay lại (handoff)

**Đã xong (code):**

- ✅ **Backend** — biên dịch sạch (0 error). Tách ghim sang collection `PinnedMessage`; gỡ `IsPinned`/`PinnedBy` khỏi `Message`/DTO/cache/projection; `PinMessage` ghi vào collection (idempotent) + giữ realtime; `GET messages/pinned` phân trang + resolve nội dung từ cache; thêm `GET messages/pinned/ids`; `GET bookmarks/messages` phân trang; recall tự xoá bản ghi ghim (cùng transaction).
- ✅ **Frontend** — build sạch (0 error). `usePinMessage` lấy trạng thái ghim qua `pinned/ids`; `MessageContent`/`MessageMenu_Slide` bỏ đọc `message.isPinned`; `InformationPin`/`InformationBookmark` dùng infinite query + load-more; realtime pin/recall đồng bộ cache; bổ sung các `VITE_ENDPOINT_*` còn thiếu vào `client/.env`.
- ✅ **Tài liệu** — feature + api-changes (file này).

**Còn lại (vận hành — làm khi quay lại):**

- [ ] **Restart Chat.API** để code mới có hiệu lực (tiến trình cũ đang chạy giữ DLL).
- [ ] **(Nếu giữ pin cũ) chạy migration mục 6** — script đã sửa để `_id` là **string**. ⚠️ Nếu đã lỡ chạy bản cũ (`new ObjectId().str`), **dọn doc `_id` kiểu ObjectId trước** rồi mới chạy lại (xem mục 6.1), nếu không GET pinned sẽ lỗi `Cannot deserialize a 'String' from BsonType 'ObjectId'`.
- [ ] **Tạo index mục 7** (service KHÔNG tự tạo — đã quyết định chạy tay).
- [ ] **Verify trên app thật:** panel Pinned/Saved load + load-more mượt; ghim/bỏ ghim đồng bộ realtime giữa 2 client; recall gỡ ghim khỏi danh sách + badge.
- [ ] **`client/.env` vẫn thiếu** các endpoint khác (edit/recall/poll/translate/get-around) — bổ sung nếu exercise những tính năng đó.

**Đã gặp & đã fix:** `_id` phải là **string** (khớp `Domain.Base.BaseIdModel`); script migration cũ dùng `new ObjectId().str` sinh sai kiểu → đã thay bằng helper sinh hex string.

## 1. Tóm tắt thay đổi

- **Ghim tin đã tách khỏi tin nhắn**: thay vì cờ `IsPinned`/`PinnedBy` nhúng trong từng phần tử `Messages` của `Conversation`, trạng thái ghim nay lưu ở **collection `PinnedMessage`** (top-level, per-conversation). Đối xứng với `Bookmark` (đã lưu, per-user).
- **Payload tin nhắn (đọc/cache/fetch) không còn `isPinned`/`pinnedBy`.** FE lấy trạng thái ghim inline qua endpoint `pinned/ids` riêng.
- **Danh sách "đã ghim" và "đã lưu" của hội thoại nay phân trang** (`page`/`limit`) và trả về `{ hasMore, ... }`.
- Recall tin: server tự **xóa bản ghi ghim** của tin đó (thay cho việc gỡ cờ trên sub-doc).

## 2. Collection mới: `PinnedMessage`

| Field | Type | Ghi chú |
|---|---|---|
| `_id` | string | id bản ghi ghim |
| `ConversationId` | string | hội thoại |
| `MessageId` | string | tin được ghim |
| `PinnedBy` | string | người ghim (audit + tooltip) |
| `CreatedTime` | date | thời điểm ghim (sắp xếp mới ghim trước) |
| `UpdatedTime` | date | |

Một tin có tối đa 1 bản ghi (thao tác ghim idempotent).

## 3. Endpoints

### 3.1 Ghim / bỏ ghim (không đổi route, đổi backend lưu trữ)

`PUT /api/v1/conversations/{conversationId}/messages/{id}/pin?pinned={true|false}`

- `pinned=true` khi đã ghim → no-op; `pinned=false` khi chưa ghim → no-op.
- Chỉ thành viên hội thoại được thao tác.
- Fanout realtime `NewMessagePinned` (kèm `isPinned`, `pinnedBy`) tới các thành viên khác.

### 3.2 Danh sách tin đã ghim — **phân trang (ĐỔI SHAPE)**

`GET /api/v1/conversations/{id}/messages/pinned?page={page}&limit={limit}&keyword={keyword}`

| Param | Type | Required | Default | Note |
|---|---|---|---|---|
| `page` | int | no | 1 | |
| `limit` | int | no | 10 | |
| `keyword` | string | no | — | có keyword ⇒ chế độ tìm: trả toàn bộ match, `hasMore=false` |

```bash
curl -X GET 'http://localhost:5000/api/v1/conversations/{conversationId}/messages/pinned?page=1&limit=20' \
     -H 'Authorization: Bearer {accessToken}'
```

Response (**mới** — trước đây là mảng `PinnedMessageResult[]`):

```json
{
  "hasMore": true,
  "items": [
    {
      "id": "665f...",               // pinnedMessage id
      "messageId": "65f1...",
      "type": "text",
      "content": "hello world",       // preview theo loại tin
      "contactId": "65a0...",         // người gửi
      "pinnedBy": "65a0...",
      "messageCreatedTime": "2026-07-20T09:12:00Z",
      "pinnedTime": "2026-07-22T03:00:00Z",
      "isUnavailable": false
    }
  ]
}
```

### 3.3 messageId các tin đã ghim (badge inline) — **MỚI**

`GET /api/v1/conversations/{conversationId}/messages/pinned/ids`

```json
[ { "messageId": "65f1...", "pinnedBy": "65a0..." } ]
```

### 3.4 Danh sách tin đã lưu của hội thoại — **phân trang (ĐỔI SHAPE)**

`GET /api/v1/conversations/{id}/bookmarks/messages?page={page}&limit={limit}&keyword={keyword}`

Response (**mới** — trước đây là mảng `BookmarkItemResponse[]`):

```json
{
  "hasMore": false,
  "bookmarks": [
    {
      "id": "665f...", "conversationId": "65c...", "conversationTitle": "Team",
      "isGroup": true, "messageId": "65f1...", "messageType": "text",
      "content": "note", "senderId": "65a0...", "senderName": "An",
      "senderAvatar": null, "messageCreatedTime": "2026-07-20T09:12:00Z",
      "bookmarkedTime": "2026-07-22T03:00:00Z", "isUnavailable": false
    }
  ]
}
```

### 3.5 Không đổi

- `PUT /api/v1/conversations/{conversationId}/messages/{id}/bookmark?bookmarked={bool}` — lưu/bỏ lưu.
- `GET /api/v1/conversations/{conversationId}/bookmarks` — messageId đã lưu (badge inline).

## 4. Breaking changes cần lưu ý cho client

1. `GET .../messages/pinned` trả **object `{hasMore, items}`** thay vì mảng.
2. `GET .../bookmarks/messages` trả **object `{hasMore, bookmarks}`** thay vì mảng.
3. Payload tin nhắn (get messages / fetch / cache warm) **không còn** `isPinned`, `pinnedBy`. Client render badge ghim inline từ `.../messages/pinned/ids`.

## 5. Biến môi trường FE bổ sung (`client/.env`)

```
VITE_ENDPOINT_MESSAGE_BOOKMARK = '/conversations/{conversationId}/messages/{id}/bookmark?bookmarked={bookmarked}'
VITE_ENDPOINT_MESSAGE_PINNED = '/conversations/{id}/messages/pinned?page={page}&limit={limit}&keyword={keyword}'
VITE_ENDPOINT_CONVERSATION_BOOKMARK_IDS = '/conversations/{id}/bookmarks'
VITE_ENDPOINT_CONVERSATION_BOOKMARK_MESSAGES = '/conversations/{id}/bookmarks/messages?page={page}&limit={limit}&keyword={keyword}'
VITE_ENDPOINT_CONVERSATION_PINNED_IDS = '/conversations/{id}/messages/pinned/ids'
VITE_ENDPOINT_CONVERSATION_LINKS = '/conversations/{id}/links'   # 2026-07-23: bỏ ?page&limit (không phân trang)
```

## 6. Di trú dữ liệu (Phase 1 — bắt buộc)

Nạp các tin đang được ghim (cờ cũ trên sub-doc) sang collection `PinnedMessage`. Chạy **một lần** bằng `mongosh`:

```javascript
// DB Warehouse. Idempotent: bỏ qua tin đã có bản ghi ghim / tin đã thu hồi.
const wh = db.getSiblingDB("Warehouse");
const now = new Date();
// _id BẮT BUỘC là string (khớp Domain.Base.BaseIdModel.Id = string). Sinh hex 24 ký tự
// tin cậy trên mọi shell — TUYỆT ĐỐI không để Mongo tự sinh _id (sẽ ra kiểu ObjectId → lỗi đọc).
const newId = () => { const o = new ObjectId(); return o.toHexString ? o.toHexString() : o.str; };
wh.Conversation.find({ "Messages.IsPinned": true }, { _id: 1, Messages: 1 }).forEach((conv) => {
  (conv.Messages || []).forEach((m) => {
    if (m.IsPinned === true && !m.RecalledTime) {
      const exists = wh.PinnedMessage.findOne({ ConversationId: conv._id, MessageId: m._id });
      if (!exists) {
        wh.PinnedMessage.insertOne({
          _id: newId(),                       // string (KHÔNG dùng ObjectId trực tiếp)
          ConversationId: conv._id,
          MessageId: m._id,
          PinnedBy: m.PinnedBy || "",
          CreatedTime: m.CreatedTime || now,  // xấp xỉ thời điểm ghim cho dữ liệu cũ
          UpdatedTime: now
        });
      }
    }
  });
});
```

### 6.1 Dọn document `_id` sai kiểu (nếu đã lỡ chạy script bản cũ)

Bản cũ dùng `new ObjectId().str` có thể chèn document với `_id` kiểu **ObjectId** → GET pinned lỗi
`Cannot deserialize a 'String' from BsonType 'ObjectId'`. Kiểm tra và dọn trước khi chạy lại:

```javascript
const wh = db.getSiblingDB("Warehouse");
// Kiểm tra: đáng lẽ toàn bộ _id phải là "string".
wh.PinnedMessage.aggregate([{ $group: { _id: { $type: "$_id" }, count: { $sum: 1 } } }]);

// Nếu chỉ là data test → xoá các doc _id sai kiểu:
wh.PinnedMessage.deleteMany({ _id: { $type: "objectId" } });

// Nếu cần giữ → chuyển _id sang string (re-insert vì _id bất biến):
wh.PinnedMessage.find({ _id: { $type: "objectId" } }).forEach((d) => {
  const oldId = d._id;
  d._id = oldId.toHexString ? oldId.toHexString() : oldId.str;
  wh.PinnedMessage.insertOne(d);
  wh.PinnedMessage.deleteOne({ _id: oldId });
});
```

### 6.2 Gỡ cờ ghim cũ (tùy chọn)

(Sau khi xác nhận migration ổn) gỡ cờ cũ khỏi tin nhắn để dọn dữ liệu:

```javascript
db.getSiblingDB("Warehouse").Conversation.updateMany(
  {}, { $unset: { "Messages.$[].IsPinned": "", "Messages.$[].PinnedBy": "" } }
);
```

## 7. Index đề xuất (Phase 2)

> MongoDB **tự tạo collection** `PinnedMessage` khi có insert đầu tiên (không cần tạo thủ công).
> Index thì **không** tự tạo — chạy các lệnh dưới một lần (idempotent):

```javascript
const wh = db.getSiblingDB("Warehouse");
// Ghim: liệt kê theo hội thoại (mới ghim trước) + tra cứu/gỡ theo tin.
wh.PinnedMessage.createIndex({ ConversationId: 1, CreatedTime: -1 });
wh.PinnedMessage.createIndex({ ConversationId: 1, MessageId: 1 }); // (tùy chọn thêm { unique: true } để chặn trùng cứng)
wh.PinnedMessage.createIndex({ MessageId: 1 });
// Đã lưu: liệt kê theo người dùng trong hội thoại + tra trạng thái theo tin.
wh.Bookmark.createIndex({ ContactId: 1, ConversationId: 1, CreatedTime: -1 });
wh.Bookmark.createIndex({ ContactId: 1, MessageId: 1 });
```

## 8. Rollback

- Code: revert commit. Dữ liệu `PinnedMessage` để lại vô hại (không ảnh hưởng bản cũ đọc cờ trên sub-doc **nếu** chưa chạy bước `$unset` mục 6). Nếu đã `$unset`, cần nạp lại cờ từ `PinnedMessage` trước khi rollback.
