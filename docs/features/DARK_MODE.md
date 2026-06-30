# Dark Mode — Tài liệu tính năng

> Tài liệu mô tả tính năng ở mức nghiệp vụ. Không mô tả chi tiết kỹ thuật.

## Mục đích

Cho phép người dùng sử dụng ứng dụng ở giao diện tối (dark mode) một cách nhất quán trên toàn bộ các trang, loại bỏ các vùng nền sáng gây chói khi bật chế độ tối.

## Hành vi

- Người dùng chọn chế độ hiển thị **Sáng (Light)** hoặc **Tối (Dark)**.
- Lựa chọn được **ghi nhớ** giữa các lần truy cập.
- Khi đổi chế độ, **toàn bộ bề mặt, chữ và đường viền** chuyển màu đồng bộ ngay lập tức — không còn vùng nền trắng/xám lạc giữa nền tối.
- Chế độ tối áp dụng cho mọi khu vực: danh sách hội thoại, khung chat, bong bóng tin nhắn, thanh nhập tin, bảng thông tin hội thoại, tìm kiếm, đính kèm, danh sách thành viên, thông báo, hồ sơ, và các màn hình chờ (loading).

## Phân biệt chế độ về mặt màu sắc

- **Light**: giữ nguyên nhận diện hiện có — nền sáng, **màu nhấn hồng**.
- **Dark**: nền **xanh navy đậm** (không phải đen thuần), **màu nhấn xanh da trời** (nút gửi, tab đang chọn, nhãn quản trị, biểu tượng nhấn).

> Màu nhấn xanh **chỉ áp dụng cho chế độ tối**. Chế độ sáng vẫn dùng màu nhấn hồng như trước.

## Công tắc đổi chế độ (trên thanh điều hướng)

- Công tắc Sáng/Tối nằm trực tiếp trên **thanh điều hướng bên trái** (không còn nằm trong phần Cài đặt).
- Biểu tượng phản ánh chế độ hiện tại: **mặt trời** (Sáng) / **mặt trăng** (Tối); di chuột hiện nhãn "Light mode" / "Dark mode".
- Ở chế độ Tối, công tắc có **hiệu ứng phát sáng (glow)** xanh để nổi bật.
- Một lần bấm sẽ chuyển đổi qua lại giữa hai chế độ.

## Luồng sử dụng

1. Người dùng bấm công tắc đổi chế độ trên thanh điều hướng bên trái.
2. Giao diện đổi màu ngay theo lựa chọn.
3. Lựa chọn được **ghi nhớ** và giữ lại cho những lần mở ứng dụng sau.

## Input / Output

- **Input**: lựa chọn chế độ hiển thị của người dùng (Sáng / Tối).
- **Output**: toàn bộ giao diện hiển thị theo chế độ đã chọn, đồng bộ màu nền – chữ – viền – màu nhấn.

## Quy tắc đặc biệt

- Một số phần tử **cố ý giữ màu trắng/sáng** ở cả hai chế độ vì mục đích thiết kế: khung chứa logo và nút tròn của công tắc bật/tắt trên màn hình cài đặt.
- **Mục đang chọn trên thanh điều hướng**: nền ô trắng, còn **biểu tượng lấy đúng màu nền của thanh điều hướng theo chế độ** (Sáng → xanh da trời; Tối → xanh navy) tạo hiệu ứng "khắc chìm". Các biểu tượng không được chọn vẫn màu trắng.
- Bong bóng tin nhắn **gửi đi và nhận về dùng chung một màu nền**; phân biệt hai chiều bằng vị trí căn lề và avatar (giữ nguyên hành vi sẵn có).
- Vùng tô nhấn khi tìm thấy kết quả tìm kiếm vẫn giữ màu nổi bật riêng để dễ nhận biết.

## Hạn chế

- Hiệu ứng nhấp nháy của màn hình chờ (loading) dùng dải màu động cố định, không đổi theo chế độ sáng/tối.
- Hiện chỉ có hai chế độ: Sáng và Tối (chưa có chế độ tương phản cao hoặc theo lịch tự động).
