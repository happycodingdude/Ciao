# Product Roadmap

## Định hướng sản phẩm

Ứng dụng nhắn tin hướng tới **kết nối mọi người**, không tập trung vào cộng tác doanh nghiệp.

### Mục tiêu

- Tăng kết nối giữa người dùng.
- Giúp cuộc trò chuyện tự nhiên và thú vị hơn.
- Ưu tiên trải nghiệm chat trước các tính năng mở rộng.
- Mọi tính năng mới đều phải mang lại giá trị rõ ràng cho người dùng.

---

# Roadmap

| Phase       | Mục tiêu                                      | Ưu tiên    |
| ----------- | --------------------------------------------- | ---------- |
| **Phase 1** | Hoàn thiện trải nghiệm chat cốt lõi           | ⭐⭐⭐⭐⭐ |
| **Phase 2** | Làm cuộc trò chuyện sinh động hơn             | ⭐⭐⭐⭐⭐ |
| **Phase 3** | Tăng tương tác và cá nhân hóa cuộc trò chuyện | ⭐⭐⭐⭐☆  |
| **Phase 4** | Cá nhân hóa và giữ chân người dùng            | ⭐⭐⭐⭐☆  |
| **Phase 5** | Nâng cao trải nghiệm nhóm và cộng đồng        | ⭐⭐⭐☆☆   |
| **Phase 6** | AI hỗ trợ trò chuyện                          | ⭐⭐⭐☆☆   |

> **Chú thích trạng thái:** ✅ Hoàn thành · 🟡 Một phần · ⬜ Chưa làm
> _(Cập nhật ngày 2026-07-06 dựa trên rà soát thực tế codebase FE + BE + file kế hoạch từng Phase)_

---

# Phase 1 - Hoàn thiện trải nghiệm chat cốt lõi

| STT | Tính năng            | Mô tả                                      |  Ưu tiên   | Trạng thái |
| --: | -------------------- | ------------------------------------------ | :--------: | ---------- |
|   1 | Trạng thái tin nhắn  | Sending / Sent / Delivered / Seen / Failed | ⭐⭐⭐⭐⭐ | ✅ Hoàn thành |
|   2 | Đang nhập            | Hiển thị người đang nhập                   | ⭐⭐⭐⭐⭐ | ⬜ Chưa làm (hoãn — chờ chốt hạ tầng realtime, xem kế hoạch Phase 1) |
|   3 | Reaction             | Thả emoji cho tin nhắn                     | ⭐⭐⭐⭐⭐ | ✅ Hoàn thành |
|   4 | Chỉnh sửa tin nhắn   | Edit message                               | ⭐⭐⭐⭐⭐ | ✅ Hoàn thành |
|   5 | Xóa tin nhắn         | Delete for everyone (Delete for me: bỏ theo yêu cầu) | ⭐⭐⭐⭐⭐ | ✅ Hoàn thành (thu hồi cho mọi người) |
|   6 | Gửi lại tin nhắn lỗi | Retry failed message                       | ⭐⭐⭐⭐⭐ | ✅ Hoàn thành |
|   7 | Draft                | Lưu nội dung đang nhập                     | ⭐⭐⭐⭐⭐ | ✅ Hoàn thành |
|   8 | New Message Divider  | Đánh dấu vị trí tin nhắn chưa đọc          | ⭐⭐⭐⭐⭐ | ✅ Hoàn thành |
|   9 | Scroll to Latest     | Nút quay về tin nhắn mới nhất              | ⭐⭐⭐⭐⭐ | ✅ Hoàn thành |
|  10 | Highlight Mention    | Làm nổi bật @mention                       | ⭐⭐⭐⭐☆  | ✅ Hoàn thành |

> 📄 **Kế hoạch triển khai các tính năng chưa xong:** [`KE_HOACH_PHASE_1_CHAT_COT_LOI.md`](./KE_HOACH_PHASE_1_CHAT_COT_LOI.md)

---

# Phase 2 - Làm cuộc trò chuyện sinh động hơn

| STT | Tính năng       | Mô tả                            |  Ưu tiên   | Trạng thái |
| --: | --------------- | -------------------------------- | :--------: | ---------- |
|   1 | Sticker         | Bộ sticker và sticker yêu thích  | ⭐⭐⭐⭐⭐ | ✅ Hoàn thành (bộ built-in động + gần đây) |
|   2 | GIF             | Gửi GIF                          | ⭐⭐⭐⭐⭐ | ✅ Hoàn thành (chọn từ nguồn GIF sẵn) |
|   3 | Tin nhắn thoại  | Ghi âm, waveform, playback       | ⭐⭐⭐⭐⭐ | ⬜ Chưa làm |
|   4 | Preview Link    | Thumbnail, tiêu đề, mô tả        | ⭐⭐⭐⭐⭐ | ✅ Hoàn thành (thẻ xem trước realtime, SSRF-safe) |
|   5 | Album ảnh       | Gom nhiều ảnh thành album        | ⭐⭐⭐⭐⭐ | ✅ Hoàn thành (grid nhiều ảnh) |
|   6 | Trình xem ảnh   | Zoom, swipe, fullscreen          | ⭐⭐⭐⭐⭐ | ✅ Hoàn thành |
|   7 | Bình chọn       | Poll trong cuộc trò chuyện       | ⭐⭐⭐⭐☆  | ✅ Hoàn thành (tạo/bỏ phiếu/đóng; realtime tally chờ Phase sau) |
|   8 | Chia sẻ danh bạ | Contact card                     | ⭐⭐⭐⭐☆  | ✅ Hoàn thành (gửi thẻ liên hệ) |
|   9 | Dịch tin nhắn   | Translate message                |  ⭐⭐⭐☆☆  | ✅ Hoàn thành (dịch tự nhận diện ngôn ngữ) |

> 📄 **Kế hoạch triển khai các tính năng chưa xong:** [`KE_HOACH_PHASE_2_SINH_DONG.md`](./KE_HOACH_PHASE_2_SINH_DONG.md)

---

# Phase 3 - Tăng tương tác và cá nhân hóa cuộc trò chuyện

| STT | Tính năng            | Mô tả                               |  Ưu tiên   | Trạng thái |
| --: | -------------------- | ----------------------------------- | :--------: | ---------- |
|   1 | Ghim nhiều tin nhắn  | Multiple pinned messages            | ⭐⭐⭐⭐⭐ | ✅ Hoàn thành (pin/unpin nhiều tin + badge) |
|   2 | Bookmark             | Lưu tin nhắn cho riêng mình         | ⭐⭐⭐⭐⭐ | ✅ Hoàn thành (nghiệm thu 2026-07-11) — menu lưu tin + trang `/saved` + panel trong hội thoại |
|   3 | Ghim cuộc trò chuyện | Pin/Favorite conversation           | ⭐⭐⭐⭐⭐ | ✅ Hoàn thành (nghiệm thu 2026-07-11) |
|   4 | Media                | Phân loại Ảnh / Video / File / Link | ⭐⭐⭐⭐⭐ | ✅ Hoàn thành (nghiệm thu 2026-07-11) — 4 section preview + 4 tab ([chi tiết](./MEDIA_TABS_REDESIGN.md)) |
|   5 | Đổi hình nền chat    | Wallpaper theo cuộc trò chuyện      | ⭐⭐⭐⭐☆  | ⬜ Chưa làm |
|   6 | Theme chat           | Đổi màu bong bóng chat              | ⭐⭐⭐⭐☆  | ⬜ Chưa làm |
|   7 | Đặt biệt danh        | Nickname trong nhóm                 | ⭐⭐⭐⭐☆  | ⬜ Chưa làm |
|   8 | Trạng thái hoạt động | Online / Offline / Idle / Invisible | ⭐⭐⭐⭐☆  | ⏸️ Bỏ khỏi phạm vi Phase 3 (2026-07-09, theo yêu cầu) — giữ Online/Offline hiện có |
|   9 | Lần hoạt động cuối   | Last Seen                           |  ⭐⭐⭐☆☆  | 🟡 Một phần (có setting + thời điểm đã đọc; chưa hiển thị "online lần cuối") |
|  10 | Đã xem bởi           | Read by                             |  ⭐⭐⭐☆☆  | ✅ Hoàn thành (avatar người đã xem) |

> 📄 **Kế hoạch triển khai các tính năng chưa xong:** [`KE_HOACH_PHASE_3_CA_NHAN_HOA.md`](./KE_HOACH_PHASE_3_CA_NHAN_HOA.md)

---

# Phase 4 - Cá nhân hóa và giữ chân người dùng

| STT | Tính năng          | Mô tả                       |  Ưu tiên  | Trạng thái |
| --: | ------------------ | --------------------------- | :-------: | ---------- |
|   1 | Emoji động         | Animated Emoji              | ⭐⭐⭐⭐☆ | ⬜ Chưa làm |
|   2 | Emoji cỡ lớn       | Big Emoji                   | ⭐⭐⭐⭐☆ | ⬜ Chưa làm |
|   3 | Hiệu ứng tin nhắn  | Fireworks, Hearts, Confetti | ⭐⭐⭐☆☆  | ⬜ Chưa làm |
|   4 | Khung avatar       | Avatar Frame                | ⭐⭐⭐☆☆  | ⬜ Chưa làm |
|   5 | Theme hệ thống     | Light / Dark / Gradient     | ⭐⭐⭐☆☆  | 🟡 Một phần (Light/Dark xong; chưa có Gradient) |
|   6 | Âm thanh thông báo | Notification Sound          | ⭐⭐⭐☆☆  | ✅ Hoàn thành |
|   7 | Hiệu ứng sinh nhật | Birthday Effect             |  ⭐⭐☆☆☆  | ⬜ Chưa làm |
|   8 | Chat Streak        | Chuỗi ngày trò chuyện       |  ⭐⭐☆☆☆  | ⬜ Chưa làm |
|   9 | Memories           | Hôm nay năm ngoái           |  ⭐⭐☆☆☆  | ⬜ Chưa làm |

> 📄 **Kế hoạch triển khai các tính năng chưa xong:** [`KE_HOACH_PHASE_4_GIU_CHAN.md`](./KE_HOACH_PHASE_4_GIU_CHAN.md)

---

# Phase 5 - Nâng cao trải nghiệm nhóm và cộng đồng

| STT | Tính năng           | Mô tả                 |  Ưu tiên   | Trạng thái |
| --: | ------------------- | --------------------- | :--------: | ---------- |
|   1 | Thông báo nhóm      | Group Announcement    | ⭐⭐⭐⭐⭐ | ⬜ Chưa làm |
|   2 | Sự kiện             | Event & RSVP          | ⭐⭐⭐⭐☆  | ⬜ Chưa làm |
|   3 | Link mời            | Invite Link & QR Code | ⭐⭐⭐⭐☆  | ⬜ Chưa làm |
|   4 | Yêu cầu tham gia    | Join Request          | ⭐⭐⭐⭐☆  | ⬜ Chưa làm |
|   5 | Phân quyền quản trị | Admin Permission      |  ⭐⭐⭐☆☆  | 🟡 Một phần (có vai trò moderator/Admin + recall theo quyền; chưa có UI bổ nhiệm/thu hồi) |
|   6 | Bình chọn ẩn danh   | Anonymous Poll        |  ⭐⭐⭐☆☆  | ⬜ Chưa làm |
|   7 | Thread              | Thảo luận theo nhánh  |  ⭐⭐☆☆☆   | ⬜ Chưa làm |

> 📄 **Kế hoạch triển khai các tính năng chưa xong:** [`KE_HOACH_PHASE_5_NHOM_CONG_DONG.md`](./KE_HOACH_PHASE_5_NHOM_CONG_DONG.md)

---

# Phase 6 - AI hỗ trợ trò chuyện

| STT | Tính năng      | Mô tả                   |  Ưu tiên  | Trạng thái |
| --: | -------------- | ----------------------- | :-------: | ---------- |
|   1 | AI Summary     | Tóm tắt cuộc trò chuyện | ⭐⭐⭐⭐☆ | ⬜ Chưa làm |
|   2 | AI Catch Up    | Tóm tắt tin nhắn bỏ lỡ  | ⭐⭐⭐⭐☆ | ⬜ Chưa làm |
|   3 | AI Smart Reply | Gợi ý trả lời           | ⭐⭐⭐☆☆  | ⬜ Chưa làm |
|   4 | AI Translation | Dịch bằng AI            | ⭐⭐⭐☆☆  | ⬜ Chưa làm |
|   5 | AI Search      | Tìm kiếm theo ngữ nghĩa | ⭐⭐⭐☆☆  | ⬜ Chưa làm |
|   6 | AI Caption     | Sinh caption cho ảnh    |  ⭐⭐☆☆☆  | ⬜ Chưa làm |
|   7 | AI Sticker     | Sinh sticker từ mô tả   |  ⭐⭐☆☆☆  | ⬜ Chưa làm |

> 📄 **Kế hoạch triển khai các tính năng chưa xong:** [`KE_HOACH_PHASE_6_AI.md`](./KE_HOACH_PHASE_6_AI.md)

---

# Backlog

| Tính năng        | Lý do chưa ưu tiên                      |
| ---------------- | --------------------------------------- |
| Story            | Chưa phù hợp định hướng hiện tại        |
| Status           | Giá trị sử dụng chưa cao                |
| Timeline         | Không đúng định hướng sản phẩm          |
| Livestream       | Chi phí phát triển lớn                  |
| Voice Room       | Chỉ phù hợp khi cộng đồng đủ lớn        |
| Mini Game        | Không phải tính năng cốt lõi            |
| Mini App         | Chưa cần ở giai đoạn hiện tại           |
| Marketplace      | Ngoài phạm vi sản phẩm                  |
| Ví điện tử       | Không phải mục tiêu sản phẩm            |
| Thanh toán       | Không phải tính năng cốt lõi            |
| Official Account | Chỉ phát triển khi mở rộng hệ sinh thái |
| Kênh công khai   | Chưa ưu tiên                            |
| Video ngắn       | Không đúng định hướng sản phẩm          |
