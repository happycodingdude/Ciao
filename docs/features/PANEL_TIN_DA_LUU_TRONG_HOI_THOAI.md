# Panel "Tin nhắn đã lưu" trong hội thoại

## Mục đích

Cho phép người dùng xem lại danh sách tin nhắn đã lưu (bookmark) ngay trong khung chat của một hội thoại, tìm kiếm trong danh sách đó và nhảy nhanh đến tin nhắn gốc — tương tự trải nghiệm tìm kiếm tin nhắn hiện có.

## Phạm vi

- Chỉ hiển thị tin đã lưu **của chính người dùng** trong **hội thoại đang mở**.
- Không thay đổi trang "Tin đã lưu" toàn cục hiện có.
- Không thay đổi hành vi lưu / bỏ lưu tin nhắn.

## Các giai đoạn thực hiện

| Phase | Mục tiêu | Trạng thái |
|---|---|---|
| 1 | Bổ sung khả năng truy vấn danh sách tin đã lưu theo hội thoại, hỗ trợ lọc theo từ khóa | ✅ Hoàn thành |
| 2 | Thêm nút mở panel ở header khung chat, kế bên nút tìm kiếm | ✅ Hoàn thành |
| 3 | Xây dựng panel danh sách tin đã lưu: ô tìm kiếm + danh sách, đồng bộ giao diện với panel tìm kiếm tin nhắn | ✅ Hoàn thành |
| 4 | Nhảy đến tin nhắn gốc khi bấm vào một mục trong danh sách | ✅ Hoàn thành |
| 5 | Nghiệm thu trên ứng dụng đang chạy (mở panel, lọc, tìm server, nhảy tin) | ✅ Hoàn thành |
| 6 | Chuẩn hóa việc tải dữ liệu của panel: loại bỏ lượt tải thừa khi vào/đổi hội thoại và lượt tải bị nhân đôi khi tải lại trang | ✅ Hoàn thành |

## Hành vi nghiệp vụ

### Mở panel

- Header khung chat có thêm biểu tượng "Tin đã lưu" đặt kế bên biểu tượng kính lúp.
- Bấm biểu tượng: mở panel ở sidebar phải (thay thế panel đang mở nếu có); bấm lại để đóng.
- Mỗi lần mở panel: ô tìm kiếm được xóa trắng, hệ thống tải danh sách tin đã lưu của hội thoại (mới lưu trước) và tự focus vào ô tìm kiếm.

### Quy tắc tải dữ liệu (Phase 6)

Danh sách tin đã lưu chỉ được tải khi panel thực sự cần hiển thị, mỗi tình huống đúng **một** lượt tải:

| Tình huống | Số lượt tải |
|---|---|
| Vào hội thoại, panel đang đóng | 0 |
| Mở panel bằng tay | 1 |
| Tải lại trang khi panel đang mở (panel được khôi phục) | 1 |
| Chuyển sang hội thoại khác khi panel đang mở | 0 (panel quay về Thông tin) |

- Mỗi lần mở panel đều lấy dữ liệu mới nhất; nếu đã có dữ liệu của lần xem trước thì hiển thị ngay và làm mới ngầm phía sau.
- Sau khi lưu / bỏ lưu một tin nhắn, lần mở panel kế tiếp phản ánh đúng thay đổi (không tải lại ngay lúc panel đang đóng).

### Tìm kiếm trong tin đã lưu

- Khi nhập ký tự: lọc ngay trong danh sách đã tải (không phân biệt hoa thường, theo nội dung tin).
- Nếu danh sách đã tải **không có** kết quả khớp: hệ thống tự động tìm phía máy chủ theo từ khóa (có độ trễ ngắn để tránh gọi liên tục khi đang gõ).
- Xóa trắng ô tìm kiếm: hiển thị lại toàn bộ danh sách đã tải ban đầu.
- Từ khóa khớp được tô sáng trong nội dung tin; tên được nhắc đến (mention) hiển thị đúng định dạng.

### Nhảy đến tin nhắn

- Bấm vào một mục: khung chat cuộn đến đúng tin nhắn đó và làm nổi bật, kể cả khi tin nằm ở trang cũ chưa tải (cùng cơ chế với tìm kiếm tin nhắn).
- Panel vẫn mở sau khi bấm, để tiếp tục chọn mục khác.
- **Trong lúc đang nhảy tới tin** (tin cũ phải tải thêm nhiều trang): mọi click tiếp theo vào các mục trong danh sách bị bỏ qua cho tới khi thao tác nhảy hoàn tất — con trỏ chuyển dạng chờ. Quy tắc áp dụng chung cho cả 3 danh sách: Tìm kiếm / Tin đã ghim / Tin đã lưu.

## Input / Output

- Input: hội thoại đang mở; từ khóa tìm kiếm (tùy chọn).
- Output: danh sách tin đã lưu gồm người gửi (tên, ảnh đại diện), nội dung, thời gian; sắp xếp mới lưu trước.

## Quy tắc validate

- Chỉ trả về tin đã lưu thuộc về người dùng đang đăng nhập trong hội thoại được yêu cầu.
- Từ khóa rỗng khi tìm phía máy chủ → trả về toàn bộ danh sách của hội thoại.

## Trường hợp đặc biệt

- Tin gốc đã bị thu hồi hoặc không còn: mục vẫn hiển thị với nhãn "Message unavailable", mờ đi và **không** bấm nhảy được; khi tìm theo từ khóa phía máy chủ, các mục này bị loại (không còn nội dung để so khớp).
- Kết quả tìm phía máy chủ về muộn (người dùng đã gõ từ khóa khác): kết quả cũ bị bỏ qua, chỉ hiển thị kết quả của từ khóa mới nhất.
- Bộ gõ tiếng Việt: việc lọc diễn ra theo từng thay đổi nội dung ô nhập, không phụ thuộc phím Enter.
- Chuyển sang hội thoại khác: sidebar phải quay về panel Thông tin (hành vi chung của các panel). Khi đó **không** tải danh sách tin đã lưu của hội thoại mới — dữ liệu chỉ được tải khi người dùng thực sự mở panel.

## Hạn chế

- Danh sách tải một lần toàn bộ tin đã lưu của hội thoại (không phân trang) — phù hợp với số lượng bookmark per-hội-thoại thông thường.
- Nội dung tin được đọc trực tiếp tại thời điểm xem nên phản ánh chỉnh sửa/thu hồi mới nhất; tin dạng không phải văn bản chỉ hiển thị phần nội dung văn bản (nếu có).
