import { useState } from "react";
import LottiePlayer from "../common/LottiePlayer";

// Render tin nhắn sticker: ảnh lớn, KHÔNG bọc bong bóng (theo yêu cầu nghiệp vụ).
// Sticker động (.tgs — Telegram Animated Sticker) phát bằng LottiePlayer (tự pause
// khi ngoài viewport, tĩnh khi bật "giảm chuyển động"); còn lại render <img> tĩnh.
// Fallback placeholder khi sticker không tải được.
const StickerMessage = ({ src }: { src?: string | null }) => {
  const [error, setError] = useState(false);

  const placeholder = (
    <div className="flex h-28 w-28 items-center justify-center rounded-2xl bg-(--toolbar-btn-bg) text-(--text-main-color-blur)">
      <i className="fa-regular fa-face-smile text-3xl" />
    </div>
  );

  if (!src || error) return placeholder;

  // Nhận diện theo phần mở rộng — id sticker là đường dẫn asset trong registry.
  if (src.endsWith(".tgs") || src.endsWith(".json")) {
    return (
      <LottiePlayer
        src={src}
        className="laptop:h-28 laptop:w-28 laptop-lg:h-32 laptop-lg:w-32 select-none"
        fallback={placeholder}
      />
    );
  }

  return (
    <img
      src={src}
      alt="sticker"
      draggable={false}
      onError={() => setError(true)}
      className="laptop:h-28 laptop:w-28 laptop-lg:h-32 laptop-lg:w-32 select-none object-contain"
    />
  );
};

export default StickerMessage;
