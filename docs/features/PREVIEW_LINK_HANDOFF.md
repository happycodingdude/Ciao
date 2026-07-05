# Preview Link — Tổng kết triển khai (Handoff)

> **Ngày:** 2026-07-05 · **Thuộc:** Phase 2 – Làm cuộc trò chuyện sinh động hơn (Đợt 2)
> Tài liệu nghiệp vụ: [`TINH_NANG_PHASE_2_STICKER_GIF_POLL_CONTACT_TRANSLATE.md`](./TINH_NANG_PHASE_2_STICKER_GIF_POLL_CONTACT_TRANSLATE.md) ·
> Kế hoạch: [`KE_HOACH_PHASE_2_SINH_DONG.md`](./KE_HOACH_PHASE_2_SINH_DONG.md)

---

## 1. Tính năng (góc người dùng)

Gửi một tin nhắn có chứa liên kết → tin hiện ngay lập tức → sau vài giây **thẻ xem trước** tự hiện dưới tin: ảnh, tiêu đề, mô tả, tên miền. Bấm vào thẻ mở link ở tab mới. Thẻ hiện realtime cho mọi người trong hội thoại và **giữ nguyên khi tải lại**.

**Trạng thái:** ✅ Code xong, logic đã verify bằng harness. ⏳ Chưa E2E trên stack chạy thật (Kafka/Mongo/Redis/FCM + browser).

---

## 2. Quyết định kiến trúc chính

| Quyết định | Lý do |
| --- | --- |
| **Không phải message type mới** — chỉ làm giàu tin `text` có URL | Luồng gửi tin không đổi (không đụng validator/DTO gửi). Đơn giản, ít rủi ro. |
| **Fetch bất đồng bộ, không chặn gửi tin** | Tin hiển thị tức thì; không phụ thuộc tốc độ trang bên ngoài. |
| **Consumer group RIÊNG** (`linkpreview-consumer`) | Fetch OG là I/O ngoài chậm (timeout tới vài giây). Mỗi consumer chạy tuần tự 1 thread → nếu chung group sẽ chặn cả pipeline tin nhắn. Cô lập là bắt buộc. |
| **BE tự fetch (không dịch vụ ngoài)** | Không phụ thuộc bên thứ 3, không tốn phí. Theo precedent `TranslationService`. |

---

## 3. Luồng dữ liệu (mirror pattern Poll)

```
Gửi tin text → hiển thị NGAY
DataStoreConsumer.HandleNewMessage (persist xong)
  └─ nếu type=text & có URL (LinkDetector.FirstUrl, ưu tiên link đầu)
     → produce linkpreview.requested

linkpreview.requested → LinkPreviewConsumer (group riêng, thread riêng)
  ├─ ILinkPreviewService.FetchAsync (SSRF-safe) → null nếu không lấy được
  ├─ persist LinkPreview vào Message (Mongo positional, idempotent: chỉ khi chưa có)
  └─ produce linkpreview.stored

linkpreview.stored → CacheConsumer.UpdateLinkPreview (Redis message cache) → linkpreview.notify
linkpreview.notify → NotificationConsumer → FCM "LinkPreviewReady"
FE onLinkPreviewReady → patch message.linkPreview → <LinkPreviewCard> dưới bubble text
```

---

## 4. An toàn — chống SSRF (điểm cốt lõi)

Vì URL do người dùng nhập, `LinkPreviewService` phải chặn truy cập nội bộ:

- Chỉ chấp nhận `http`/`https`.
- `SocketsHttpHandler.ConnectCallback` xác thực **IP thực tại mỗi lần connect** (kể cả sau redirect) → chặn private/loopback/link-local/**metadata cloud 169.254.169.254**/CGNAT/IPv4-mapped, và **triệt tiêu DNS-rebinding** (connect đúng IP đã kiểm, không resolve lại).
- Giới hạn: redirect ≤ 3, timeout 6s, chỉ parse `text/html`.
- Đọc tối đa **2MB** (buffer co giãn) — xem mục 6.
- Mọi thất bại → trả `null` → tin giữ link thường (không phá luồng chat).

---

## 5. Các file thay đổi

**Backend (mới):**
- `Shared/Utils/LinkDetector.cs` — trích URL đầu tiên trong nội dung.
- `Application/Services/ILinkPreviewService.cs` — abstraction (đổi provider không đụng caller).
- `Infrastructure/Services/LinkPreviewService.cs` — fetch SSRF-safe + parse OG/Twitter/`<title>`/meta.
- `Infrastructure/BackgroundJobs/LinkPreviewConsumer.cs` — consumer group riêng.

**Backend (sửa):**
- `Domain/Entities/Message.cs` — thêm entity `LinkPreview` + field `Message.LinkPreview`.
- `Application/DTOs/MessageDTO.cs` — thêm `LinkPreview` vào read model (reload giữ thẻ).
- `Application/Kafka/Model/Topic.cs`, `KafkaMessage.cs` — 3 topic + payload model.
- `Application/WebSocketEvents/ChatEventNames.cs`, `ChatEventModels.cs` — event `LinkPreviewReady`.
- `Application/Caching/MessageCache.cs` — `UpdateLinkPreview` (cập nhật Redis cache).
- `Infrastructure/BackgroundJobs/DataStoreConsumer.cs` — enqueue khi text có URL.
- `Infrastructure/BackgroundJobs/CacheConsumer.cs` — xử lý `linkpreview.stored`.
- `Infrastructure/BackgroundJobs/NotificationConsumer.cs` — fanout FCM.
- `Infrastructure/BackgroundJobs/KafkaBackground.cs` — đăng ký group mới + subscribe topic.
- `Infrastructure/GlobalUsings.cs`, `Chat.API/Configurations/InfrastructureServiceInstaller.cs` — DI.

**Frontend:**
- `client/src/components/message/LinkPreviewCard.tsx` (mới) — thẻ preview.
- `client/src/components/message/MessageContent.tsx` — render thẻ dưới bubble text.
- `client/src/types/message.types.ts`, `notification.types.ts` — type + event.
- `client/src/utils/notificationHandlers.ts` — `onLinkPreviewReady` patch cache.

---

## 6. Bug đã xử lý — YouTube (và trang nặng) không hiện thẻ

**Triệu chứng:** link YouTube không ra thẻ.
**Nguyên nhân (đã xác minh, không đoán):** YouTube nhồi khối script `ytInitialData` ~600KB **trước** thẻ `<meta og:*>` (og:title ở offset ~633KB). Trần đọc ban đầu 512KB cắt trước khi tới meta → parse rỗng → không thẻ.
**Fix:** nâng trần đọc lên **2MB** + đọc theo buffer co giãn (`ArrayPool` + `MemoryStream`, không pre-alloc trọn trần). Sau fix: YouTube (`youtube.com/watch` và `youtu.be`), GitHub, example.com đều ra thẻ đúng.

---

## 7. Đã test gì

Harness reflection chạy trực tiếp trên DLL đã build (scratchpad):
- **SSRF guard** — 25 case: chặn mọi dải nội bộ (private/loopback/link-local/metadata/CGNAT/IPv4-mapped), cho phép IP public.
- **Parse metadata** — OG ưu tiên hơn `<title>`, decode HTML entity, ảnh tương đối → tuyệt đối, fallback title-only, không metadata → `null`.
- **Live HTTP thật** — fetch example.com/GitHub/YouTube ra thẻ; `localhost`/`127.0.0.1`/scheme sai/garbage → `null`.
- Build BE `0 error`; FE typecheck sạch cho file đã sửa.

**Chưa test (cần stack thật + browser):** Kafka tạo topic + FCM fanout + render UI + persistence Mongo/Redis end-to-end.

---

## 8. Việc còn lại / hạn chế

- **E2E trên stack thật** — quan sát: (1) gửi link thấy thẻ sau vài giây, (2) người khác thấy realtime, (3) F5 vẫn còn thẻ.
- **Trang chặn OG** — vẫn hiển thị link thường (đúng thiết kế).
- **Tin nhắn thoại** (phần còn lại của Đợt 2) — chưa triển khai, giữ trong kế hoạch.
