import { useState } from "react";

import { ConversationLinkItem } from "../../types/bookmark.types";
import { AttachmentModel } from "../../types/message.types";
import { resolveLinkPreviewImageSrc } from "../../utils/linkPreview";

// Item hiển thị dùng chung giữa panel Attachment (4 tab) và các section preview
// trong Information — giữ 1 nguồn markup để 2 nơi không lệch UI.

export const formatBytes = (bytes?: number) => {
  if (!bytes || bytes <= 0) return "";
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let i = 0;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i++;
  }
  return `${value >= 10 || i === 0 ? Math.round(value) : value.toFixed(1)} ${units[i]}`;
};

// Row file: icon + tên + size, click mở/tải file.
export const FileRow = ({ item }: { item: AttachmentModel }) => {
  const size = formatBytes(item.mediaSize);
  return (
    <a
      href={item.mediaUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="hover:bg-(--bg-color-extrathin) flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2"
    >
      <div className="bg-(--bg-color-extrathin) flex aspect-square w-8 shrink-0 items-center justify-center rounded-lg">
        <i className="fa fa-file text-(--text-main-color-normal) font-light"></i>
      </div>
      <div className="flex min-w-0 grow flex-col">
        <p className="text-2xs truncate font-medium">
          {item.mediaName ?? "File"}
        </p>
        {size && (
          <p className="text-3xs text-(--text-main-color-blur)">{size}</p>
        )}
      </div>
    </a>
  );
};

// url do server extract từ nội dung tin — vẫn guard parse để 1 URL dị dạng không crash cả list.
const hostnameOf = (url: string) => {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
};

// Row liên kết: thumbnail + title + siteName — layout đồng bộ row của InformationBookmark.
export const LinkRow = ({ item }: { item: ConversationLinkItem }) => {
  // imageUrl là path proxy tương đối qua BE — phải resolve về host BE, không để
  // trình duyệt resolve nhầm về origin FE. Ảnh tải lỗi → fallback icon link.
  const [imageFailed, setImageFailed] = useState(false);
  const imageSrc = resolveLinkPreviewImageSrc(item.imageUrl);
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="hover:bg-(--bg-color-extrathin) flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2"
    >
      {imageSrc && !imageFailed ? (
        <img
          src={imageSrc}
          alt=""
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setImageFailed(true)}
          className="aspect-square w-8 shrink-0 rounded-lg object-cover"
        />
      ) : (
        <div className="bg-(--bg-color-extrathin) flex aspect-square w-8 shrink-0 items-center justify-center rounded-lg">
          <i className="fa fa-link text-(--text-main-color-normal) font-light"></i>
        </div>
      )}
      <div className="flex min-w-0 grow flex-col">
        <p className="text-2xs truncate font-medium">
          {item.title || item.url}
        </p>
        <p className="text-3xs text-(--text-main-color-blur) truncate">
          {item.siteName || hostnameOf(item.url)}
        </p>
      </div>
    </a>
  );
};

// Thumbnail video: preload metadata cho frame đầu + overlay nút play.
// Lightbox hiện chỉ hỗ trợ ảnh nên click mở mediaUrl ở tab mới.
export const VideoThumb = ({ item }: { item: AttachmentModel }) => {
  return (
    <a
      href={item.mediaUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="relative block aspect-square w-full cursor-pointer overflow-hidden rounded-2xl"
      title={item.mediaName}
    >
      <video
        src={item.mediaUrl}
        preload="metadata"
        muted
        playsInline
        className="h-full w-full object-cover"
      />
      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
        <div className="flex aspect-square w-8 items-center justify-center rounded-full bg-black/50">
          <i className="fa fa-play text-2xs relative left-[.05rem] text-white"></i>
        </div>
      </div>
    </a>
  );
};
