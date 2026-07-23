# Fix: `/pins` và `/bookmarks` không được gọi ở một số hội thoại

## Hiện tượng
Khi mở hội thoại, trạng thái ghim (pin) và đã lưu (bookmark) hiển thị inline trên từng tin
được nạp qua hai API lấy danh sách id, gọi EAGER ngay khi vào hội thoại:
- `/pins` — id các tin đã ghim của hội thoại
- `/bookmarks` — id các tin đã lưu của user trong hội thoại

Có hội thoại gọi đủ hai API, **một vài hội thoại lại không gọi** → badge/trạng thái ghim, đã lưu
trên tin nhắn (và trong menu tin nhắn) bị sai hoặc trống ở những hội thoại đó.

## Nguyên nhân gốc
Hai API này lẽ ra phải được gọi "khi vào hội thoại", nhưng thực tế lại được gắn vào **việc render
từng tin nhắn**: query chỉ chạy khi component tin nhắn (nội dung tin + menu tin) được mount.

Điều đó dẫn tới các hội thoại KHÔNG có tin nhắn nào đủ điều kiện mount thì KHÔNG có component nào
kích hoạt fetch → không gọi API. Các trường hợp thực tế (đúng là "một vài hội thoại"):

1. **Hội thoại chỉ toàn tin hệ thống** — ví dụ nhóm vừa tạo, hoặc nhóm vào/rời qua link chỉ có các
   dòng "đã tạo nhóm", "A đã tham gia", "B đã rời". Tin hệ thống hiển thị dạng nhãn ở giữa, KHÔNG
   đi qua component tin nhắn thường → không mount query.
2. **Hội thoại chưa có tin nào** (rỗng), hoặc tin thật đang bị ẩn sau mốc "n tin nhắn mới" khiến
   phần đang hiển thị chỉ còn tin hệ thống.
3. **Menu tin nhắn (nơi duy nhất nạp `/bookmarks`) không render** cho tin đang thu hồi (recalled),
   tin bình chọn (poll), tin đang gửi/gửi lỗi → nếu các tin đang hiển thị đều thuộc nhóm này thì
   `/bookmarks` không được gọi.

Ngoài ra còn một nguyên nhân phụ đã xử lý trước đó: conversationId truyền xuống menu bị lấy từ
**danh sách hội thoại đã tải sẵn** (có phân trang, có thể thiếu hội thoại đang mở) thay vì từ hội
thoại đang mở → có lúc rỗng, làm query bị vô hiệu hoá. Đã đổi sang dùng id của hội thoại đang mở.

## Cách sửa
Chuyển việc nạp EAGER hai danh sách này lên **cấp hội thoại** (nơi luôn tồn tại khi mở hội thoại),
thay vì phụ thuộc vào việc render tin nhắn. Nhờ vậy `/pins` và `/bookmarks` luôn được gọi đúng một
lần khi vào bất kỳ hội thoại nào, bất kể hội thoại đó gồm loại tin gì (kể cả toàn tin hệ thống hay
rỗng). Cơ chế cache gộp trùng theo hội thoại nên các tin nhắn vẫn dùng lại kết quả đã nạp, không
phát sinh request thừa.

Đồng thời giữ nguyên nguồn conversationId tin cậy (hội thoại đang mở) cho menu tin nhắn để badge/
trạng thái đọc đúng dữ liệu.

## Kết quả
- `/pins` và `/bookmarks` được gọi **nhất quán ở mọi hội thoại** (mỗi API 1 request/hội thoại).
- Trạng thái ghim / đã lưu inline hiển thị đúng, kể cả nhóm mới hoặc nhóm chỉ có tin hệ thống.

## Cách kiểm thử
- Mở một **nhóm mới chỉ có tin hệ thống** (vừa tạo, hoặc vừa vào nhóm qua link) → mở DevTools →
  Network → xác nhận có request `/conversations/{id}/pins` và `/conversations/{id}/bookmarks`.
- Mở một hội thoại có tin nhắn bình thường → vẫn chỉ 1 request mỗi API (không gọi lặp theo số tin).

## Hạn chế / ghi chú
- Đây là bug hiển thị/nạp dữ liệu phía client; **không thay đổi API, hợp đồng dữ liệu hay nghiệp vụ**.
- Trường hợp "hội thoại đang mở không nằm trong danh sách đã tải" vẫn có thể ảnh hưởng vài thông
  tin khác lấy từ danh sách (vd. tên/ảnh thành viên trong menu). Đây là vấn đề riêng, ngoài phạm vi
  fix này.
