# Tính năng Phase 2 — Làm cuộc trò chuyện sinh động hơn

> **Cập nhật:** 2026-07-05 · **Nguồn kế hoạch:** [`KE_HOACH_PHASE_2_SINH_DONG.md`](./KE_HOACH_PHASE_2_SINH_DONG.md)
> Tài liệu mô tả **hành vi nghiệp vụ** các tính năng Phase 2 đã triển khai. Không mô tả chi tiết kỹ thuật.

---

## Mục đích

Làm cuộc trò chuyện phong phú và biểu cảm hơn: gửi nhãn dán, ảnh động, tạo bình chọn, chia sẻ danh bạ, dịch tin nhắn xuyên ngôn ngữ và xem trước liên kết.

## Phạm vi triển khai theo đợt

Kế hoạch Phase 2 chia thành các đợt. Tình trạng triển khai:

| Đợt | Tính năng | Trạng thái |
| --- | --- | --- |
| **Đợt 1** | Sticker | ✅ Hoàn thành |
| **Đợt 1** | GIF | ✅ Hoàn thành (chỉ upload .gif) |
| **Đợt 2** | Preview Link | ✅ Hoàn thành |
| **Đợt 2** | Tin nhắn thoại | ⏭️ Chưa triển khai (ngoài phạm vi lần này) |
| **Đợt 3** | Bình chọn (Poll) | ✅ Hoàn thành |
| **Đợt 3** | Chia sẻ danh bạ | ✅ Hoàn thành |
| **Đợt 4** | Dịch tin nhắn | ✅ Hoàn thành |

> Tin nhắn thoại (Đợt 2) được giữ nguyên trong kế hoạch, chỉ chưa thực hiện trong lần triển khai này.

---

## 1. Sticker (Nhãn dán)

- **Mục đích:** biểu đạt cảm xúc phong phú hơn emoji.
- **Luồng sử dụng:** mở bảng nhãn dán từ thanh công cụ ô soạn → chọn một nhãn dán → gửi ngay lập tức như một tin nhắn riêng.
- **Hành vi:**
  - Nhãn dán hiển thị nổi bật, **không bọc trong bong bóng** như văn bản; nhãn dán có **hiệu ứng động** (nhấp nháy, nảy, tim đập, rơi nước mắt…).
  - Có mục **"Gần đây"** liệt kê các nhãn dán vừa dùng để chọn nhanh (giới hạn số lượng, lưu cục bộ theo thiết bị).
  - Xem trước danh sách hội thoại hiển thị nhãn "[Nhãn dán]" cho tin nhãn dán.
  - **Realtime:** người nhận thấy nhãn dán **hiển thị ngay** khi tin tới, không cần tải lại trang.
- **Input:** nhãn dán được chọn. **Output:** tin nhắn nhãn dán trong hội thoại.
- **Trường hợp đặc biệt:** nhãn dán không tải được → hiển thị biểu tượng thay thế.
- **Hạn chế:** giai đoạn đầu chỉ dùng bộ nhãn dán có sẵn, chưa cho người dùng tự tải lên.

## 2. GIF

- **Mục đích:** gửi ảnh động biểu cảm.
- **Luồng sử dụng:** chọn nút GIF trên thanh công cụ → mở **bảng chọn GIF từ nguồn sẵn** → (có thể lọc theo từ khóa) → chọn một GIF → gửi.
- **Hành vi:** GIF gửi như một tin nhắn riêng và **tự phát (động)** trong hội thoại; hiển thị nổi bật không bọc bong bóng. Người nhận thấy GIF **hiển thị ngay** khi tin tới, không cần tải lại trang.
- **Input:** GIF được chọn từ danh sách. **Output:** tin nhắn GIF động.
- **Quy tắc:** người dùng **chọn từ bộ GIF sẵn có** (không tự tải lên); danh sách nguồn có thể mở rộng.
- **Hạn chế:** giai đoạn đầu dùng bộ GIF tuyển chọn cố định, chưa tìm kiếm toàn kho GIF ngoài.

## 3. Bình chọn (Poll)

- **Mục đích:** ra quyết định nhóm nhanh.
- **Luồng sử dụng:** mở "Tạo bình chọn" từ thanh công cụ → nhập câu hỏi + các lựa chọn → (tùy chọn) cho phép chọn nhiều → tạo. Bình chọn xuất hiện như một tin nhắn; thành viên bấm để bỏ phiếu.
- **Hành vi:**
  - Hiển thị câu hỏi, danh sách lựa chọn kèm **số phiếu và tỷ lệ phần trăm**, đánh dấu lựa chọn của mình.
  - **Chọn một:** bỏ phiếu là độc quyền — chọn lựa chọn khác sẽ chuyển phiếu.
  - **Chọn nhiều:** bấm để bật/tắt phiếu ở từng lựa chọn.
  - **Người tạo** có thể **đóng bình chọn**; khi đã đóng thì không bỏ phiếu được nữa.
- **Input:** câu hỏi + lựa chọn + phiếu bầu. **Output:** kết quả bình chọn cập nhật.
- **Quy tắc validate:** câu hỏi không rỗng; tối thiểu 2 lựa chọn; mỗi lựa chọn có nội dung; chỉ người tạo được đóng.
- **Trường hợp đặc biệt:** poll đã đóng → mọi thao tác bỏ phiếu bị bỏ qua; phiếu bầu được giữ chính xác kể cả khi nhiều người bỏ phiếu cùng lúc.
- **Đồng bộ:** kết quả bỏ phiếu và trạng thái đóng bình chọn được **cập nhật theo thời gian thực** cho mọi thành viên đang xem hội thoại; kết quả cũng **được giữ nguyên khi tải lại** trang hoặc đăng nhập lại (không còn mất phiếu sau reload).
- **Menu chức năng:** tin bình chọn **không hiển thị menu chức năng** (trả lời/chuyển tiếp/ghim/xóa/sao chép); mọi thao tác nằm trong chính thẻ bình chọn (bỏ phiếu, đóng bình chọn).
- **Hiển thị:** các lựa chọn có viền rõ ràng ở **cả chế độ sáng và tối**.
- **Hạn chế:** bình chọn ẩn danh thuộc phạm vi Phase 5.

## 4. Chia sẻ danh bạ (Contact card)

- **Mục đích:** giới thiệu/chuyển thông tin liên hệ nhanh.
- **Luồng sử dụng:** mở "Chia sẻ danh bạ" từ thanh công cụ → chọn một người bạn → gửi thẻ liên hệ vào hội thoại.
- **Hành vi:** thẻ hiển thị ảnh đại diện + tên của liên hệ được chia sẻ, kèm nhãn "Danh bạ được chia sẻ" (trình bày gọn trên một dòng). Menu chức năng của tin **không có thao tác sao chép** (nội dung thẻ không phải văn bản để sao chép).
- **Input:** liên hệ được chọn. **Output:** thẻ danh bạ trong hội thoại; xem trước danh sách hội thoại hiển thị "[Danh bạ] {tên}".
- **Quy tắc:** chỉ chia sẻ liên hệ trong danh sách bạn bè.
- **Hạn chế:** mở trò chuyện trực tiếp ngay từ thẻ là hạn chế đã biết của giai đoạn hiện tại.

## 5. Dịch tin nhắn (Translate)

- **Mục đích:** giao tiếp xuyên ngôn ngữ.
- **Luồng sử dụng:** mở menu của một tin văn bản → chọn "Dịch" → bản dịch hiển thị ngay bên dưới tin.
- **Hành vi:**
  - **Tự nhận diện ngôn ngữ nguồn**, dịch sang ngôn ngữ đích (mặc định tiếng Việt).
  - Bản dịch là **lớp phủ**: giữ nguyên bản gốc, chỉ hiển thị thêm; có thể **ẩn bản dịch**.
  - Chọn "Dịch" lần nữa sau khi đã dịch → bật/tắt hiển thị mà không gọi lại.
- **Input:** tin văn bản cần dịch. **Output:** bản dịch hiển thị kèm tin.
- **Quy tắc:** chỉ áp dụng cho tin **văn bản có nội dung** (bỏ qua nhãn dán, ảnh, bình chọn, thẻ danh bạ).
- **Trường hợp đặc biệt:** dịch thất bại (lỗi mạng/dịch vụ) → báo lỗi, không phá vỡ luồng chat; nội dung rỗng → không dịch.
- **Hạn chế:** chất lượng phụ thuộc dịch vụ dịch; ngôn ngữ đích mặc định là tiếng Việt.

## 6. Preview Link (Xem trước liên kết)

- **Mục đích:** hiển thị liên kết trực quan (ảnh, tiêu đề, mô tả, tên miền) thay vì URL trần.
- **Luồng sử dụng:** gửi tin văn bản có chứa liên kết như bình thường → tin hiển thị **ngay lập tức** → thẻ xem trước được **bổ sung tự động** bên dưới tin sau khi hệ thống lấy xong dữ liệu (thường vài giây).
- **Hành vi:**
  - Thẻ hiển thị **ảnh đại diện, tiêu đề, mô tả ngắn và tên miền** của trang. Nhấn vào thẻ → mở liên kết ở tab mới.
  - **Không chặn việc gửi tin:** việc lấy dữ liệu xem trước diễn ra ngầm, không làm chậm thao tác gửi.
  - **Realtime:** mọi người trong hội thoại thấy thẻ **xuất hiện ngay** khi có, không cần tải lại trang.
  - **Bền vững:** thẻ được **lấy một lần và lưu lại** → tải lại trang hoặc đăng nhập lại vẫn hiển thị, không lấy lại.
- **Input:** liên kết trong nội dung tin văn bản. **Output:** thẻ xem trước đính kèm dưới tin.
- **Quy tắc:**
  - Chỉ áp dụng cho **tin văn bản** (bỏ qua nhãn dán, GIF, bình chọn, thẻ danh bạ).
  - Chỉ xử lý **liên kết web hợp lệ**; nếu tin có nhiều liên kết → **ưu tiên liên kết đầu tiên**.
- **Trường hợp đặc biệt:**
  - Trang chặn / không có dữ liệu xem trước → **hiển thị liên kết thường**, không có thẻ.
  - Ảnh xem trước lỗi tải → **tự ẩn ảnh**, thẻ vẫn hiển thị tiêu đề/mô tả/tên miền.
  - Liên kết trỏ tới địa chỉ nội bộ/không an toàn → **bị bỏ qua** (không sinh thẻ) để bảo vệ hệ thống.
- **Hạn chế:** chất lượng thẻ phụ thuộc dữ liệu trang cung cấp; một số trang không hỗ trợ xem trước.

---

## Ghi chú chung

- Sticker, GIF, bình chọn và thẻ danh bạ đều hiển thị realtime khi có tin mới đến — **hiển thị ngay** trên máy người nhận, không cần tải lại trang.
- Thẻ xem trước liên kết được sinh **ngầm sau khi gửi** (không chặn thao tác gửi) và **cập nhật realtime** cho mọi người trong hội thoại; giữ nguyên khi tải lại trang.
- Xem trước tin cuối ở danh sách hội thoại được chuẩn hóa theo loại tin: nhãn dán, bình chọn, danh bạ đều có nhãn riêng dễ đọc.

## Tổng kết đợt hoàn thiện (2026-07-05)

Các điều chỉnh nghiệp vụ/UX đã thực hiện để chốt Phase 2:

| Hạng mục | Nội dung |
| --- | --- |
| Bình chọn — đồng bộ realtime | Phiếu bầu và trạng thái đóng bình chọn cập nhật **tức thời** cho mọi thành viên; **giữ nguyên khi tải lại / đăng nhập lại** (trước đây mất phiếu sau reload). |
| GIF & Nhãn dán — realtime | Người nhận thấy GIF/nhãn dán **hiển thị ngay**, không còn phải tải lại trang mới thấy (trước đây hiện ô trống). |
| Bình chọn — menu | Ẩn toàn bộ menu chức năng trên tin bình chọn; thao tác gói gọn trong thẻ. |
| Thẻ danh bạ — menu | Bỏ thao tác **sao chép** (nội dung thẻ không phải văn bản). |
| Thẻ danh bạ — bố cục | Sửa lệch dòng nhãn "Danh bạ được chia sẻ" → trình bày gọn một dòng. |
| Bình chọn — dark mode | Tăng độ tương phản viền lựa chọn để rõ ở chế độ tối. |

> Các tính năng Đợt 2 (Tin nhắn thoại, Preview Link) vẫn giữ trong kế hoạch, chưa triển khai trong lần này.
