# Mở đúng hội thoại trực tiếp đã tồn tại & củng cố tải thêm danh sách chat

## Các giai đoạn thực hiện

| Phase | Mục tiêu | Nội dung nghiệp vụ | Trạng thái |
| --- | --- | --- | --- |
| **Phase 1 — Máy chủ phân biệt hội thoại mới/cũ** | Client biết chắc id nhận về là hội thoại mới hay hội thoại cũ đã tồn tại | Khi client yêu cầu mở/khởi tạo hội thoại trực tiếp với một người, máy chủ tra cứu hội thoại 1-1 đã có giữa hai người; kết quả trả về kèm cờ cho biết đây là hội thoại vừa tạo hay hội thoại cũ. Đồng thời, nếu dữ liệu có hội thoại trùng lặp giữa hai người, máy chủ chọn ổn định hội thoại cũ nhất thay vì báo lỗi. | ✅ Hoàn thành |
| **Phase 2 — Mở/nhắn đúng hội thoại cũ ở trang chưa tải** | Mọi lối vào đều dẫn tới đúng hội thoại, không mất lịch sử | Khi hội thoại 1-1 chưa hiện trong danh sách đã tải, hệ thống tự tải thêm từng trang danh sách đến khi thấy hội thoại (hoặc hết danh sách). Bấm **Message** (chỉ mở xem): vào đúng hội thoại và **giữ nguyên vị trí** của nó trong danh sách. **Gửi tin nhanh/chuyển tiếp**: cùng cách tìm, nhưng vì có tin nhắn mới nên hội thoại được **đẩy lên đầu** danh sách; lịch sử được nạp đầy đủ, tin vừa gửi nối tiếp lịch sử. Chỉ khi thật sự chưa từng có hội thoại mới khởi tạo hội thoại mới (đưa lên đầu danh sách). | ✅ Hoàn thành |
| **Phase 3 — Củng cố tải thêm danh sách chat** | Cuộn tải thêm hoạt động ổn định, không trùng lặp, không gọi thừa | Cuộn xuống cuối danh sách chat tải trang kế tiếp. Trang trả về **ít hơn cỡ trang chuẩn nghĩa là trang cuối** — hệ thống ngừng tải ngay, không tốn thêm một lượt gọi trả về rỗng. Mục đã có trong danh sách không bị hiển thị trùng; trang mới tải về tôn trọng bộ lọc (Tất cả/Cá nhân/Nhóm) và từ khóa tìm kiếm đang áp dụng; khi danh sách được làm mới, việc phân trang bắt đầu lại từ đầu; lỗi mạng khi tải thêm không làm kẹt danh sách. | ✅ Hoàn thành |

Các Phase là tuần tự; Phase sau giữ nguyên kết quả của Phase trước.

## Mục đích

- Bảo đảm mọi lối vào "nhắn tin trực tiếp" (thẻ Quick Chat trong nhóm, chuyển tiếp
  tin nhắn, nút Message) luôn dẫn tới đúng hội thoại 1-1 đã tồn tại giữa hai người,
  kể cả khi hội thoại đó chưa được tải trong danh sách chat phân trang.
- Danh sách chat tải thêm khi cuộn hoạt động ổn định, không trùng mục, không kẹt.

## Phạm vi

- Luồng mở/khởi tạo hội thoại trực tiếp từ mọi lối vào hiện có.
- Hành vi tải thêm (load more) của danh sách chat.
- Không thay đổi luồng gửi tin trong hội thoại đang mở, không đổi quan hệ bạn bè.

## Hành vi nghiệp vụ

1. **Bấm Message (chỉ mở xem hội thoại):**
   - Hội thoại 1-1 đã hiện trong danh sách → vào thẳng, vị trí trong danh sách giữ nguyên.
   - Chưa thấy → hệ thống tự tải thêm từng trang danh sách đến khi thấy hội thoại
     (hoặc hết danh sách), rồi vào đúng hội thoại đó và **giữ nguyên vị trí** —
     không đẩy lên đầu vì không có tin nhắn mới.
   - Hết danh sách vẫn không có → khởi tạo hội thoại mới, đưa lên đầu danh sách.
   - Sau khi vào hội thoại, danh sách chat **tự cuộn** để đưa hội thoại đang mở vào
     vùng nhìn thấy (căn giữa), giống như khi bấm trực tiếp vào hội thoại trong danh
     sách — kể cả khi hội thoại nằm sâu do vừa được tải thêm.
2. **Gửi tin nhanh (hoặc chuyển tiếp) cho một người:**
   - Cách tìm hội thoại giống hệt Message (kể cả tự tải thêm trang).
   - Khác biệt: vì có tin nhắn mới, hội thoại được **đẩy lên đầu** danh sách.
   - Hội thoại cũ: lịch sử được giữ nguyên và nạp đầy đủ; tin vừa gửi nối tiếp vào cuối.
   - Hội thoại mới: mở hội thoại chỉ có tin vừa gửi.
   - Điều hướng luôn dùng định danh thật của hội thoại (không còn định danh tạm).
3. **Danh sách chat:** cuộn gần cuối → tải trang kế; mục trùng bị loại; kết quả mới
   tuân theo bộ lọc và tìm kiếm đang chọn; trang trả về ít hơn cỡ trang chuẩn được
   hiểu là trang cuối và ngừng tải thêm ngay.

## Input / Output

- **Input**: người nhận được chọn, nội dung tin gửi nhanh/chuyển tiếp; thao tác cuộn
  danh sách chat.
- **Output**: điều hướng vào đúng hội thoại 1-1 (cũ hoặc mới) với lịch sử đầy đủ;
  danh sách chat nối dài thêm các hội thoại cũ hơn.

## Quy tắc validate

- Không gửi tin rỗng (giữ nguyên quy tắc hiện có ở từng lối vào).
- Không tải thêm khi đã hết dữ liệu hoặc đang có lượt tải chưa xong.

## Trường hợp đặc biệt

- Hội thoại cũ nằm ở trang chưa tải của danh sách → danh sách được tự động tải thêm
  đến khi hội thoại xuất hiện; mở xem giữ nguyên vị trí, gửi tin mới đẩy lên đầu.
- Dữ liệu tồn tại hai hội thoại 1-1 trùng nhau giữa hai người (do lỗi lịch sử) →
  hệ thống luôn hội tụ về hội thoại cũ nhất, không báo lỗi.
- Chuyển tiếp tin cho người có hội thoại cũ chưa tải → lịch sử hội thoại đó không bị
  ảnh hưởng; tin chuyển tiếp xuất hiện khi mở hội thoại.
- Đang lọc "Nhóm" hoặc đang tìm kiếm mà cuộn tải thêm → chỉ các mục khớp bộ lọc/từ
  khóa mới hiện ra thêm.

## Hạn chế

- Tin gửi kèm lệnh khởi tạo hội thoại được lưu bất đồng bộ phía máy chủ; trong
  khoảnh khắc rất ngắn sau khi gửi, thiết bị khác của cùng tài khoản có thể chưa
  thấy tin này cho tới khi đồng bộ xong.
- Việc tự tải thêm khi tìm hội thoại có giới hạn số trang liên tiếp (an toàn cho
  tài khoản có rất nhiều hội thoại); vượt giới hạn thì hệ thống chuyển sang hỏi
  thẳng máy chủ để vẫn vào đúng hội thoại.
- Người dùng có ít hội thoại hơn một trang chuẩn sẽ không phát sinh lượt tải thêm
  nào (nhận biết trang cuối ngay từ lần tải đầu).
- Mở/nhắn với người **chưa từng trò chuyện**: để chắc chắn không tạo trùng một hội
  thoại cũ đang nằm ở trang chưa tải, hệ thống phải duyệt lần lượt các trang danh
  sách đến hết rồi mới khởi tạo hội thoại mới. Với tài khoản có nhiều hội thoại,
  thao tác đầu tiên với một người mới vì thế mất thêm thời gian (nhiều lượt tải nối
  tiếp). Hướng cải thiện triệt để (**chưa triển khai**): tra cứu hội thoại trực tiếp
  theo người dùng ở phía máy chủ để bỏ hẳn bước duyệt danh sách.
- Khi **gửi tin nhanh** cho hội thoại nằm ở trang **chưa tải**, sau khi bấm gửi có
  thể có một nhịp ngắn chưa thấy phản hồi (ô nhập đã xóa nội dung nhưng chưa chuyển
  vào hội thoại) trong lúc hệ thống định vị hội thoại. Thao tác **Message** có chỉ
  báo đang xử lý, còn gửi tin nhanh hiện chưa có chỉ báo này.
