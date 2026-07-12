# Kế hoạch — Rời nhóm (Leave Group) · Phase 5 (bổ sung 2026-07-12)

> **Trạng thái:** 🟡 ĐÃ CODE đủ 3 đợt 2b-1 → 2b-3 (2026-07-12), chờ nghiệm thu — checklist ở [`ROI_NHOM.md`](./ROI_NHOM.md) · **Thuộc:** [`KE_HOACH_PHASE_5_NHOM_CONG_DONG.md`](./KE_HOACH_PHASE_5_NHOM_CONG_DONG.md) (Đợt 2b)
> Lối vào đã có sẵn: nút "rời nhóm" trong panel thông tin hội thoại (hiện chưa gắn hành động).

---

## 1. Các đợt triển khai

| Đợt | Mục tiêu | Rủi ro chính | Phụ thuộc | Rollback |
| --- | --- | --- | --- | --- |
| **2b-1** | Nền tảng phía server: rời nhóm là rời thật (tin mới không tự đưa người đã rời quay lại — chỉ giữ hành vi đó cho chat 1-1); chặn quản trị duy nhất rời khi nhóm còn người; dòng hệ thống "{user} left the group"; báo realtime cho thành viên còn lại; người đã rời mất quyền truy cập nội dung nhóm và không nhận tin/thông báo nữa | Đổi hành vi nền của chat 1-1 nếu phân nhánh sai; người đã rời còn sót trong danh sách nhận thông báo | Không | Revert server — hành vi cũ quay lại, không đụng dữ liệu |
| **2b-2** | Trải nghiệm người dùng: gắn hành động vào nút rời nhóm + hộp thoại xác nhận; hội thoại biến khỏi danh sách của người rời (mọi thiết bị); thành viên còn lại thấy dòng hệ thống + danh sách thành viên cập nhật ngay | Trạng thái đa thiết bị lệch nhau; xóa nhầm dữ liệu hiển thị đang dùng | 2b-1 | Ẩn hành động trên nút (giữ giao diện như hiện tại) |
| **2b-3** | Trường hợp đặc biệt + nghiệm thu: rời rồi được thêm lại / vào lại bằng link mời; quản trị duy nhất bị chặn đúng; người cuối cùng rời; bấm rời trên 2 thiết bị cùng lúc; checklist verify + tài liệu | Sót case vào-lại làm trùng thành viên | 2b-1, 2b-2, Link mời (Đợt 2 — đã code) | Không thay đổi hệ thống (chỉ kiểm thử + tài liệu) |

---

## 2. Mục đích & phạm vi

- **Mục đích:** thành viên chủ động rời khỏi nhóm chat; nhóm được thông báo minh bạch; người rời không còn nhận nội dung của nhóm.
- **Phạm vi:** chỉ nhóm (chat 1-1 không có "rời", vẫn giữ hành vi ẩn/mở lại hội thoại như hiện tại). Không gồm: xóa nhóm, chuyển quyền quản trị (thuộc tính năng Phân quyền quản trị — đã dời).

## 3. Hành vi nghiệp vụ

### Rời nhóm
- Trong panel thông tin nhóm, thành viên bấm nút rời nhóm → hộp thoại xác nhận (nêu rõ hệ quả: không nhận tin nữa, muốn quay lại phải được thêm/qua link mời) → xác nhận → rời ngay.
- Sau khi rời: hội thoại biến khỏi danh sách của người rời trên mọi thiết bị; nhóm hiện dòng hệ thống "{tên} left the group"; danh sách thành viên của người còn lại cập nhật ngay không cần tải lại.
- Người đã rời: không nhận tin nhắn/thông báo mới của nhóm, không xem được nội dung nhóm nữa (kể cả gọi trực tiếp API), không còn được tính vào sĩ số hiển thị.
- Tin nhắn cũ do người rời gửi giữ nguyên trong nhóm.

### Quay lại nhóm
- Chỉ qua hai đường đã có: được thành viên thêm lại, hoặc tự vào bằng link mời (Đợt 2). Quay lại dưới tư cách thành viên cũ được mở lại — không tạo bản ghi trùng.
- Tin nhắn mới trong nhóm KHÔNG tự đưa người đã rời quay lại (khác chat 1-1: xóa hội thoại rồi có tin mới thì hội thoại mở lại như cũ).

### Quản trị viên rời nhóm
- Quản trị rời bình thường nếu nhóm còn quản trị khác.
- **Quản trị DUY NHẤT + nhóm còn thành viên khác → chặn**, thông báo: cần trao quyền quản trị cho người khác trước (tính năng trao quyền thuộc Phân quyền quản trị — khi nào làm sẽ nới chỗ này).
- Quản trị là người duy nhất còn lại trong nhóm → được rời; nhóm thành nhóm trống, dữ liệu giữ nguyên, không hiển thị với ai.

## 4. Input / Output

- **Input:** hành động xác nhận rời nhóm của chính thành viên (không rời hộ người khác — phần "xóa thành viên khác" thuộc Phân quyền quản trị).
- **Output:** trạng thái thành viên chuyển thành "đã rời"; dòng hệ thống trong nhóm; danh sách hội thoại/thành viên hai phía cập nhật realtime.

## 5. Quy tắc validate

- Chỉ áp dụng cho hội thoại nhóm; người gọi phải đang là thành viên active của nhóm.
- Chặn quản trị duy nhất rời khi nhóm còn thành viên active khác (kiểm tra ở server — giao diện chỉ là lớp ngoài).
- Rời là hành động idempotent: bấm lặp lại / 2 thiết bị cùng bấm → kết quả như bấm một lần, chỉ một dòng hệ thống.

## 6. Trường hợp đặc biệt

| Case | Hành vi |
| --- | --- |
| Rời rồi được thêm lại / vào bằng link mời | Mở lại thành viên cũ (giữ biệt danh, lịch sử), có dòng hệ thống tương ứng |
| Quản trị duy nhất bấm rời (nhóm còn người) | Chặn + thông điệp hướng dẫn |
| Người cuối cùng rời | Rời được; nhóm trống, giữ dữ liệu |
| 2 thiết bị bấm rời đồng thời | 1 kết quả, 1 dòng hệ thống (idempotent) |
| Đang ở màn hình chat của nhóm trên thiết bị khác khi rời | Thiết bị đó nhận tín hiệu realtime → hội thoại rời khỏi danh sách |
| Người đã rời mở link mời của nhóm | Đi theo luồng Đợt 2 (vào thẳng/chờ duyệt theo cấu hình link) |

## 7. Rủi ro & lưu ý vận hành

- **Tương thích ngược chat 1-1:** hành vi "xóa hội thoại rồi có tin mới thì mở lại" phải giữ nguyên — chỉ nhóm đổi. Đây là điểm hồi quy số 1 cần kiểm.
- **Nhất quán đa nơi lưu:** trạng thái "đã rời" phải khớp giữa nguồn chính, bộ đệm và giao diện — sai lệch dẫn tới người rời vẫn nhận tin (lộ nội dung) hoặc người còn lại không thấy cập nhật.
- **Quyền truy cập:** kiểm tra tư cách thành viên phải xét "đang active" — người đã rời gọi API trực tiếp phải bị từ chối (hiện chưa chặt — nằm trong Đợt 2b-1).
- **Đối soát:** rời nhóm ghi nhận được (dòng hệ thống + nhật ký server) để truy vết tranh chấp.
- Production risk chung đã rà: race 2 thiết bị (idempotent), partial failure (rời ghi xong nhưng báo realtime lỗi → danh sách tự đúng ở lần tải sau), cache lệch (điểm nêu trên), không có retry storm/downtime (thao tác đơn lẻ, không migration).

## 8. Hạn chế

- Chưa có "chuyển quyền rồi rời" trong một thao tác — chờ tính năng Phân quyền quản trị.
- Nhóm trống không có cơ chế dọn/xóa tự động (chấp nhận, dữ liệu nhỏ).
- Không có "rời im lặng" (luôn có dòng hệ thống) — minh bạch với nhóm được ưu tiên.
