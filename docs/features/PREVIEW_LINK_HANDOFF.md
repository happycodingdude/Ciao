# Preview Link — Tổng kết triển khai (Handoff)

> **Ngày:** 2026-07-05 · **Thuộc:** Phase 2 – Làm cuộc trò chuyện sinh động hơn (Đợt 2)
> Tài liệu nghiệp vụ: [`TINH_NANG_PHASE_2_STICKER_GIF_POLL_CONTACT_TRANSLATE.md`](./TINH_NANG_PHASE_2_STICKER_GIF_POLL_CONTACT_TRANSLATE.md) ·
> Kế hoạch: [`KE_HOACH_PHASE_2_SINH_DONG.md`](./KE_HOACH_PHASE_2_SINH_DONG.md)

---

## 1. Tính năng (góc người dùng)

Gửi một tin nhắn có chứa liên kết → tin hiện ngay lập tức → sau vài giây **thẻ xem trước** tự hiện dưới tin: ảnh, tiêu đề, mô tả, tên miền. Bấm vào thẻ mở link ở tab mới. Thẻ hiện realtime cho mọi người trong hội thoại và **giữ nguyên khi tải lại**.

**Hiển thị:** nếu tin nhắn **chỉ chứa đúng 1 liên kết** (không kèm chữ nào khác), sau khi thẻ xem trước sẵn sàng thì **bong bóng chữ URL bị ẩn**, chỉ còn lại thẻ preview (bản thân thẻ là vùng bấm mở link). Nếu tin có chữ kèm liên kết → giữ nguyên bong bóng chữ, thẻ preview hiện bên dưới như trước.

**Thao tác trên tin chỉ-là-link:** menu chức năng khi hover chỉ còn nút **Xoá** (ẩn sửa/copy/ghim/trả lời/dịch/chuyển tiếp) vì tin không có nội dung chữ hữu ích để thao tác. Nếu người dùng không có quyền xoá tin đó → không hiện menu.

**Nhiều liên kết trong 1 tin:** một tin chứa **nhiều URL** sẽ sinh **nhiều thẻ preview** (mỗi liên kết một thẻ, theo đúng thứ tự xuất hiện, tối đa 4 liên kết/tin). Các liên kết được fetch **song song** (không cộng dồn thời gian chờ); liên kết nào fetch được thì hiện thẻ, liên kết fail thì bỏ qua. Với tin nhiều-link, **bong bóng chữ được giữ lại** (không ẩn) để liên kết fetch fail vẫn còn thấy dưới dạng chữ — chỉ tin đúng-1-link mới ẩn chữ.

Các thẻ preview của cùng một tin được xếp **theo hàng ngang** và **cuộn ngang được** khi tổng bề rộng vượt quá khổ bong bóng; nếu màn hình đủ rộng thì các thẻ hiển thị cạnh nhau không cần cuộn.

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
- Giới hạn: redirect ≤ 3, timeout 15s (dừng-sớm tại `</head>` nên đa số fetch xong nhanh), chỉ parse `text/html`.
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

## 6b. Bug đã xử lý — trang thương mại điện tử body nặng bị TIMEOUT (link có / không ra thẻ tuỳ trang)

**Triệu chứng:** một số link (vd `cellphones.com.vn/iphone-17-pro.html`, `…iphone-17-pro-max.html`) không ra thẻ, trong khi link khác cùng site (trang sạc) lại ra — "có link được, link không".
**Nguyên nhân (xác minh từ log BE, không đoán):**
- `iphone-17-pro`: `TaskCanceledException — HttpClient.Timeout 6s elapsing` — tải hết **body ~875KB** không kịp trong 6s.
- `iphone-17-pro-max`: `TimeoutException — ConnectTimeout` — bắt tay TCP/TLS không xong trong 5s.
- Cả 2 trang **đều có OG hợp lệ**, `og:*` nằm trong `<head>` ở offset ~1KB, `</head>` ở ~20KB; nhưng BE trước đó tải cả trang (tới trần 2MB) nên trang body nặng dễ vượt timeout. Trang sạc nhẹ hơn nên kịp → khác biệt chỉ là "đua với timeout".

**Fix:**
1. **Dừng đọc sớm tại `</head>`** — mọi og/twitter/title đều nằm trong `<head>`; đọc xong head thì ngừng, không kéo phần body khổng lồ. Product page ~800KB chỉ còn đọc ~20–32KB. YouTube (head ~637KB) vẫn đọc đủ vì OG nằm trước `</head>`, dưới trần 2MB.
2. **Nới timeout:** total 6s → **15s**, connect 5s → **8s** (nhờ dừng-sớm, đa số fetch xong rất nhanh nên trần cao chỉ chạm khi server thực sự chậm).

Đã verify bằng harness chạy đúng thuật toán đọc mới trên HTML thật của 4 URL (3 cellphones + YouTube): bytes đọc giảm mạnh, `og:title` vẫn nằm trong phần đọc → tất cả PASS.

**Lưu ý vận hành:** tin đã gửi TRƯỚC fix đã lưu `linkPreview=null` và consumer sẽ KHÔNG xử lý lại (idempotent) → các tin iphone cũ vẫn không có thẻ. Chỉ link **gửi mới** sau khi restart BE mới hưởng fix.

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

---

## 9. Bugfix FE liên quan tin nhắn link (phiên 2026-07-06)

Hai lỗi phía client phát hiện khi dùng thật với tin nhắn có preview link, đã fix triệt để.

### 9.1. Khung chat không cuộn xuống đáy khi reload / gửi / nhận tin

**Hiện tượng:** Mở lại hội thoại có ảnh/thẻ preview, hoặc gửi/nhận tin có link → khung chat kẹt lơ lửng giữa chừng, không xuống đáy, hiện nút "cuộn xuống đáy".

**Nguyên nhân:** Ảnh trong thẻ preview tải chậm (lazy) và không giữ sẵn chiều cao → tải xong mới cao thêm. Cơ chế tự bám đáy bị "race": ngay sau khi kéo về đáy, một sự kiện cuộn chạy trễ đọc nhầm chiều cao mới → tưởng người dùng đã rời đáy → ngừng bám → kẹt.

**Cách sửa (nghiệp vụ):** Khung chat **chỉ coi là rời đáy khi người dùng thực sự cuộn LÊN**. Nội dung cao thêm ở dưới (ảnh/thẻ tải xong) không còn bị hiểu nhầm là hành động rời đáy → luôn bám sát đáy trong lúc nội dung đang tải. Chi tiết hành vi: [`CHATBOX_SCROLL_STICK.md`](./CHATBOX_SCROLL_STICK.md).

**Verify:** Harness mô phỏng đúng race — logic cũ kẹt cách đáy 800px (tái hiện lỗi), logic mới về đáy (0px) và vẫn rời đáy đúng khi người dùng chủ động cuộn lên.

### 9.2. Người NHẬN tin link bị crash cả màn hình chat

**Hiện tượng:** Khi người khác gửi tin chỉ-là-link, phía người nhận văng lỗi "Rendered fewer hooks than expected", trắng toàn bộ khung chat.

**Nguyên nhân:** Menu thao tác của tin nhắn khai báo một số hook **sau** nhánh thoát sớm (ẩn menu). Với tin chỉ-là-link của người khác, menu bị ẩn (người nhận không có quyền thu hồi) → thoát sớm → số hook chạy ít hơn lần render trước → React sập. Chỉ xảy ra ở **người nhận**; người gửi có quyền xoá nên menu không bị ẩn → không lỗi.

**Cách sửa:** Đưa toàn bộ hook lên trước mọi nhánh thoát sớm (tuân thủ Rules of Hooks). Việc ẩn/hiện menu giờ chỉ tác động phần hiển thị, không còn thay đổi số hook. Fix luôn nhánh tin đã thu hồi vốn có cùng lỗi tiềm ẩn.

**Verify:** Đối chiếu code xác nhận đúng đường dẫn trigger (tin nhận → không quyền thu hồi + tin chỉ-là-link → ẩn menu → thiếu hook); typecheck sạch; HMR nạp live.

---

## 10. Cải tiến vận hành (phiên 2026-07-08) — Cache theo URL + Proxy ảnh

Xử lý 2 rủi ro phát hiện khi rà soát: fetch trùng lặp (scale) và lộ IP/tracking người xem (privacy).

### 10.1. Cache thẻ preview theo URL (giảm fetch ngoài)

**Vấn đề:** cùng 1 liên kết gửi bởi nhiều người / nhiều tin đều fetch ngoài lại từ đầu → tốn I/O, tăng tải `LinkPreviewConsumer`, dễ bị lợi dụng spam link chậm.

**Cách làm (nghiệp vụ):** thêm một lớp nhớ tạm kết quả theo **từng liên kết** (không theo tin). Khi cần dựng thẻ cho một liên kết:
- Đã nhớ **thành công** → dùng lại ngay, không gọi ra ngoài.
- Đã nhớ **thất bại** (trang chặn/thời gian chờ) → bỏ qua, không thử lại ngay để khỏi "dội" trang lỗi; sau một khoảng ngắn mới cho thử lại (lỗi có thể tạm thời).
- Chưa nhớ → fetch một lần rồi ghi nhớ kết quả.

**Thời hạn nhớ:** thành công giữ lâu (nội dung xem-trước hiếm đổi); thất bại giữ ngắn. Nếu lớp nhớ tạm trục trặc → tự động fetch trực tiếp, không chặn tính năng chính.

**Kết quả:** một liên kết "viral" chỉ tốn đúng 1 lần fetch ngoài trong thời hạn nhớ, thay vì mỗi tin một lần.

### 10.2. Proxy ảnh xem-trước qua BE (bảo vệ IP/riêng tư người xem)

**Vấn đề:** trước đây trình duyệt người xem tải ảnh xem-trước **trực tiếp** từ máy chủ bên thứ 3 do **người gửi chọn** → lộ IP người xem, có thể bị cài ảnh theo dõi (tracking pixel).

**Cách làm (nghiệp vụ):** ảnh xem-trước giờ được tải **qua máy chủ Ciao** rồi mới trả về trình duyệt. Người xem không còn kết nối thẳng tới máy chủ lạ.
- Đường dẫn ảnh do BE tạo có **chữ ký** để chỉ những ảnh BE đã duyệt mới được phục vụ → không biến máy chủ thành "cổng trung chuyển" tùy tiện cho bất kỳ ai.
- Máy chủ tải lại ảnh vẫn theo đúng cơ chế **an toàn chống truy cập nội bộ (SSRF)** như khi dựng thẻ, và **chỉ chấp nhận đúng loại ảnh**.
- Ảnh không đổi theo đường dẫn đã ký → được lưu đệm mạnh ở trình duyệt/CDN, không tăng tải lặp lại.

**Tương thích ngược:** thẻ preview cũ (đã lưu đường dẫn ảnh trực tiếp trước cải tiến) vẫn hiển thị bình thường.

**API mới:** `GET /api/v1/link-preview/image` — endpoint proxy ảnh, **ẩn danh nhưng chỉ phục vụ đường dẫn có chữ ký hợp lệ**. Không dùng để gọi trực tiếp từ client thủ công.

**Verify:** harness chạy trên DLL đã build — 22/22 pass: round-trip ký/giải mã (gồm URL unicode, ký tự đặc biệt, URL dài), chặn chữ ký sai/rỗng/rác, **chặn tấn công đổi URL giữ chữ ký cũ** (chống trỏ vào địa chỉ nội bộ), chặn cross-key. BE build 0 error, FE typecheck sạch.

**Hạn chế còn lại:** chống lạm dụng theo tần suất (rate-limit số link/người) vẫn chưa làm — nằm ngoài phạm vi đợt này.
