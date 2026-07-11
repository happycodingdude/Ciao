// imageUrl từ BE là path proxy tương đối ("/api/v1/link-preview/image?...") — ảnh tải QUA BE
// để không lộ IP/tracking người xem cho server bên thứ 3. Ghép base host cho path tương đối;
// preview cũ (đã lưu URL tuyệt đối trước khi có proxy) vẫn tải trực tiếp (backward-compat).
export const resolveLinkPreviewImageSrc = (imageUrl?: string | null) => {
  if (!imageUrl) return undefined;
  return /^https?:\/\//i.test(imageUrl)
    ? imageUrl
    : `${import.meta.env.VITE_ASPNETCORE_CHAT_URL}${imageUrl}`;
};
