# Tìm kiếm tin nhắn

> **Cập nhật 2026-07-23:** nhảy tới tin gốc từ kết quả **không làm thay đổi địa chỉ trang (URL)** — user đã nghiệm thu.

## Mục đích

Cho phép người dùng tìm tin nhắn theo từ khoá trong một hội thoại cụ thể, và đi nhanh tới tin nhắn gốc từ kết quả tìm được.

## Cách mở tìm kiếm

- Bấm biểu tượng tìm kiếm trên thanh tiêu đề của hội thoại, hoặc
- Dùng phím tắt **Ctrl + F** (Windows/Linux) / **Cmd + F** (Mac) khi đang ở trong một hội thoại.

## Luồng sử dụng

1. Nhập từ khoá vào ô tìm kiếm.
2. Nhấn Enter hoặc bấm biểu tượng tìm kiếm để tìm.
3. Xem danh sách kết quả, bấm vào một kết quả để nhảy tới tin nhắn gốc trong hội thoại.

## Hiển thị kết quả

- Chỉ trả về tin nhắn dạng **văn bản** (tin ảnh/đính kèm/hệ thống không nằm trong kết quả).
- Kết quả được **nhóm theo tháng**, mỗi nhóm có nhãn: "This month", "Last month", tên tháng (cùng năm) hoặc tên tháng kèm năm (khác năm).
- Mỗi kết quả hiển thị: avatar và tên người gửi, thời gian gửi, và nội dung tin với **phần khớp từ khoá được tô sáng**. Nếu nội dung có nhắc tên ai đó (mention) thì hiển thị đúng tên.
- Thời gian từng kết quả: trong hôm nay hiển thị giờ; khác ngày hiển thị ngày/tháng.

## Mở tin gốc từ kết quả (jump-to-message)

- Bấm vào một kết quả → khung hội thoại cuộn tới đúng tin nhắn đó và làm **nổi bật (highlight) tạm thời** trong vài giây rồi tự tắt.
- Thao tác nhảy **không làm thay đổi địa chỉ trang (URL)**.
- **Bảng tìm kiếm vẫn mở** sau khi bấm — người dùng có thể bấm tiếp các kết quả khác; danh sách kết quả và từ khoá được giữ nguyên.
- Nếu tin nằm sâu trong lịch sử (tin cũ chưa hiển thị), hệ thống **tự động tải dần phần cũ hơn** cho tới khi tìm thấy rồi mới cuộn tới — người dùng không phải cuộn tay.
- Trong lúc tải tới tin cũ, hiển thị **một chỉ báo "đang tải" liên tục** ở đầu khung hội thoại, **không nhấp nháy** dù phải tải qua nhiều phần lịch sử; chỉ báo tắt ngay khi đã cuộn tới tin.

## Quy tắc

- Từ khoá không được để trống / chỉ chứa khoảng trắng.
- Chỉ tìm trong hội thoại mà người dùng là thành viên.

## Trường hợp đặc biệt

- Mỗi lần mở lại bảng tìm kiếm: ô nhập và kết quả của lần trước được xoá, con trỏ tự đặt vào ô nhập.
- Xoá trắng ô tìm kiếm → danh sách kết quả bên dưới biến mất.
- Tin đã bị thu hồi không xuất hiện trong kết quả.
- Bấm một kết quả mà tin đã bị xoá/thu hồi → giữ nguyên vị trí, không báo lỗi. Bấm lại cùng một kết quả vẫn nhảy tới được.

## Hạn chế

- Tin càng cũ thì thời gian tải tới nơi càng lâu, do lịch sử được tải dần theo từng phần. Với hội thoại rất nhiều tin nhắn, thao tác này có thể mất một khoảng chờ thấy rõ.
