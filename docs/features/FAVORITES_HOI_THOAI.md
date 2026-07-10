# Favorites hội thoại (đổi từ "Ghim hội thoại") + gỡ trang Tin đã lưu

## Mục đích

- Đổi khái niệm "Ghim hội thoại" thành **Favorites**: đánh dấu sao các hội thoại quan trọng và gom chúng vào một vùng riêng trên danh sách chat.
- Gỡ bỏ trang "Tin đã lưu" toàn cục và biểu tượng của nó trên thanh điều hướng — việc xem lại tin đã lưu chuyển hoàn toàn sang panel "Tin nhắn đã lưu" trong từng hội thoại (xem PANEL_TIN_DA_LUU_TRONG_HOI_THOAI.md).

## Phạm vi

- Chỉ thay đổi giao diện và cách trình bày danh sách hội thoại; dữ liệu và hành vi lưu phía máy chủ giữ nguyên (vẫn là đánh dấu theo từng người dùng).
- Không thay đổi tính năng lưu / bỏ lưu tin nhắn trong hội thoại.

## Các giai đoạn thực hiện

| Phase | Mục tiêu | Trạng thái |
|---|---|---|
| 1 | Gỡ trang Tin đã lưu và biểu tượng trên thanh điều hướng | ✅ Hoàn thành |
| 2 | Đổi nút ghim thành ngôi sao Favorites trên từng hội thoại | ✅ Hoàn thành |
| 3 | Tách danh sách chat thành hai vùng: Favorites và Chats | ✅ Hoàn thành |
| 4 | Thay nút sao bằng menu ba chấm trên từng hội thoại; sao chuyển lên tiêu đề vùng Favorites | ✅ Hoàn thành |
| 5 | Nghiệm thu trên ứng dụng đang chạy | ⏳ Chờ verify |

## Hành vi nghiệp vụ

### Favorites

- Mỗi hội thoại trong danh sách có nút **ba chấm** ở góc phải, chỉ hiện khi rê chuột. Bấm vào mở một menu các hành động với hội thoại (sẽ bổ sung thêm hành động trong tương lai).
- Trong menu hiện có mục **"Thêm vào Favorites"** / **"Bỏ khỏi Favorites"** để bật/tắt đánh dấu. Bấm nút ba chấm hoặc chọn mục trong menu không mở hội thoại.
- Khi menu đang mở, hội thoại tương ứng giữ nguyên trạng thái nổi bật như đang rê chuột (không bị "tụt" hiệu ứng dù con trỏ nằm trên menu).
- Biểu tượng ngôi sao vàng hiển thị cạnh tiêu đề vùng **Favorites**.
- Danh sách chat chia hai vùng:
  - **Favorites**: các hội thoại đã đánh dấu sao, đặt trên cùng.
  - **Chats**: toàn bộ hội thoại còn lại, bên dưới.
- Khi không có hội thoại nào được đánh dấu sao: không hiển thị tiêu đề vùng nào, danh sách hiển thị như bình thường.
- Trong mỗi vùng, thứ tự vẫn theo hoạt động mới nhất trước.
- Favorites là riêng tư theo từng người dùng, không ảnh hưởng thành viên khác.

### Gỡ trang Tin đã lưu

- Thanh điều hướng không còn mục "Saved"; đường dẫn trang cũ không còn tồn tại.
- Tin đã lưu xem lại bằng panel trong từng hội thoại (biểu tượng sổ tay ở header khung chat).

## Trường hợp đặc biệt

- Hội thoại đã rời/xóa không xuất hiện ở cả hai vùng.
- Favorite/bỏ favorite có hiệu lực ngay trên danh sách (không cần tải lại).

## Hạn chế

- Tên khái niệm phía máy chủ vẫn là "pin" (dữ liệu cũ tương thích hoàn toàn); chỉ giao diện đổi thành Favorites.
