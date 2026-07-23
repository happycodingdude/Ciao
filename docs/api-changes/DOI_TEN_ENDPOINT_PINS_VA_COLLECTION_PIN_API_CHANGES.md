# Đổi tên endpoint `/pins` + collection `Pin`

Chuẩn hóa cách đặt tên của tính năng Ghim (Pin) theo đúng convention của Bookmark:
endpoint ngắn gọn ở cấp hội thoại + collection đặt tên theo danh từ đơn (`Bookmark` → `Pin`).

## Trạng thái
- ✅ **Backend** — biên dịch sạch (0 error). Đổi tên collection lưu trạng thái ghim và rút gọn đường dẫn lấy danh sách id đã ghim.
- ✅ **Frontend** — chỉ đổi giá trị endpoint trong `client/.env` (đọc qua biến môi trường, không đổi code gọi API).

## 1. Đổi tên endpoint

| | Trước | Sau |
|---|---|---|
| Lấy id các tin đã ghim trong hội thoại | `GET /api/v1/conversations/{conversationId}/messages/pinned/ids` | `GET /api/v1/conversations/{conversationId}/pins` |

- Method, phân quyền (yêu cầu đăng nhập + là thành viên hội thoại), request và response **giữ nguyên**.
- Response vẫn là mảng `{ messageId, pinnedBy }` — dùng để hiển thị badge "đã ghim" + tooltip "ghim bởi ..." trên từng tin mà không cần tải toàn bộ danh sách ghim.
- Đối xứng với endpoint id của Bookmark: `GET /conversations/{id}/bookmarks`.

### KHÔNG thay đổi trong lần này
Chỉ đổi đúng endpoint được yêu cầu. Hai endpoint ghim còn lại giữ nguyên đường dẫn:

| Chức năng | Đường dẫn (giữ nguyên) |
|---|---|
| Ghim / bỏ ghim một tin | `PUT /api/v1/conversations/{conversationId}/messages/{id}/pin` |
| Danh sách tin đã ghim (phân trang) | `GET /api/v1/conversations/{id}/messages/pinned` |

> Ghi chú: để đồng bộ hoàn toàn với Bookmark (`/bookmarks` + `/bookmarks/messages`), có thể đổi tiếp danh sách phân trang thành `/pins/messages` ở một thay đổi riêng — chưa thực hiện vì nằm ngoài phạm vi yêu cầu.

## 2. Đổi tên collection

| Trước | Sau |
|---|---|
| `PinnedMessage` | `Pin` |

- Cấu trúc bản ghi **giữ nguyên**: `ConversationId`, `MessageId`, `PinnedBy` (+ trường chung `Id`, `CreatedTime`, ...).
- Tên collection được suy ra từ tên class entity, nên đổi entity đồng nghĩa đổi collection.
- Đối xứng với collection `Bookmark`.

## 3. Migration dữ liệu (BẮT BUỘC khi deploy)

Sau khi deploy, ứng dụng đọc/ghi ở collection `Pin`. Dữ liệu ghim hiện có đang nằm ở
collection `PinnedMessage` → **phải đổi tên collection** trong cùng cửa sổ deploy, nếu không
toàn bộ trạng thái ghim sẽ biến mất cho tới khi migration chạy.

`renameCollection` giữ nguyên **toàn bộ documents và index** (không cần tạo lại index).

Chạy **một lần** bằng `mongosh` (DB `Warehouse`):

```js
const wh = db.getSiblingDB("Warehouse");

// An toàn: chỉ rename nếu chưa có collection đích còn dữ liệu.
const src = wh.getCollectionNames().includes("PinnedMessage");
const dstCount = wh.getCollectionNames().includes("Pin") ? wh.Pin.countDocuments() : 0;

if (!src) {
  print("Bỏ qua: không có collection PinnedMessage.");
} else if (dstCount > 0) {
  print("DỪNG: collection Pin đã tồn tại và có dữ liệu — cần merge/kiểm tra thủ công.");
} else {
  // dropTarget=true để xử lý trường hợp app đã tự tạo collection Pin RỖNG sau khi deploy.
  wh.PinnedMessage.renameCollection("Pin", true);
  print("Đã đổi tên PinnedMessage -> Pin. Số bản ghi: " + wh.Pin.countDocuments());
}
```

### Thứ tự triển khai đề xuất (tránh mất dữ liệu / 404)
1. Chạy migration `renameCollection` **trước** khi cho phiên bản mới nhận traffic (hoặc trong cửa sổ bảo trì).
2. Deploy backend mới (đọc/ghi `Pin`, expose route `/pins`).
3. Deploy frontend mới (đã build với endpoint `/pins`).

> Trong khoảng giao thời BE mới ↔ FE cũ (hoặc ngược lại), request tới đường dẫn không khớp sẽ trả 404. Deploy BE và FE gần nhau để thu hẹp cửa sổ này.

## 4. Rollback
- **Code**: revert commit.
- **Dữ liệu**: đổi tên ngược lại `wh.Pin.renameCollection("PinnedMessage", true)`.
