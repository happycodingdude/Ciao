# Thiết kế lại Quick Chat Popover (Nhắn nhanh trong nhóm)

## Mục đích

Cho phép người dùng nhắn nhanh cho một thành viên bất kỳ trong nhóm chat mà không
rời khỏi màn hình nhóm, thông qua một thẻ popover bật lên khi bấm vào thành viên
ở danh sách Members. Bản thiết kế lại nâng diện mạo và trải nghiệm của thẻ này
ngang tầm các ứng dụng chat phổ biến trên thị trường.

## Phạm vi

- Chỉ tác động đến thẻ Quick Chat bật lên từ danh sách thành viên trong nhóm.
- Không thay đổi luồng gửi tin, luồng tạo cuộc trò chuyện trực tiếp, hay quan hệ
  bạn bè phía nghiệp vụ.
- Áp dụng đồng bộ cho cả giao diện Sáng và Tối.

## Các giai đoạn thực hiện

| Phase | Mục tiêu | Nội dung nghiệp vụ |
| --- | --- | --- |
| **Phase 0 — Sửa diện mạo & lỗi hiển thị** | Bỏ cảm giác lỗi/chưa hoàn thiện | Ảnh đại diện dự phòng bằng chữ cái đầu (thay ảnh báo lỗi), chấm trạng thái Online/Offline, thay nền màu đặc bằng nền theo giao diện (đồng bộ Sáng/Tối), thêm nút đóng thẻ. |
| **Phase 1 — Rõ ngữ nghĩa & ngữ cảnh** | Người dùng hiểu rõ đang thao tác với ai và làm gì | Nút gửi tường minh cạnh ô nhập, gợi ý nhập cá nhân hóa theo tên người nhận, hiển thị vai trò (nhãn Admin) kèm trạng thái, nhãn nút kết bạn rõ nghĩa ("Add friend"). |
| **Phase 2 — Ngang tầm thị trường** | Bổ sung hành động nhanh như các app chat phổ biến | Hàng hành động nhanh (Message, Call) chỉ gồm thao tác có backend thật; mũi tên chỉ hướng trỏ về thành viên được chọn. |

Các Phase là tuần tự và không lược bỏ; mỗi Phase giữ lại toàn bộ kết quả của Phase trước.

## Hành vi nghiệp vụ

Khi người dùng bấm vào một thành viên (khác bản thân) trong danh sách Members:

1. Thẻ Quick Chat hiện ra bên cạnh danh sách, căn theo vị trí thành viên được bấm.
2. Thẻ hiển thị thông tin nhận diện của thành viên và một ô nhập tin nhắn nhanh.
3. Người dùng gõ nội dung và gửi ngay; hệ thống mở/khởi tạo cuộc trò chuyện trực
   tiếp với người đó rồi điều hướng vào cuộc trò chuyện.
4. Người dùng có thể đóng thẻ, hoặc thẻ tự ẩn khi bấm ra ngoài hoặc nhấn Escape.

## Luồng sử dụng

1. Vào một nhóm chat → mở panel thông tin nhóm → danh sách Members.
2. Bấm vào một thành viên → thẻ Quick Chat xuất hiện.
3. (Tùy quan hệ) thực hiện hành động kết bạn ngay trên thẻ, hoặc gõ tin nhắn.
4. Gửi tin → chuyển vào cuộc trò chuyện trực tiếp với thành viên đó.

## Thành phần hiển thị trên thẻ

- **Ảnh đại diện**: nếu không có ảnh hoặc ảnh lỗi, hiển thị chữ cái đầu của tên
  trên nền màu ổn định (mỗi người luôn ra cùng chữ và cùng màu). Không còn hiển
  thị ảnh báo lỗi "Image not found".
- **Chấm trạng thái**: thể hiện Online/Offline, đồng nhất với danh sách thành viên.
- **Tên và vai trò**: tên thành viên kèm nhãn "Admin" khi thành viên là quản trị
  nhóm (đồng nhất với danh sách thành viên), và dòng trạng thái Online/Offline.
- **Nút hành động quan hệ**: tùy theo quan hệ hiện tại (chưa kết bạn / đã gửi lời
  mời / có lời mời đến) hiển thị nút tương ứng (Add friend / Hủy / Chấp nhận).
- **Hàng hành động nhanh**:
  - **Message**: mở hội thoại đầy đủ với thành viên. Nếu đã có hội thoại trực tiếp
    thì điều hướng thẳng vào; nếu chưa, hệ thống khởi tạo hội thoại rồi mở.
  - **Call**: khởi tạo cuộc gọi (video + âm thanh) tới thành viên, dùng chung
    luồng gọi hiện có của ứng dụng.
- **Ô nhập tin nhắn**: gợi ý nhập được cá nhân hóa theo tên người nhận.
- **Nút gửi**: nút gửi tường minh bên cạnh ô nhập.
- **Nút đóng**: đóng thẻ nhanh.
- **Mũi tên chỉ hướng**: thẻ có mũi tên trỏ về phía thành viên được chọn trong
  danh sách, giúp nhận biết thẻ đang gắn với ai.

## Input / Output

- **Input**: thành viên được chọn (nhận diện, trạng thái online, quan hệ bạn bè),
  nội dung tin nhắn người dùng gõ.
- **Output**: một tin nhắn được gửi tới thành viên và điều hướng vào cuộc trò
  chuyện trực tiếp tương ứng.

## Quy tắc validate

- Không gửi khi nội dung rỗng hoặc chỉ gồm khoảng trắng.
- Enter (không Shift) để gửi; Shift+Enter để xuống dòng.
- Không mở Quick Chat với chính bản thân người dùng.

## Trường hợp đặc biệt

- Thành viên không có ảnh hoặc ảnh hỏng → dùng chữ cái đầu làm ảnh đại diện.
- Tên chỉ gồm chữ số hoặc rỗng → vẫn sinh được ký hiệu đại diện hợp lệ.
- Chọn sang thành viên khác khi thẻ đang mở → thẻ cập nhật đúng theo người mới,
  ô nhập được làm rỗng và focus lại.
- Thẻ luôn được giữ trong vùng nhìn thấy theo chiều dọc của màn hình.

## Hạn chế

- Hàng hành động nhanh chỉ gồm các thao tác có sẵn thật trong hệ thống (Message,
  Call). Ứng dụng chỉ có một loại cuộc gọi (video kèm âm thanh) nên không tách
  riêng gọi thoại; các thao tác mở rộng khác (xem trang cá nhân đầy đủ, tắt thông
  báo…) chưa nằm trong phạm vi.
- Không hiển thị định danh dạng @handle vì dữ liệu thành viên nhóm hiện không cung
  cấp trường này; phần định danh dùng tên và vai trò.

## Vấn đề đã biết / cần xử lý sau

- **Message không nhận ra hội thoại cũ nằm ở trang chưa tải của danh sách chat.**
  Thao tác Message tìm hội thoại trực tiếp đã tồn tại trong phần danh sách chat
  hiện đang được nạp. Danh sách chat được tải theo trang (cuộn để tải thêm), nên
  nếu hội thoại với thành viên đó nằm ở một trang chưa được tải, thao tác Message
  sẽ không "nhìn thấy" nó.
  - Hệ quả: thay vì mở đúng hội thoại cũ, hệ thống có thể phải khởi tạo lại luồng
    mở hội thoại, dẫn tới trải nghiệm không nhất quán (không nhảy thẳng tới đúng
    hội thoại đã có, hoặc phụ thuộc vào việc máy chủ trả về đúng hội thoại cũ).
  - Hành vi mong muốn: xác định được hội thoại trực tiếp đã tồn tại với thành viên
    kể cả khi nó chưa được tải trong danh sách, rồi điều hướng/chọn đúng hội thoại
    đó (ví dụ: tra cứu hội thoại trực tiếp theo người dùng ở phía máy chủ, hoặc tự
    động tải thêm/định vị hội thoại trong danh sách trước khi điều hướng).
  - Trạng thái: **chưa xử lý — để lại làm sau.**
