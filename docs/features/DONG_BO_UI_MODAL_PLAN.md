# Đồng bộ giao diện hộp thoại (modal popup)

> **Trạng thái:** ✅ Đã triển khai (Phase 1 → 3) qua 4 commit `a8b4697 → f8fa270` (30/06–01/07/2026).
> Là phần mở rộng của tính năng theme sáng/tối — xem [`DARK_MODE.md`](./DARK_MODE.md) và [`AP_DUNG_DARK_MODE_PLAN.md`](./AP_DUNG_DARK_MODE_PLAN.md).
> Chi tiết những gì đã thực sự đưa lên: xem [Changelog triển khai](#changelog-triển-khai) cuối tài liệu.

## Mục đích

Thống nhất giao diện cho tất cả hộp thoại mở ra từ các nút thao tác trong ứng dụng, mang lại
trải nghiệm nhất quán và dễ nhận biết khi người dùng thực hiện các tác vụ liên quan đến bạn bè,
nhóm và tin nhắn.

## Phạm vi

- **Trong phạm vi:** các hộp thoại trung tâm mở ra từ nút thao tác (xem mục Danh sách hộp thoại).
- **Ngoài phạm vi:** các popover xác nhận nhỏ (ví dụ xác nhận huỷ kết bạn) và menu ngữ cảnh của
  tin nhắn — vẫn giữ nguyên giao diện hiện tại.

## Các giai đoạn thực hiện

| Phase | Mục tiêu |
|-------|----------|
| **Phase 1 — Diện mạo chung** | Thiết lập diện mạo thống nhất cho mọi hộp thoại: hộp nổi giữa nền mờ, phần đầu có biểu tượng chức năng + tiêu đề + mô tả ngắn + nút đóng, ô tìm kiếm và vùng nút thao tác. Sau Phase này, tất cả hộp thoại có chung một diện mạo. |
| **Phase 2 — Thao tác từng hộp thoại** | Áp đúng kiểu thao tác cho từng hộp thoại: hộp dạng "chọn rồi xác nhận" có nút Huỷ và Lưu ở cuối; hộp dạng "thao tác theo từng dòng" giữ nút hành động ngay trên mỗi dòng. Đảm bảo hành vi nghiệp vụ của từng tác vụ không thay đổi. |
| **Phase 3 — Hoàn thiện & nghiệm thu** | Đảm bảo hiển thị đúng ở cả chế độ sáng và tối, thích ứng với màn hình điện thoại, và kiểm thử toàn bộ luồng mở/đóng, tìm kiếm, chọn/xác nhận và thao tác theo dòng của từng hộp thoại. |

## Hành vi nghiệp vụ

### Bố cục chung của hộp thoại

Mọi hộp thoại hiển thị theo cùng một bố cục:

- Hộp thoại nổi ở giữa màn hình trên nền mờ tối.
- Phần đầu: biểu tượng đại diện cho chức năng, tiêu đề, một dòng mô tả ngắn, và nút đóng.
- Ô tìm kiếm (với hộp thoại có danh sách lựa chọn).
- Danh sách lựa chọn: mỗi dòng gồm ô chọn, ảnh đại diện, tên người dùng, và trạng thái phụ khi có.
- Phần cuối: nút **Huỷ** và nút **Lưu** (chỉ với hộp thoại dạng "chọn rồi xác nhận").

### Hai kiểu thao tác

- **Chọn rồi xác nhận:** người dùng chọn một hoặc nhiều mục rồi bấm **Lưu** để áp dụng cùng lúc.
- **Thao tác theo từng dòng:** người dùng bấm nút hành động ngay trên mỗi dòng; mỗi mục được
  thực hiện độc lập, không cần bước xác nhận chung.

## Danh sách hộp thoại

| Hộp thoại | Cách mở | Mục đích | Kiểu thao tác |
|-----------|---------|----------|---------------|
| Thêm thành viên | Nút thêm thành viên trong bảng thông tin nhóm | Chọn nhiều người để thêm vào nhóm | Chọn rồi xác nhận |
| Tạo nhóm | Nút tạo nhóm ở đầu danh sách trò chuyện | Nhập tên nhóm và chọn thành viên để tạo nhóm | Chọn rồi xác nhận |
| Cập nhật nhóm | Nút sửa nhóm trong bảng thông tin nhóm | Đổi tên và ảnh đại diện nhóm | Nhập rồi xác nhận |
| Kết bạn | Nút kết bạn ở đầu danh sách trò chuyện và trang Kết nối | Tìm người dùng và gửi lời mời kết bạn | Theo từng dòng |
| Chuyển tiếp tin nhắn | Biểu tượng chia sẻ trên ảnh và mục "Chuyển tiếp" trong menu của tin nhắn | Gửi nội dung tới bạn bè | Theo từng dòng |

## Luồng sử dụng

**Hộp thoại "chọn rồi xác nhận":**
1. Mở hộp thoại từ nút tương ứng.
2. Nhập từ khoá để lọc danh sách (nếu cần).
3. Chọn hoặc bỏ chọn các mục mong muốn.
4. Bấm **Lưu** để áp dụng, hoặc **Huỷ**/đóng để bỏ qua mọi thay đổi.

**Hộp thoại "thao tác theo từng dòng":**
1. Mở hộp thoại từ nút tương ứng.
2. Nhập từ khoá để lọc danh sách (nếu cần).
3. Bấm nút hành động trên từng dòng để thực hiện ngay.
4. Đóng hộp thoại khi hoàn tất.

## Input / Output

| Hộp thoại | Input | Output |
|-----------|-------|--------|
| Thêm thành viên | Danh sách người được chọn | Thành viên mới được thêm vào nhóm |
| Tạo nhóm | Tên nhóm, danh sách thành viên | Nhóm mới được tạo |
| Cập nhật nhóm | Tên nhóm, ảnh đại diện | Thông tin nhóm được cập nhật |
| Kết bạn | Người dùng được chọn trên từng dòng | Lời mời kết bạn được gửi |
| Chuyển tiếp tin nhắn | Người nhận được chọn trên từng dòng | Nội dung được gửi tới người nhận |

## Quy tắc validate

- Thêm thành viên: nếu không chọn ai, thao tác xác nhận không có hiệu lực.
- Tạo nhóm và cập nhật nhóm: yêu cầu tên nhóm hợp lệ.
- Người đã là thành viên nhóm không thể được chọn để thêm lại.

## Trường hợp đặc biệt

- Người đã có trong nhóm hiển thị trạng thái **"Joined"** và bị vô hiệu hoá lựa chọn.
- Có thể đóng hộp thoại bằng nút đóng, phím Esc, hoặc bấm ra vùng nền bên ngoài.
- Với hộp thoại thao tác theo từng dòng, mục đã xử lý chuyển sang trạng thái đã hoàn tất.
- Giao diện hiển thị nhất quán ở cả chế độ sáng và tối, và thích ứng với màn hình điện thoại.

## Hạn chế

- Phạm vi đồng bộ chỉ áp dụng cho các hộp thoại trung tâm mở ra từ nút thao tác.
- Các popover xác nhận nhỏ (ví dụ xác nhận huỷ kết bạn) và menu ngữ cảnh không nằm trong phạm vi này.

---

## Changelog triển khai

> Ghi lại những gì đã thực sự đưa lên qua 4 commit. Đợt này khởi đầu là "đồng bộ modal" nhưng
> khi test trên app live đã lan sang **hoàn thiện nốt các surface còn hardcode màu** của dark mode
> (phần đuôi của [`DARK_MODE.md`](./DARK_MODE.md)). Cả hai mảng dùng chung cơ chế token CSS-var.

| Commit | Ngày | Nội dung chính |
|--------|------|----------------|
| `a8b4697` | 30/06 | **Phase 1 — khung modal chung.** Tách component tái dùng: `PortalHeader`, `ModalFooter`, `ModalSearchInput`, `BackgroundPortal`; chuẩn hoá header (icon + tiêu đề + mô tả + nút đóng), ô tìm kiếm, vùng nút. Áp cho: Thêm thành viên, Tạo nhóm, Cập nhật nhóm, Kết bạn, Chuyển tiếp tin nhắn. Thêm tài liệu này. |
| `9e1063b` | 01/07 | **Token hoá nền gốc + modal (cont).** Tokenize `index.css` (nền/chữ modal), tinh chỉnh `MemberToAdd_LargeScreen`, `FriendPickerList`; bổ sung/điều chỉnh token trong `App.css`. |
| `2f57995` | 01/07 | **Hoàn thiện modal theo 2 kiểu thao tác (Phase 2).** `BackgroundPortal`/`PortalHeader` responsive, `CreateGroupChatModal` + `AddMembersModal` (chọn-rồi-xác-nhận vs theo-dòng), `ShareImage`, `MessageMenu_Slide`; token `index.css`. |
| `f8fa270` | 01/07 | **Lan sang các surface dark-mode còn sót (Phase 3).** Tokenize màu hardcode ở: `ConversationItem`, `Information`, `InformationAttachments`, `AttachmentIcon`, `ListChatContainer`, `ConnectionFriendList`, `ListFriend`, `NotificationList` + `Notification` page, `ConversationReview`, `ShareImage`, `SettingToggle`, `listchat.css`, `App.css`. → đóng nốt "vùng sáng lạc" ngoài phạm vi modal. |

### Kết quả
- Toàn bộ 5 hộp thoại trung tâm dùng chung khung + hiển thị đúng ở cả sáng/tối, responsive mobile.
- Các surface danh sách/thông tin/thông báo còn hardcode màu (ngoài scope plan dark mode gốc) đã được token hoá → dark mode giờ phủ **toàn bộ** app, không còn vùng nền trắng lạc.
- Thuần CSS/class + tách component — không đổi API/DB/logic nghiệp vụ.
