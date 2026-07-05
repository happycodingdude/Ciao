import { useState } from "react";

// Render tin nhắn GIF: ảnh động, không bọc bong bóng. Fallback khi lỗi tải.
const GifMessage = ({ src }: { src?: string | null }) => {
  const [error, setError] = useState(false);

  if (!src || error) {
    return (
      <div className="flex h-32 w-44 items-center justify-center rounded-2xl bg-(--toolbar-btn-bg) text-(--text-main-color-blur)">
        <span className="text-sm font-bold">GIF</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt="gif"
      draggable={false}
      onError={() => setError(true)}
      className="laptop:max-w-56 laptop-lg:max-w-64 max-h-64 rounded-2xl object-contain"
    />
  );
};

export default GifMessage;
