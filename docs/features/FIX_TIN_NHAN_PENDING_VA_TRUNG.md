# Fix tin nhắn gửi nhanh hiển thị mờ vĩnh viễn / nổi bong bóng trùng

## Các giai đoạn thực hiện

| Phase | Mục tiêu | Nội dung nghiệp vụ | Trạng thái |
| --- | --- | --- | --- |
| **Phase 1 — Không còn tin kẹt "đang gửi"** | Tin gửi từ thẻ nhắn nhanh có trạng thái kết thúc rõ ràng | Gửi tin từ thẻ nhắn nhanh (quick chat) giờ có giới hạn thời gian chờ như gửi tin thông thường. Nếu máy chủ lỗi hoặc quá hạn, tin được đánh dấu **gửi lỗi** (không còn mờ "đang gửi" vĩnh viễn) và người dùng được báo lỗi rõ ràng. | ✅ Hoàn thành |
| **Phase 2 — Không còn bong bóng trùng** | Mỗi tin chỉ hiển thị một lần | Khi bản sao thời gian thực (realtime) của chính tin mình vừa gửi về **trước** khi máy chủ xác nhận, hệ thống nhận ra đây là cùng một tin và hợp nhất với bản "đang gửi" thay vì hiển thị thêm bong bóng thứ hai. Áp dụng cho cả gửi từ thẻ nhắn nhanh, chuyển tiếp và ô nhập thông thường. | ✅ Hoàn thành |
| **Phase 3 — Không gửi trùng (double API call)** | Một thao tác gửi chỉ tạo đúng một tin nhắn | Một lần bấm gửi ở thẻ nhắn nhanh chỉ gọi gửi **một lần**. Trước đây, khi gõ tiếng Việt qua bộ gõ (IME), phím Enter xác nhận ghép chữ bị tính thêm thành một lần gửi; hoặc bấm Enter và nút Gửi gần như đồng thời cũng gửi hai lần → tạo **hai tin nhắn thật** trên máy chủ (chỉ lộ ra khi mở lại hội thoại). Nay: Enter khi bộ gõ đang ghép chữ không tính là gửi; đồng thời có khóa chống gửi lặp khi lần gửi trước chưa xong. | ✅ Hoàn thành |

## Mục đích

Khắc phục ba lỗi khi gửi tin (nổi bật ở thẻ nhắn nhanh trong nhóm):

1. Tin bị mờ ("đang gửi") mãi không đổi trạng thái, dù không có thông báo lỗi nào.
2. Cùng một tin hiển thị hai bong bóng giống hệt nhau (do bản realtime về sớm).
3. Một thao tác gửi tạo **hai tin nhắn thật** trên máy chủ (do gọi gửi hai lần) — lỗi
   không liên tục (intermittent), lộ ra khi mở lại hội thoại thấy tin bị nhân đôi.

## Phạm vi

- Luồng gửi tin từ thẻ nhắn nhanh, chuyển tiếp tin nhắn, và ô nhập trong hội thoại.
- Cách xử lý bản sao tin nhắn đến qua kênh thời gian thực.
- Không thay đổi giao diện, không thay đổi hành vi máy chủ.

## Hành vi nghiệp vụ

1. Gửi tin → tin hiện ngay ở trạng thái "đang gửi" (mờ).
2. Máy chủ xác nhận → tin chuyển sang trạng thái bình thường; nếu bản sao thời gian
   thực của tin đã về trước đó thì hai bản được hợp nhất làm một.
3. Máy chủ lỗi hoặc quá thời gian chờ → tin chuyển sang trạng thái **gửi lỗi** kèm
   thông báo "Không thể gửi tin nhắn"; không còn trạng thái mờ vô hạn.
4. Tin của chính mình gửi từ thiết bị khác vẫn xuất hiện bình thường qua kênh thời
   gian thực (không bị chặn bởi cơ chế hợp nhất).
5. Mỗi thao tác gửi (một lần bấm Enter/nút Gửi) chỉ tạo đúng một tin nhắn, kể cả khi
   đang gõ tiếng Việt bằng bộ gõ hoặc thao tác nhanh; muốn gửi tin thứ hai phải gõ và
   gửi lại sau khi lần gửi trước hoàn tất.

## Trường hợp đặc biệt

- Gửi liên tiếp hai tin trùng nội dung → mỗi tin hợp nhất đúng với bản xác nhận của
  nó, không mất tin, không trùng.
- Tin của người khác trùng nội dung với tin mình đang gửi → vẫn hiển thị riêng,
  không bị hợp nhất nhầm.
- Mất mạng/không khởi tạo được hội thoại khi gửi từ thẻ nhắn nhanh → báo lỗi ngay,
  không điều hướng sai.
- Gửi hai tin trùng nội dung một cách CHỦ ĐÍCH (gõ lại rồi gửi tiếp) vẫn được phép và
  tạo đúng hai tin — khóa chống trùng chỉ chặn lần gọi lặp trong cùng một thao tác gửi.

## Hạn chế

- Tin đánh dấu "gửi lỗi" chưa có nút gửi lại trực tiếp; người dùng gửi lại bằng cách
  nhập tin mới.
