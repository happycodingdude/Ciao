import { useState } from "react";

// Render tin nhắn sticker: ảnh lớn, KHÔNG bọc bong bóng (theo yêu cầu nghiệp vụ).
// Fallback placeholder khi sticker không tải được.
const StickerMessage = ({ src }: { src?: string | null }) => {
  const [error, setError] = useState(false);

  if (!src || error) {
    return (
      <div className="flex h-28 w-28 items-center justify-center rounded-2xl bg-(--toolbar-btn-bg) text-(--text-main-color-blur)">
        <i className="fa-regular fa-face-smile text-3xl" />
      </div>
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
