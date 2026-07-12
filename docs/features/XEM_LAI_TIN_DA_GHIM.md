# Xem lại tin nhắn đã ghim trong hội thoại

> **Cập nhật:** 2026-07-12 · **Trạng thái:** ✅ **HOÀN THÀNH — user đã nghiệm thu trên app thật 2026-07-12** (gồm cả khoá click khi đang nhảy tới tin + search fallback máy chủ)
> Thuộc nhóm tính năng "Ghim nhiều tin nhắn" (Phase 3) — xem [`PRODUCT_ROADMAP.md`](./PRODUCT_ROADMAP.md)

---

## 1. Trạng thái triển khai

| Hạng mục | Trạng thái |
| --- | --- |
| API liệt kê tin đã ghim của hội thoại | ✅ Đã code, build pass |
| Icon ghim trên thanh header khung chat | ✅ Đã code |
| Panel danh sách tin đã ghim (sidebar phải) | ✅ Đã code |
| Nhảy tới tin gốc khi click 1 item | ✅ Đã code (tái dùng cơ chế của tìm kiếm tin nhắn) |
| Cập nhật realtime khi có người ghim/bỏ ghim | ✅ Đã code |
| Tìm kiếm: lọc local trước, không thấy mới tìm phía máy chủ (đồng bộ với panel Tin đã lưu) | ✅ Đã code, build pass |
| Khóa click lặp khi đang nhảy tới tin (tin cũ tải lâu) | ✅ Đã code |
| Verify UI trên app thật | ✅ User đã nghiệm thu 2026-07-12 |

---

## 2. Mục đích

Người dùng đã ghim được nhiều tin nhắn trong hội thoại (mọi thành viên đều thấy tin ghim), nhưng chưa có nơi **xem lại toàn bộ** các tin đã ghim. Tính năng này bổ sung lối vào tập trung: icon ghim trên thanh tiêu đề khung chat mở ra danh sách tin đã ghim, giúp tìm nhanh thông tin quan trọng mà không phải cuộn ngược lịch sử.

## 3. Hành vi

- Thanh tiêu đề khung chat có thêm **icon ghim** bên cạnh các icon Tìm kiếm / Tin đã lưu / Thông tin — cùng luồng thao tác với tính năng tìm kiếm tin nhắn.
- Click icon → mở **panel "Pinned messages"** ở sidebar phải (mỗi thời điểm chỉ 1 panel mở; click lại icon để đóng). Icon đổi màu khi panel đang mở.
- Panel hiển thị danh sách tin đã ghim của hội thoại, **tin mới nhất trước**, mỗi item gồm: avatar + tên người gửi, thời gian gửi, nội dung xem trước.
- Tin không phải văn bản hiển thị nhãn xem trước theo loại (tệp đính kèm hiện tên tệp; nhãn dán/GIF/bình chọn/danh bạ hiện nhãn tương ứng) — nhất quán với dòng xem trước ở danh sách hội thoại.
- Ô lọc ở đầu panel — **đồng bộ logic với panel Tin đã lưu**: gõ từ khóa thì lọc ngay trong danh sách đã tải; nếu danh sách đã tải **không có** kết quả khớp thì tự động tìm phía máy chủ theo từ khóa (có độ trễ ngắn khi đang gõ); xóa trắng thì hiện lại toàn bộ.
- **Click 1 item → khung chat tự cuộn tới tin gốc và làm nổi bật tin đó** (kể cả tin cũ chưa tải — tự tải thêm trang cũ), panel vẫn mở để xem tiếp item khác.
- **Trong lúc đang nhảy tới tin** (tin cũ phải tải thêm nhiều trang): mọi click tiếp theo vào các item trong danh sách bị bỏ qua cho tới khi thao tác nhảy hoàn tất — con trỏ chuyển dạng chờ. Quy tắc này áp dụng chung cho cả 3 danh sách: Tìm kiếm / Tin đã ghim / Tin đã lưu.
- Có người ghim/bỏ ghim (kể cả từ thiết bị khác) → danh sách trong panel tự cập nhật; thao tác ghim/bỏ ghim của chính mình cũng phản ánh ngay.
- Đổi sang hội thoại khác → panel về mặc định (Thông tin), như các panel khác.

## 4. Input / Output

- **Input:** hội thoại đang mở; từ khóa lọc (tùy chọn).
- **Output:** danh sách tin đã ghim (người gửi, thời gian, nội dung xem trước); điều hướng tới tin gốc khi chọn.

## 5. Quy tắc & validate

- Chỉ **thành viên của hội thoại** xem được danh sách tin ghim (máy chủ kiểm tra).
- Tin đã **thu hồi** không xuất hiện trong danh sách (nội dung đã bị xóa, giữ lại chỉ gây item rỗng).
- Danh sách không phân trang: số tin ghim mỗi hội thoại nhỏ do người dùng chủ động ghim từng tin.

## 6. Trường hợp đặc biệt

- Hội thoại chưa có tin ghim → hiển thị "No pinned messages".
- Lọc không có kết quả → hiển thị "No matches".
- Tin ghim là tệp đính kèm → xem trước hiện tên tệp; click vẫn nhảy tới tin gốc để xem đầy đủ.

## 7. Hạn chế

- Chưa có thao tác **bỏ ghim ngay trong panel** — muốn bỏ ghim phải nhảy tới tin gốc rồi thao tác trên tin (có thể bổ sung sau nếu cần).
- Icon chỉ có trên giao diện màn hình lớn (menu thu gọn của điện thoại hiện giữ nguyên 2 nút Tìm kiếm/Thông tin — nhất quán với tính năng Tin đã lưu).

## 8. Checklist verify UI (user thực hiện trên app thật)

1. Mở 1 hội thoại → thấy icon ghim trên thanh tiêu đề, cạnh icon tìm kiếm.
2. Click icon → panel "Pinned messages" mở bên phải, liệt kê đúng các tin đã ghim (mới trước).
3. Ghim thêm 1 tin từ menu tin nhắn → panel (đang mở) tự có thêm item; bỏ ghim → item biến mất.
4. Click 1 item → khung chat cuộn tới đúng tin và highlight; thử với tin cũ (chưa tải) để kiểm tra tự tải trang cũ.
5. Với tin RẤT cũ (nhảy lâu): trong lúc đang nhảy, click liên tiếp các item khác → không có gì xảy ra (bị khóa); nhảy xong click lại → hoạt động bình thường. Kiểm tra tương tự ở panel Tìm kiếm và Tin đã lưu.
6. Gõ từ khóa vào ô lọc → danh sách thu hẹp đúng; xóa trắng → hiện lại đủ. Gõ từ khóa không khớp gì trong danh sách → thấy "Searching..." rồi kết quả từ máy chủ (hoặc "No matches").
7. Hội thoại không có tin ghim → thấy "No pinned messages".
8. Kiểm tra dark mode + không có lỗi Console / request lỗi ở tab Network.
