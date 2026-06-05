# Tính năng Hiển thị Trạng thái Tin Nhắn (Receipt)

## Mục đích

Hiển thị trạng thái đã gửi / đã nhận / đã xem (delivery & read receipts) trong
giao diện chat theo rule sản phẩm:

> **Chỉ hiển thị trạng thái tin nhắn (avatar người xem hoặc icon
> `Sent` / `Delivered`) khi tin nhắn CUỐI CÙNG của conversation là của bản
> thân. Trong mọi trường hợp khác, KHÔNG hiển thị bất kỳ status nào.**

Hệ quả:

- Tin của người khác → không bao giờ có status.
- Tin của mình KHÔNG phải tin cuối conversation → cũng không có status (kể cả
  trước đó từng có avatar / icon trên tin đó).
- Tin của mình LÀ tin cuối conversation (đã confirmed, không pending) → hiển
  thị status (avatar người đã xem, hoặc fallback icon `Sent`/`Delivered`).

## Cách hoạt động

### 1. Avatar người xem (Seen indicator)

Áp dụng khi tin cuối conversation là của mình. Với mỗi member khác có
`lastSeenTime >= lastMessage.createdTime` (đã đọc tới tin cuối) → render
avatar dưới tin cuối.

Hiển thị:

- 1 người đã xem → 1 avatar tròn nhỏ (3.5 × 3.5).
- Nhiều người (group chat) → tối đa 3 avatar, dư thì `+N`.

### 2. Icon Sent / Delivered — fallback khi chưa ai xem tin cuối

Nếu tin cuối là của mình nhưng chưa member nào có `lastSeenTime` đạt mốc:

- Direct chat: `Sent` (vòng trống) hoặc `Delivered` (vòng đặc) theo
  `lastDeliveredTime` của đối phương.
- Group chat: chỉ `Sent` (chưa hỗ trợ phân biệt Delivered theo từng member).

Avatar người xem ưu tiên hơn icon: một tin chỉ render một trong hai.

### 3. Pending message

Tin của mình đang pending (optimistic, chưa có id thật) KHÔNG được coi là tin
cuối hợp lệ → không render bất kỳ status nào cho tới khi confirmed.

## Bảng test scenarios

| Scenario | Hành vi đúng |
|---|---|
| Mình `"A"` (chưa ai xem) | Tin cuối là `"A"` của mình → `Sent` icon dưới `"A"` |
| Mình `"A"` → Bạn xem `"A"` | Tin cuối là `"A"` → avatar bạn dưới `"A"` |
| Mình `"A"` → Bạn `"B"` | Tin cuối `"B"` của bạn → **không hiển thị gì cả** (không có avatar/icon dưới `"A"`) |
| Mình `"A"` → Bạn `"B"` → Mình `"C"` (chưa xem) | Tin cuối `"C"` của mình → `Sent` dưới `"C"` |
| Mình `"A"` → Mình `"B"` → Bạn xem `"B"` | Tin cuối `"B"` → avatar bạn dưới `"B"`; `"A"` trống |
| Bạn `"X"` (mình chưa gửi gì) | Tin cuối của bạn → không hiển thị gì |
| Mình `"A"` đang pending | Pending → không hiển thị status; chờ confirmed |
| Group: A xem `"X"`, B xem `"Y"` của mình; tin cuối là `"Y"` | Avatar B dưới `"Y"`; `"X"` trống (vì không phải tin cuối) |

## Kiến trúc

### `Chatbox.tsx` — pre-compute ở parent

Tính toán dồn ở parent để tránh mỗi `MessageContent` tự scan messages:

```ts
// 1. Lấy tin cuối conversation
const lastMessage = allMessages.length > 0
  ? allMessages[allMessages.length - 1]
  : null;

// 2. Tin cuối phải là của mình + confirmed (có id, không pending)
const lastMessageIsMineConfirmed =
  !!lastMessage &&
  !!lastMessage.id &&
  lastMessage.contactId === info?.id &&
  !lastMessage.pending;

// 3. lastMyMessageId chỉ != null khi điều kiện trên thoả
const lastMyMessageId = lastMessageIsMineConfirmed
  ? (lastMessage?.id ?? null)
  : null;
```

`seenContactsByMessageId` (memo hoá) tối đa chỉ chứa 1 entry cho tin cuối —
chứa các member khác có `lastSeenTime >= lastMessage.createdTime`.
Complexity: O(m) với m = số member khác.

Prop truyền xuống `MessageContent`:

- `isLastFromMe = lastMyMessageId !== null && message.id === lastMyMessageId`
- `seenContacts = seenContactsByMessageId[message.id]`

### `MessageContent.tsx` — dumb render + defensive guard

Component không tự scan messages. Chỉ:

- `renderSeenAvatars()` từ `seenContacts` đã được tính sẵn.
- `renderOwnSendStatus()` fallback Sent/Delivered icon khi `isSelf && isLastFromMe && !pending && !hasSeenAvatars`.
- `hasSeenAvatars = isSelf && !!isLastFromMe && (seenContacts?.length ?? 0) > 0`
  — defensive guard đảm bảo không render avatar nếu props bị truyền sai
  trong tương lai.

## Cách sử dụng

- Tính năng hoạt động tự động dựa trên events cập nhật
  `conversation.members[].lastSeenTime` và `lastDeliveredTime`.
- Không cần thay đổi gì ở phía gọi component, chỉ cần `Chatbox` được cấp
  dữ liệu `messages` và `conversation` chuẩn.

## Lưu ý khi bảo trì

- **Không** scan messages trong `MessageContent` để tính seen status — luôn
  để parent (`Chatbox`) tính sẵn và pass xuống qua prop, tránh O(n·m).
- **Không** mở rộng để hiển thị status cho tin không phải tin cuối của
  conversation. Đây là rule sản phẩm hiện hành; nếu muốn đổi (ví dụ "anchor"
  avatar về tin của mình gần nhất bị đọc), cần sửa cả:
  - `lastMyMessageId` (logic chọn tin)
  - `seenContactsByMessageId` (filter pool)
  - Comments / docs ở `MessageContent` và `message.types.ts`.
- Tin pending (chưa có id thật) bị loại để không bị đánh dấu sai khi
  optimistic update.
- Khi UI có nhu cầu hiển thị Delivered cho group chat theo từng member, cần
  bổ sung field `lastDeliveredTime` per-member vào logic
  `renderOwnSendStatus` (hiện chỉ direct chat).
