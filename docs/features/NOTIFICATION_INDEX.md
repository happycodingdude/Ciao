# MongoDB Index — Notification

> **Cập nhật:** 2026-06-27 · **Trạng thái:** script sẵn sàng, **CHƯA chạy trên DB**.
> Liên quan: phân trang `/notifications` (xem `Presentation/Notification/GetNotifications.cs` → `GetPagedAsync`).

---

## Tóm tắt

| Mục | Giá trị |
|---|---|
| Collection | `Notification` (DB `Warehouse`) |
| Index | `{ ContactId: 1, CreatedTime: -1 }` |
| Tên | `ix_contactId_createdTime_desc` |
| Phục vụ | filter `ContactId == userId` + sort `CreatedTime` giảm dần (page 1 = mới nhất) |
| Lý do | tránh **collection scan + in-memory sort** (Mongo giới hạn sort 32MB) khi notification nhiều |

Compound index theo thứ tự **prefix `ContactId` (equality) → `CreatedTime: -1` (sort)** đúng ESR rule (Equality, Sort, Range): vừa lọc theo user vừa trả sẵn theo thứ tự sort, không cần sort lại trong RAM.

---

## Script tạo index

### mongosh

```js
// DB Warehouse — tạo index phân trang cho Notification (idempotent: chạy lại an toàn).
db.getSiblingDB("Warehouse").Notification.createIndex(
  { ContactId: 1, CreatedTime: -1 },
  { name: "ix_contactId_createdTime_desc" }
);
```

> `createIndex` **idempotent**: gọi lại với cùng key + cùng name là no-op. Khác key nhưng trùng name → lỗi; trùng key nhưng khác name → tạo index trùng (tránh).

### Chạy từ shell

```bash
mongosh "<CONNECTION_STRING>" --eval '
  db.getSiblingDB("Warehouse").Notification.createIndex(
    { ContactId: 1, CreatedTime: -1 },
    { name: "ix_contactId_createdTime_desc" }
  )'
```

---

## Verify

```js
// 1. Liệt kê index hiện có
db.getSiblingDB("Warehouse").Notification.getIndexes();

// 2. Xác nhận query dùng index (IXSCAN, không COLLSCAN; không có SORT stage in-memory)
db.getSiblingDB("Warehouse").Notification
  .find({ ContactId: "<userId>" })
  .sort({ CreatedTime: -1 })
  .limit(10)
  .explain("executionStats");
```

Kết quả mong đợi trong `explain`:
- `winningPlan.inputStage.stage = "IXSCAN"` với `indexName = "ix_contactId_createdTime_desc"`.
- **Không** có stage `SORT` (đã serve bởi index).
- `totalDocsExamined` ≈ `limit` (không quét cả collection).

---

## Ghi chú vận hành

- **Build index nền:** MongoDB ≥ 4.2 build index không block write đáng kể. Với collection lớn vẫn nên chạy lúc tải thấp.
- **Rollback:** `db.getSiblingDB("Warehouse").Notification.dropIndex("ix_contactId_createdTime_desc")`.
- **Tự động hoá (tuỳ chọn, chưa làm):** đã cân nhắc `IHostedService` tạo index lúc startup (idempotent) theo pattern `AddHostedService` ở `InfrastructureServiceInstaller`. Hiện chọn chạy script thủ công; nếu muốn tự động, đăng ký một `MongoIndexInitializer : IHostedService` dùng `MongoDbContext` + `Builders<Notification>.IndexKeys.Ascending(x => x.ContactId).Descending(x => x.CreatedTime)`.
