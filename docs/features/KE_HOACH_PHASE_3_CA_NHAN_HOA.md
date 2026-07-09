# Kế hoạch triển khai — Phase 3: Tăng tương tác và cá nhân hóa cuộc trò chuyện

> **Cập nhật:** 2026-07-09 · **Nguồn:** [`PRODUCT_ROADMAP.md`](./PRODUCT_ROADMAP.md)
> Phạm vi: các tính năng **chưa hoàn thành** của Phase 3 (⬜) và phần còn thiếu của các tính năng 🟡.
> **Điều chỉnh 2026-07-09:** tính năng **Trạng thái hoạt động (Idle / Invisible)** được **bỏ khỏi phạm vi Phase 3** theo yêu cầu — chưa cần ở giai đoạn này, sẽ xem xét lại sau.

---

## 1. Phạm vi

| Tính năng | Trạng thái | Mục tiêu |
| --- | --- | --- |
| Bookmark | ⬜ | Lưu tin nhắn cho riêng mình |
| Ghim cuộc trò chuyện | ⬜ | Ghim/đánh dấu hội thoại lên đầu |
| Media (phân loại) | 🟡 | Tách rõ Ảnh / Video / Tệp / Liên kết |
| Đổi hình nền chat | ⬜ | Hình nền theo từng hội thoại |
| Theme chat | ⬜ | Đổi màu bong bóng chat |
| Đặt biệt danh | ⬜ | Biệt danh thành viên trong nhóm |
| ~~Trạng thái hoạt động~~ | Bỏ khỏi phạm vi | Bỏ theo yêu cầu (2026-07-09) — chưa cần Idle/Invisible |
| Lần hoạt động cuối | 🟡 | Hiển thị "hoạt động lần cuối" |

---

## 2. Các đợt triển khai

| Đợt | Mục tiêu | Rủi ro chính | Phụ thuộc | Rollback |
| --- | --- | --- | --- | --- |
| **Đợt 1** ✅ | Bookmark + Ghim cuộc trò chuyện — **code xong 2026-07-09, chờ verify E2E** | Đồng bộ trạng thái đa thiết bị | Không | Ẩn mục đã lưu / bỏ ghim |
| **Đợt 2** | Media phân loại + Đặt biệt danh | Phân loại sai loại tệp | Kho đính kèm hiện có | Quay lại danh sách gộp |
| **Đợt 3** | Đổi hình nền + Theme chat | Ảnh hưởng độ tương phản/đọc chữ | Hệ theme sáng/tối | Quay về nền/màu mặc định |
| **Đợt 4** | Hoạt động lần cuối (Last Seen) | Quyền riêng tư, chính xác thời điểm | Cơ chế hiện diện online hiện có | Không hiển thị last seen như hiện tại |

> Đợt 4 không còn bao gồm Trạng thái hoạt động (Idle/Invisible) — đã bỏ khỏi phạm vi theo yêu cầu.

---

## 3. Chi tiết nghiệp vụ

### 3.1 Bookmark (Lưu tin nhắn)

- **Mục đích:** lưu lại tin quan trọng để xem sau, riêng tư.
- **Hành vi:** chọn "Lưu" trên một tin → tin vào danh sách đã lưu cá nhân; có trang/mục xem lại và điều hướng về vị trí gốc của tin.
- **Input:** tin cần lưu. **Output:** mục trong danh sách đã lưu.
- **Quy tắc:** bookmark là riêng tư, người khác không thấy; bỏ lưu để gỡ.
- **Trường hợp đặc biệt:** tin gốc bị thu hồi → mục đã lưu hiển thị trạng thái không còn khả dụng.
- **Hạn chế:** giai đoạn đầu chưa hỗ trợ phân nhóm/nhãn cho tin đã lưu.

### 3.2 Ghim cuộc trò chuyện

- **Mục đích:** giữ hội thoại quan trọng luôn ở đầu danh sách.
- **Hành vi:** ghim một hội thoại → luôn nằm nhóm trên cùng; bỏ ghim để trả về thứ tự thường; hỗ trợ ghim nhiều hội thoại.
- **Input:** hội thoại cần ghim. **Output:** hội thoại được sắp lên nhóm ghim.
- **Quy tắc:** giới hạn số hội thoại ghim hợp lý; hội thoại ghim vẫn theo quy tắc chưa đọc/thông báo bình thường.
- **Trường hợp đặc biệt:** hội thoại ghim bị xóa/rời nhóm → tự bỏ khỏi nhóm ghim.
- **Hạn chế:** thứ tự trong nhóm ghim theo hoạt động mới nhất, chưa cho kéo-thả sắp xếp tay.

### 3.3 Media — phân loại Ảnh / Video / Tệp / Liên kết

- **Mục đích:** tra cứu nhanh nội dung đã trao đổi trong hội thoại.
- **Hành vi:** trong phần thông tin hội thoại, tách các mục con: Ảnh, Video, Tệp, Liên kết; mỗi mục liệt kê theo thời gian và mở xem tương ứng.
- **Input:** các đính kèm/liên kết của hội thoại. **Output:** danh sách phân loại theo từng loại.
- **Quy tắc:** phân loại theo bản chất nội dung; liên kết gom từ nội dung tin; hỗ trợ xem tất cả cho từng loại.
- **Trường hợp đặc biệt:** loại không có nội dung → trạng thái rỗng; tệp không hỗ trợ xem trước → hiển thị biểu tượng + tên.
- **Hạn chế:** hiện đã có phần xem đính kèm dạng gộp; phần còn thiếu là tách 4 nhóm rõ ràng.

### 3.4 Đặt biệt danh

- **Mục đích:** cá nhân hóa cách gọi thành viên trong nhóm.
- **Hành vi:** đặt biệt danh cho một thành viên → tên biệt danh hiển thị thay tên gốc trong hội thoại đó; có thể xóa để về tên gốc.
- **Input:** thành viên + biệt danh. **Output:** tên hiển thị theo biệt danh trong phạm vi hội thoại.
- **Quy tắc validate:** giới hạn độ dài; biệt danh chỉ áp dụng trong hội thoại đặt, không đổi tên tài khoản.
- **Trường hợp đặc biệt:** biệt danh rỗng → dùng tên gốc; ai được phép đặt (chỉ mình hay cả nhóm) cần cấu hình rõ.
- **Hạn chế:** phạm vi ban đầu áp dụng cho chat nhóm.

### 3.5 Đổi hình nền chat

- **Mục đích:** cá nhân hóa không gian trò chuyện.
- **Hành vi:** chọn hình nền cho một hội thoại (mẫu có sẵn hoặc ảnh của người dùng); áp dụng riêng cho hội thoại đó.
- **Input:** lựa chọn hình nền. **Output:** nền hội thoại thay đổi.
- **Quy tắc:** phải bảo đảm độ tương phản để chữ vẫn đọc rõ ở cả chế độ sáng/tối; có tùy chọn quay về mặc định.
- **Trường hợp đặc biệt:** ảnh nền quá sáng/tối → áp lớp phủ để giữ khả năng đọc.
- **Hạn chế:** hình nền áp dụng theo phía người đặt; đồng bộ đa thiết bị tùy giai đoạn.

### 3.6 Theme chat (Màu bong bóng)

- **Mục đích:** cá nhân hóa màu sắc hội thoại.
- **Hành vi:** chọn bảng màu cho bong bóng chat của hội thoại; áp dụng cho tin của mình/của người khác theo bộ màu.
- **Input:** bộ màu được chọn. **Output:** bong bóng chat đổi màu.
- **Quy tắc:** màu phải đạt độ tương phản tối thiểu với chữ; đồng bộ với hệ theme sáng/tối hiện có.
- **Trường hợp đặc biệt:** bộ màu không đạt tương phản → chặn hoặc tự điều chỉnh.
- **Hạn chế:** giai đoạn đầu dùng bộ màu định sẵn.

### 3.7 Trạng thái hoạt động — ĐÃ BỎ KHỎI PHẠM VI

- Bỏ theo yêu cầu ngày 2026-07-09: chưa cần bổ sung Idle / Ẩn (Invisible) ở giai đoạn này.
- Hệ thống giữ nguyên hành vi hiện tại: Online/Offline + tùy chọn ẩn trạng thái sẵn có.
- Sẽ xem xét lại khi có nhu cầu thực tế.

### 3.8 Lần hoạt động cuối (Last Seen)

- **Mục đích:** cho biết đối phương hoạt động gần nhất khi nào.
- **Hành vi:** khi ngoại tuyến → hiển thị "hoạt động lần cuối" theo thời gian tương đối; chịu chi phối bởi cài đặt riêng tư "Hiển thị lần hoạt động cuối".
- **Input:** thời điểm rời trạng thái online. **Output:** nhãn "hoạt động lần cuối".
- **Quy tắc:** tắt cài đặt → không hiển thị cho người khác; đang Ẩn → không cập nhật/hiển thị.
- **Trường hợp đặc biệt:** chưa từng có mốc → không hiển thị; đang Online → hiển thị trạng thái online thay vì last seen.
- **Hạn chế:** hiện có cài đặt và dữ liệu "đã đọc", nhưng chưa ghi nhận/hiển thị đúng thời điểm online cuối.

---

## 4. Rủi ro & lưu ý vận hành

- **Hiện diện (Last Seen):** tôn trọng cài đặt riêng tư — tắt "Hiển thị lần hoạt động cuối" hoặc ẩn trạng thái thì không lộ last seen.
- **Theme/Hình nền:** ưu tiên khả năng đọc; luôn có đường lui về mặc định.
- **Bookmark/Ghim:** cần thống nhất phạm vi riêng tư và giới hạn số lượng.

---

## 5. Liên kết

- Roadmap tổng: [`PRODUCT_ROADMAP.md`](./PRODUCT_ROADMAP.md)
- Tiến độ + việc còn lại (Đợt 2–4): [`PHASE3_HANDOFF.md`](./PHASE3_HANDOFF.md)
- Tài liệu Đợt 1 (Ghim hội thoại + Bookmark): [`GHIM_HOI_THOAI_VA_BOOKMARK.md`](./GHIM_HOI_THOAI_VA_BOOKMARK.md)
