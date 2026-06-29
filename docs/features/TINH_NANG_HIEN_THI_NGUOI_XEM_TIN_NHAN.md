# Hiển thị trạng thái tin nhắn (đã gửi / đã nhận / đã xem)

## Mục đích

Hiển thị trạng thái đã gửi / đã nhận / đã xem của tin nhắn trong khung chat theo một quy tắc sản phẩm rõ ràng, tránh rối mắt.

## Quy tắc cốt lõi

> Chỉ hiển thị trạng thái khi **tin nhắn cuối cùng của hội thoại là của chính mình**. Mọi trường hợp khác đều không hiển thị trạng thái nào.

Hệ quả:

- Tin của người khác → không bao giờ có trạng thái.
- Tin của mình nhưng **không phải** tin cuối hội thoại → không hiển thị (kể cả trước đó từng hiển thị).
- Tin của mình **là** tin cuối hội thoại (đã gửi xong, không còn đang chờ) → hiển thị trạng thái.

## Cách hiển thị

### Avatar người đã xem

- Áp dụng khi tin cuối là của mình. Mỗi người khác đã xem tới tin cuối → hiện avatar nhỏ dưới tin đó.
- 1 người đã xem → 1 avatar.
- Nhóm nhiều người đã xem → tối đa 3 avatar, dư thì "+N".

### Khi chưa ai xem tin cuối

- **1-1:** hiển thị "Đã gửi" (chưa nhận) hoặc "Đã nhận" (đối phương đã nhận nhưng chưa xem).
- **Nhóm:** chỉ hiển thị "Đã gửi".
- Avatar người đã xem được ưu tiên hơn icon: một tin chỉ hiển thị một trong hai.

### Tin đang chờ gửi

- Tin của mình đang trong quá trình gửi (chưa hoàn tất) → chưa hiển thị trạng thái nào cho tới khi gửi xong.

## Bảng tình huống

| Tình huống | Hiển thị đúng |
|---|---|
| Mình gửi "A", chưa ai xem | "Đã gửi" dưới "A" |
| Mình gửi "A", bạn đã xem | Avatar bạn dưới "A" |
| Mình gửi "A", rồi bạn gửi "B" | Không hiển thị gì (tin cuối là của bạn) |
| Mình "A" → bạn "B" → mình "C" (chưa xem) | "Đã gửi" dưới "C" |
| Mình "A" → mình "B", bạn đã xem | Avatar bạn dưới "B"; "A" để trống |
| Bạn gửi (mình chưa gửi gì) | Không hiển thị gì |
| Mình "A" đang chờ gửi | Không hiển thị; chờ gửi xong |
| Nhóm: tin cuối "Y" của mình, B đã xem | Avatar B dưới "Y" |

## Hạn chế

- Hiện chưa phân biệt "Đã nhận" theo từng thành viên trong nhóm (chỉ áp dụng cho trò chuyện 1-1).
