import { useState } from "react";
import { LinkPreviewModel } from "../../types/message.types";
import { resolveLinkPreviewImageSrc } from "../../utils/linkPreview";

// Thẻ xem trước liên kết (tin text có URL). Bấm vào mở link ở tab mới.
// Ảnh lỗi tải → tự ẩn (fallback), thẻ vẫn hiển thị tiêu đề/mô tả/tên miền.
const LinkPreviewCard = ({
  preview,
  mine,
}: {
  preview?: LinkPreviewModel | null;
  mine?: boolean;
}) => {
  const [imageFailed, setImageFailed] = useState(false);

  if (!preview?.url) return null;

  const host = (() => {
    try {
      return new URL(preview.url).host;
    } catch {
      return preview.siteName ?? preview.url;
    }
  })();

  const imageSrc = resolveLinkPreviewImageSrc(preview.imageUrl);

  const showImage = !!imageSrc && !imageFailed;

  return (
    <a
      href={preview.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`mt-1 flex w-72 max-w-[75vw] flex-col overflow-hidden rounded-xl border border-(--border-color) bg-(--bubble-bg) shadow-[0_2px_10px_rgba(0,0,0,0.08)] transition hover:shadow-[0_4px_14px_rgba(0,0,0,0.14)]
        ${mine ? "self-end" : "self-start"}`}
    >
      {showImage && (
        <img
          src={imageSrc}
          alt={preview.title ?? host}
          referrerPolicy="no-referrer"
          loading="lazy"
          onError={() => setImageFailed(true)}
          className="max-h-40 w-full object-cover"
        />
      )}
      <div className="flex min-w-0 flex-col gap-1 px-3 py-2">
        <p className="text-3xs flex items-center gap-1 uppercase tracking-wide text-(--text-main-color-blur)">
          <i className="fa-solid fa-link shrink-0" />
          <span className="truncate">{preview.siteName || host}</span>
        </p>
        {preview.title && (
          <p className="line-clamp-2 font-medium text-(--text-main-color)">
            {preview.title}
          </p>
        )}
        {preview.description && (
          <p className="text-2xs line-clamp-2 text-(--text-main-color-blur)">
            {preview.description}
          </p>
        )}
      </div>
    </a>
  );
};

export default LinkPreviewCard;
