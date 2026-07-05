// Preview text hiển thị ở danh sách hội thoại (lastMessage) theo loại tin.
// PHẢI đồng bộ với BE AppConstants.BuildLastMessagePreview để optimistic (gửi đi) và
// realtime (nhận về) khớp với dữ liệu server trả khi refetch.

export const STICKER_PREVIEW = "[Nhãn dán]";
export const GIF_PREVIEW = "[GIF]";
export const POLL_PREVIEW_PREFIX = "[Bình chọn] ";
export const CONTACT_PREVIEW_PREFIX = "[Danh bạ] ";

export const getMessagePreviewText = (
  type: string | undefined,
  content: string | null | undefined,
  attachmentNames?: (string | undefined | null)[],
): string => {
  switch (type) {
    case "media":
      return (attachmentNames ?? []).filter(Boolean).join(",");
    case "sticker":
      return STICKER_PREVIEW;
    case "gif":
      return GIF_PREVIEW;
    case "poll":
      return POLL_PREVIEW_PREFIX + (content ?? "");
    case "contact":
      return CONTACT_PREVIEW_PREFIX + (content ?? "");
    default:
      // text / system
      return content ?? "";
  }
};
