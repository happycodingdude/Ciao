# Link mời & QR + Yêu cầu tham gia (Phase 5 — Đợt 2)

> **Trạng thái:** ✅ ĐÃ NGHIỆM THU trên app thật — luồng lõi 2026-07-17 (đủ checklist mục 1, gồm cả modal hoá preview case 16); **cải tiến giao diện link mời (case 17) nghiệm thu bổ sung 2026-07-23**. Các fix liên quan: [`FIX_REJOIN_LINK_TIN_NHAN.md`](./FIX_REJOIN_LINK_TIN_NHAN.md)
> **Nguồn kế hoạch:** [`KE_HOACH_PHASE_5_NHOM_CONG_DONG.md`](./KE_HOACH_PHASE_5_NHOM_CONG_DONG.md)

---

## 1. Checklist nghiệm thu (user verify trên app thật)

| # | Luồng | Kết quả mong đợi |
| --- | --- | --- |
| 1 | Quản trị nhóm mở panel Chat information | Thấy section **Invite link** (thành viên thường KHÔNG thấy) |
| 2 | Tạo link (chọn "Require admin approval" tắt, Expiry tùy ý) | Hiện QR + link `…/invite/{code}`, dòng mô tả đúng cấu hình |
| 3 | Bấm vào ô link | Copy vào clipboard, toast "Invite link copied" |
| 4 | Tài khoản B (chưa ở nhóm) mở link | Trang preview: avatar + tên nhóm + số thành viên + nút **Join group** |
| 5 | B bấm Join group | Toast chào mừng, về danh sách hội thoại, card nhóm xuất hiện (realtime); trong nhóm có dòng hệ thống "B joined the group via invite link"; **quản trị nhận notification "B joined … via invite link"** (bổ sung 2026-07-13) |
| 6 | Quản trị bấm **New link** | Link/QR đổi code; mở link CŨ → "invalid or has been revoked" |
| 7 | Quản trị bấm **Revoke** | Section quay về form tạo link; mở link cũ → invalid |
| 8 | Tạo link có bật **Require admin approval**; C mở link | Nút thành **Request to join**; bấm → "pending admin approval" + nút Withdraw |
| 9 | Quản trị xem panel | Section **Join requests (1)** hiện C + nút ✓/✗; đồng thời có notification "C requested to join the group" |
| 10 | Duyệt (✓) | C nhận notification được duyệt + card nhóm tới realtime; dòng hệ thống "C joined the group via invite link"; hàng chờ biến mất |
| 11 | Từ chối (✗) | C nhận notification bị từ chối; C mở lại link → gửi lại được yêu cầu |
| 12 | C bấm **Withdraw request** khi đang pending | Hàng chờ của quản trị mất dòng C (realtime) |
| 13 | Link đặt Expiry 1 day (giả lập hết hạn: sửa ExpireTime trong DB về quá khứ) | Mở link → "expired"; panel quản trị hiện "Link has expired" đỏ |
| 14 | Thành viên đã ở nhóm mở link | "You are already a member" + nút Open chat |
| 15 | Người RỜI nhóm mở link vào lại **rồi rời lại lần nữa** | Mỗi bước đều chạy đúng: vào lại mở lại member cũ (không tạo bản trùng ở cả dữ liệu gốc lẫn cache); card nhóm chỉ xuất hiện **một lần** trong danh sách hội thoại (không bị đúp); rời lại thành công, KHÔNG lỗi 500 |
| 16 | Mở link mời (mọi trạng thái: Join/Request/member/invalid) — cập nhật 2026-07-17 | Card mời hiện dạng **modal nổi** đè lên app (URL thành `/conversations?invite={code}`), trang bên dưới vẫn thấy (backdrop mờ như các modal khác, KHÔNG phải trang trắng); đóng bằng Esc / bấm backdrop / nút trong card → về đúng trang, param `invite` biến mất; reload khi modal đang mở → modal mở lại |
| 17 | Quản trị **thu gọn** section Invite link (nhóm đã có link) — cải tiến 2026-07-22 | Thay cho khoảng trắng, hiện **dòng tóm tắt gọn**: link + chỉ báo hạn dùng (thời gian còn lại "2d 5h" / "No expiry" / "Expired") + nút copy; bấm dòng để mở rộng lại, bấm copy chỉ sao chép (không mở rộng). Khi mở rộng, hạn dùng hiển thị dạng **nhãn trạng thái** rõ ràng: còn hạn kèm ngày–giờ cố định `dd/MM/yyyy HH:mm`, vĩnh viễn, hoặc đã hết hạn |

Điểm chú ý khi verify: Console không có error liên quan; Network không có request lỗi (ngoài 400 chủ đích khi mở link invalid).

---

## 2. Mục đích

- **Link mời & QR:** mời người vào nhóm nhanh bằng liên kết/mã QR, không cần thêm thủ công từng người.
- **Yêu cầu tham gia:** kiểm soát người vào nhóm — nhóm có thể yêu cầu quản trị duyệt trước khi thành thành viên.

## 3. Hành vi nghiệp vụ

### Link mời (quản trị)
- Chỉ **quản trị viên** của nhóm được xem/tạo/thay/thu hồi link (chat 1-1 không có tính năng này).
- Mỗi nhóm có **tối đa 1 link active**. Tạo link mới → link cũ vô hiệu ngay.
- Tùy chọn khi tạo: **cần duyệt** (bật/tắt) và **thời hạn** (vĩnh viễn / 1 ngày / 7 ngày / 30 ngày).
- Link hiển thị kèm **mã QR** (quét ra cùng URL) và nút copy.
- **Thu hồi:** mọi lượt mở/tham gia theo link cũ bị từ chối ngay; yêu cầu đang chờ KHÔNG bị xóa — quản trị vẫn xử lý được.

### Tham gia bằng link (người có link)
- Mở link (đã đăng nhập) → xem trước: tên nhóm, avatar, số thành viên. Phần xem trước hiện
  dưới dạng **hộp thoại nổi đè lên trang đang mở** (cùng kiểu với các hộp thoại khác của ứng
  dụng — cập nhật 2026-07-17; trước đây thay cả trang bằng một trang trắng riêng): trang bên
  dưới giữ nguyên hiện trạng, đóng bằng nút, phím Esc hoặc bấm ra ngoài. Tải lại trang khi
  hộp thoại đang mở → hộp thoại mở lại đúng link mời đó.
- Link sai/thu hồi/hết hạn → báo lỗi, **không lộ thông tin nhóm**.
- Nhóm vào thẳng → bấm Join là thành thành viên; nhóm bật duyệt → gửi yêu cầu, chờ quản trị.
- Đã là thành viên → mở thẳng hội thoại. Người từng rời nhóm → vào lại được như thành viên cũ
  (giữ nguyên mốc đã-đọc/biệt danh cũ — fix 2026-07-13, chi tiết ở [FIX_REJOIN_LINK_TIN_NHAN.md](./FIX_REJOIN_LINK_TIN_NHAN.md)).
- Vào nhóm thành công (mọi đường) → dòng hệ thống "{tên} joined the group via invite link".
- Nhóm **vào thẳng** (không bật duyệt): quản trị nhận **thông báo bền** "{tên} joined {nhóm} via invite link"
  (bổ sung 2026-07-13) — vì không có bước duyệt nên đây là kênh duy nhất để quản trị biết có người mới.
  Luồng có duyệt không gửi loại thông báo này (quản trị đã biết qua yêu cầu tham gia).

### Yêu cầu tham gia
- Người xin thấy trạng thái "đang chờ duyệt" và có thể **rút yêu cầu**.
- Không tạo được yêu cầu trùng (bấm nhiều lần/nhiều thiết bị = 1 yêu cầu).
- Quản trị thấy hàng chờ trong panel thông tin nhóm (realtime) + nhận thông báo khi có yêu cầu mới.
- **Duyệt** → người xin thành thành viên + được thông báo; **Từ chối** → người xin được thông báo và có thể gửi lại yêu cầu.
- Hai quản trị xử lý cùng lúc một yêu cầu → an toàn (người sau không gây tác dụng phụ).

## 4. Quy tắc & validate

- Mã link là chuỗi ngẫu nhiên mạnh (không đoán được); thời hạn tối đa 30 ngày.
- Mọi thao tác quản trị (xem link, tạo, thu hồi, xem hàng chờ, duyệt/từ chối) đều kiểm tra quyền quản trị ở server — UI ẩn chỉ là lớp ngoài.
- Xem preview/tham gia yêu cầu đăng nhập.

## 5. Trường hợp đặc biệt

- Link hết hạn/thu hồi → từ chối cả preview lẫn join.
- Duyệt yêu cầu sau khi đã thu hồi link → vẫn được (hàng chờ độc lập với link).
- Link bị thu hồi khi đang có yêu cầu chờ → người xin không rút qua UI được nữa (hạn chế chấp nhận), quản trị vẫn duyệt/từ chối được.
- Nhóm chưa giới hạn sĩ số → chưa có case "nhóm đầy".
- **Vào lại bằng link nhiều lần:** người đã rời vào lại luôn mở lại đúng một bản ghi thành viên — dù thao tác lặp lại (mạng chập chờn, bấm nhiều lần) cũng không sinh thành viên trùng, và rời nhóm sau đó vẫn hoạt động bình thường.

### Sửa lỗi (2026-07-12)

Hai lỗi cùng gốc "vào lại nhóm bằng link thêm bản trùng vào cache" (dữ liệu gốc luôn đúng — chỉ mở lại bản ghi cũ):

- **Lỗi 1 — rời lại báo 500:** rời nhóm → vào lại bằng link → rời lại lần nữa lỗi 500 (rời thất bại). Nguyên nhân: cache **danh sách thành viên** bị thêm bản trùng của chính người vào → thao tác rời sau đó gặp hai bản ghi cùng một người nên hỏng. Khắc phục: vào lại nhóm cập nhật cache theo kiểu thay-thế đúng người (không thêm trùng, an toàn cả khi xử lý lặp lại); thao tác rời cũng tự dọn bản trùng còn sót — tài khoản đang kẹt tự lành ngay ở lần rời kế tiếp, không cần đăng nhập lại.
- **Lỗi 2 — card nhóm hiện 2 lần:** sau khi vào lại, nhóm xuất hiện **hai dòng trùng nhau** trong danh sách hội thoại. Nguyên nhân: cache **danh sách hội thoại của người dùng** thêm lại id nhóm dù id đó vẫn còn (rời nhóm không gỡ id khỏi danh sách). Khắc phục: thêm hội thoại vào danh sách nay chống trùng (id chỉ xuất hiện một lần); phần đọc danh sách cũng lọc trùng để tài khoản đang bị đúp hiển thị đúng ngay, không cần đăng nhập lại.

### Sửa lỗi (2026-07-17) — loading thừa + request thừa sau khi tham gia bằng link

- **Hiện tượng:** bấm Join thành công → hội thoại đã nằm trên đầu danh sách, nhưng ~2–3 giây sau
  ứng dụng tải lại danh sách hội thoại một lần nữa, làm cả danh sách bị thay bằng màn hình
  loading một nhịp rồi mới hiện lại.
- **Nguyên nhân:** thẻ hội thoại hiện ngay sau Join là bản dựng tạm (chỉ có chính mình trong
  danh sách thành viên, chưa có giao diện tùy chỉnh của nhóm), nên ứng dụng phải gọi lại máy chủ
  một lần để lấy bản đầy đủ — chính lượt gọi đó gây màn loading thừa.
- **Khắc phục:** bỏ hẳn lượt gọi lại. Sự kiện realtime "có thành viên mới" nay mang **đầy đủ
  dữ liệu** (toàn bộ danh sách thành viên kèm vai trò quản trị, giao diện tùy chỉnh của nhóm,
  dòng hệ thống "đã tham gia") để ứng dụng tự hoàn thiện thẻ tạm — không request thừa, không
  loading thừa. Khi ghép dữ liệu sự kiện vào, các trạng thái cá nhân (mốc đã-đọc, tắt thông báo,
  ghim yêu thích) của người đang xem được giữ nguyên, không bị sự kiện ghi đè lùi.
- **Hiệu ứng kèm theo (chủ đích):** dòng xem trước của hội thoại trong danh sách nay cập nhật
  ngay thành "… joined the group via invite link" cho mọi thành viên khi có người mới vào —
  khớp với dữ liệu máy chủ, trước đây phải đợi tải lại mới thấy.
- **Hạn chế chấp nhận:** nếu thiết bị bỏ lỡ sự kiện realtime (rất hiếm khi đang thao tác trực
  tiếp), thẻ tạm vẫn hiển thị và dùng được; dữ liệu thành viên đầy đủ sẽ về theo lần tải tự
  nhiên sau.

### Cải tiến giao diện link mời (2026-07-22, nghiệm thu 2026-07-23)

Thuần hiển thị cho quản trị, **không đổi hành vi** tạo/thu hồi/tham gia:

- **Khi thu gọn** section Invite link (nhóm đã có link): thay cho khoảng trắng, hiện một **dòng
  tóm tắt** gồm link, chỉ báo hạn dùng và nút sao chép nhanh — quản trị nắm được trạng thái link
  mà không cần mở rộng. Bấm vào dòng để mở rộng lại; bấm nút sao chép chỉ sao chép link (không mở
  rộng section).
- **Chỉ báo hạn dùng** rõ theo ba trạng thái: còn hạn (kèm **thời gian còn lại** rút gọn ở dòng
  tóm tắt, ví dụ "2d 5h"/"45m"; và ngày–giờ hết hạn đầy đủ khi mở rộng), vĩnh viễn, hoặc đã hết
  hạn. Thời điểm hết hạn hiển thị theo **định dạng cố định `dd/MM/yyyy HH:mm`**, không phụ thuộc
  thiết lập vùng của trình duyệt để mọi quản trị thấy giống nhau.

## 6. Hạn chế hiện tại

- Chưa có rate-limit riêng cho tạo yêu cầu/lượt join (đồng bộ hiện trạng các endpoint khác).
- Hàng chờ không phân trang (được dọn ngay khi xử lý nên luôn nhỏ).
- Thành viên thường không tạo/chia sẻ được link (chỉ quản trị) — đúng phạm vi "kiểm soát ai được tạo liên kết" của kế hoạch.

---

## 7. API mới (contract)

| Method | Route | Quyền | Ghi chú |
| --- | --- | --- | --- |
| GET | `/api/v1/conversations/{id}/invite` | Quản trị nhóm | `{ invite: { code, requireApproval, expireTime, createdTime, expired } \| null }` |
| POST | `/api/v1/conversations/{id}/invite` | Quản trị nhóm | Body `{ requireApproval, expiresInHours? (1–720) }` → tạo/thay link |
| DELETE | `/api/v1/conversations/{id}/invite` | Quản trị nhóm | Thu hồi link (idempotent) |
| GET | `/api/v1/invites/{code}` | Đã đăng nhập | Preview: `{ status: active\|invalid\|expired, title, avatar, memberCount, requireApproval, isMember, hasPendingRequest, conversationId? }` |
| POST | `/api/v1/invites/{code}/join` | Đã đăng nhập | `{ status: joined\|pending\|member, conversationId?, title? }`; 400 nếu link invalid/expired |
| DELETE | `/api/v1/invites/{code}/join` | Đã đăng nhập | Rút yêu cầu của chính mình (idempotent) |
| GET | `/api/v1/conversations/{id}/join-requests` | Quản trị nhóm | `[{ contactId, name, avatar, requestedTime }]` |
| PUT | `/api/v1/conversations/{id}/join-requests/{contactId}?approved=` | Quản trị nhóm | Duyệt/từ chối; 400 nếu yêu cầu không tồn tại |

Realtime: event mới `JoinRequestUpdated` (payload `{ conversationId }`) gửi cho quản trị/người xin để refresh hàng chờ + notification. Thành viên mới vào nhóm đi qua event `NewMembers` sẵn có — từ 2026-07-17 payload mang **snapshot đầy đủ member active** (vai trò quản trị, mốc đã-đọc, biệt danh) + theme hội thoại + system message, để client người vừa join dựng thẻ hội thoại hoàn chỉnh không cần gọi lại danh sách hội thoại (payload cũ in-flight chỉ có member mới → client tự fallback hành vi cũ). Từ 2026-07-13: luồng vào thẳng bằng link gửi thêm event `MemberJoinedByLink` (payload `{ conversationId, title, actorName, actorAvatar }`) cho quản trị — FE hiện banner + refresh badge notification/hàng chờ. Refactor 2026-07-13: với luồng "bấm Join" (cả pending lẫn vào thẳng), notification bền + FCM cho quản trị chuyển sang xử lý bất đồng bộ ở consumer — event name/payload không đổi (xem `TACH_THONG_BAO_LINK_MOI.md`).

## 8. Dữ liệu (mức khái niệm)

- Hội thoại nhóm có thêm: **link mời hiện tại** (mã, cấu hình duyệt, thời hạn, người tạo) và **danh sách yêu cầu tham gia đang chờ** (người xin + thời điểm).
- Bản ghi cũ thiếu field → mặc định không có link/không có yêu cầu, **không cần migration**.
- Thông báo (notification) dùng loại nguồn mới `join_request`; từ 2026-07-13 thêm loại `member_joined`
  (người vào thẳng bằng link → báo quản trị). Bản ghi cũ không ảnh hưởng, không cần migration.

## 9. Deployment notes

1. Deploy backend (API + consumer chung một service hiện tại) — không cần migration.
2. Build/deploy frontend (`pnpm build` — có dependency mới `react-qr-code`, cần `pnpm install`).
3. Không có config mới. Rollback: thu hồi link các nhóm (hoặc revert deploy) — dữ liệu mới chỉ là field phụ trên document hội thoại, version cũ bỏ qua (ignore extra elements).

## 10. Rollback nghiệp vụ

- Tắt nhanh: quản trị thu hồi link từng nhóm.
- Revert code: bản cũ không đọc field mới (bị bỏ qua khi deserialize) — không vỡ dữ liệu.
