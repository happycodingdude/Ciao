# Rời nhóm (Leave Group) — Phase 5 · Đợt 2b

> **Trạng thái:** 🟡 Đã code (2026-07-12), chờ nghiệm thu trên app thật
> **Kế hoạch gốc:** [`KE_HOACH_ROI_NHOM.md`](./KE_HOACH_ROI_NHOM.md)

---

## 1. Checklist nghiệm thu (user verify trên app thật)

| # | Luồng | Kết quả mong đợi |
| --- | --- | --- |
| 1 | Thành viên thường mở panel Chat information của nhóm → bấm icon rời nhóm | Hộp thoại xác nhận "Leave group" nêu rõ hệ quả |
| 2 | Bấm **Leave group** trong hộp thoại | Toast "You left the group"; điều hướng về danh sách; hội thoại biến khỏi danh sách |
| 3 | Phía thành viên còn lại | Dòng hệ thống "{tên} left the group" xuất hiện realtime; Members (N) giảm, người rời biến khỏi danh sách thành viên — không cần reload |
| 4 | Thiết bị/tab khác của người rời | Hội thoại tự biến khỏi danh sách (realtime) |
| 5 | Người khác nhắn tin vào nhóm sau đó | Người đã rời KHÔNG nhận tin/notification; hội thoại KHÔNG quay lại danh sách |
| 6 | Người đã rời gọi thẳng API nội dung nhóm (hoặc mở lại bằng URL cũ) | Bị từ chối (400 — không còn là thành viên) |
| 7 | **Chat 1-1** xóa hội thoại rồi phía kia nhắn lại | Hội thoại mở lại như trước — hành vi cũ KHÔNG đổi (điểm hồi quy số 1) |
| 8 | Quản trị DUY NHẤT bấm rời khi nhóm còn thành viên | Hộp thoại hiển thị thông báo chặn "cần có admin khác trước khi rời" (không có nút Leave); gọi thẳng API cũng bị chặn |
| 9 | Nhóm chỉ còn 1 người (là quản trị) bấm rời | Rời được; nhóm không còn hiện với ai |
| 10 | Người rời được thêm lại / vào lại bằng link mời | Vào lại bình thường, KHÔNG trùng tên trong danh sách thành viên; có dòng hệ thống tương ứng |
| 11 | 2 thiết bị bấm rời gần như đồng thời | Chỉ 1 dòng hệ thống "left the group" (kiểm tra sau khi reload để nhìn dữ liệu thật) |
| 12 | Bấm icon rời rồi Cancel | Không có gì thay đổi |

Chú ý khi verify: Console không error liên quan; Network không request lỗi ngoài 400 chủ đích (case 6, 8).

---

## 2. Mục đích & phạm vi

Thành viên chủ động rời khỏi nhóm chat; nhóm được thông báo minh bạch; người rời không còn nhận nội dung của nhóm. Chỉ áp dụng cho nhóm — chat 1-1 giữ nguyên hành vi "ẩn hội thoại, có tin mới thì mở lại".

## 3. Hành vi nghiệp vụ

- Nút rời nhóm trong panel thông tin nhóm → hộp thoại xác nhận (nêu hệ quả) → rời ngay.
- Sau khi rời: hội thoại biến khỏi danh sách của người rời trên mọi thiết bị; nhóm có dòng hệ thống "{user} left the group"; danh sách thành viên/sĩ số của người còn lại cập nhật realtime.
- Người đã rời: không nhận tin/notification mới (kể cả khi bị nhắc tên), không truy cập được nội dung nhóm qua API, không còn tính vào sĩ số. Tin nhắn cũ của họ giữ nguyên.
- Quay lại: chỉ qua được-thêm-lại hoặc link mời (tư cách thành viên cũ được mở lại, không tạo trùng).
- Tin nhắn mới KHÔNG tự đưa người đã rời quay lại nhóm (hành vi đó chỉ còn ở chat 1-1).

## 4. Quy tắc validate

- Chỉ nhóm; người gọi phải là thành viên đang active.
- Quản trị duy nhất không được rời khi nhóm còn thành viên active khác — chặn ở cả UI (thông điệp giải thích) lẫn server; sẽ nới khi có tính năng trao quyền quản trị.
- Idempotent: đã rời → gọi lại vô hại; 2 thiết bị bấm đồng thời → dữ liệu chỉ ghi 1 lần, 1 dòng hệ thống.

## 5. Trường hợp đặc biệt & hạn chế

- Người cuối cùng rời → nhóm trống, dữ liệu giữ nguyên, không hiển thị với ai; chưa có cơ chế dọn nhóm trống (chấp nhận).
- Race 2 thiết bị: dữ liệu gốc chống trùng tuyệt đối; hiển thị realtime tức thời có thể đúp trong khung cực ngắn và tự đúng khi tải lại (chấp nhận).
- Luôn có dòng hệ thống khi rời (không có "rời im lặng") — minh bạch với nhóm.
- Chưa có "trao quyền rồi rời" trong một thao tác — chờ Phân quyền quản trị.
- Rời → vào lại bằng link mời → rời lại: hoạt động bình thường, không lỗi. (Trước đây lần rời thứ hai báo 500 do cache thành viên bị trùng khi vào lại — đã sửa; chi tiết ở [LINK_MOI_VA_YEU_CAU_THAM_GIA.md](./LINK_MOI_VA_YEU_CAU_THAM_GIA.md) mục 5 "Sửa lỗi".)

## 6. Thay đổi hành vi nền (quan trọng khi regression-test)

| Hành vi | Trước | Sau |
| --- | --- | --- |
| Tin mới tự mở lại người đã ẩn/rời hội thoại | Mọi hội thoại (cả nhóm) | **Chỉ chat 1-1** |
| Người đã rời nhóm gọi API nội dung nhóm | Vẫn được (lỗ hổng) | Bị từ chối |
| Người đã rời trong danh sách nhận tin/notification/mention | Có nhận | Bị loại |
| Danh sách thành viên trên UI | Hiện cả người đã rời | Chỉ thành viên active |

## 7. API & realtime

- Dùng lại endpoint rời/ẩn hội thoại hiện có (`DELETE /api/v1/conversations/{id}/members`) — nhóm được nâng cấp semantics như trên; chat 1-1 giữ nguyên. 400 khi quản trị duy nhất rời mà nhóm còn người.
- Event realtime mới `MemberLeft` (payload: hội thoại, người rời, dòng hệ thống) gửi cho thành viên còn lại + chính người rời (đồng bộ đa thiết bị).

## 8. Deployment notes

1. Deploy backend — không migration, không config mới.
2. Build/deploy frontend (không dependency mới).
3. Rollback: revert deploy — hành vi cũ quay lại, không đụng dữ liệu (trạng thái "đã rời" là field sẵn có).
