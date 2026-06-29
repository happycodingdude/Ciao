# Banner thông báo trong ứng dụng + điều hướng khi bấm

## Mục đích

Khi người dùng đang mở ứng dụng, hiển thị thông báo dạng banner ngay trong ứng dụng cho các sự kiện quan trọng; bấm vào banner sẽ đưa người dùng tới đúng nơi liên quan.

## Các loại thông báo và hành vi

- **Tin nhắn mới:** nhóm → "ai đã gửi tin nhắn đến nhóm nào"; 1-1 → "ai đã gửi cho bạn". Bấm → mở hội thoại tương ứng.
- **Lời mời kết bạn:** "ai đã gửi cho bạn lời mời kết bạn". Bấm → mở trang Kết nối ở tab lời mời.
- **Cảm xúc (reaction) vào tin của bạn:** "ai đã thả cảm xúc gì vào tin nhắn của bạn". Bấm → mở hội thoại và cuộn tới đúng tin được thả cảm xúc.

## Quy tắc hiển thị

- Khi người dùng đã tắt thông báo đẩy → không hiển thị banner.
- Mỗi loại thông báo còn có công tắc bật/tắt riêng; chỉ hiển thị khi loại tương ứng đang bật.
- Khi người dùng đang ở trong trang trò chuyện → không hiển thị banner (tránh làm phiền khi đang chat); ở các trang khác vẫn hiển thị.
- Không hiển thị banner cho hành động của chính mình (ví dụ tự thả cảm xúc cho tin của mình).
- Thông báo cảm xúc chỉ hiển thị cho **chủ nhân của tin nhắn** được thả cảm xúc.

## Trường hợp đặc biệt

- Bấm banner cảm xúc nhưng tin đó quá cũ, chưa hiển thị trên màn hình → vẫn mở hội thoại nhưng có thể không cuộn tới được tin (không báo lỗi).

## Hạn chế

- Chỉ áp dụng khi người dùng đang mở ứng dụng. Khi cửa sổ ứng dụng đang ẩn/chạy nền, việc hiển thị thông báo do hệ điều hành/trình duyệt đảm nhiệm, không thuộc phạm vi này.
