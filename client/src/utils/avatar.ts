// Helper cho avatar fallback bằng initials khi không có/không load được ảnh.
// Deterministic theo tên → cùng một user luôn ra cùng chữ cái + màu.

/**
 * Lấy initials từ tên hiển thị.
 * - Bỏ qua các token thuần số (vd "Tri Nguyen 5" → "TN", không lấy "5").
 * - 1 token chữ → lấy 2 ký tự đầu.
 * - Nhiều token chữ → ký tự đầu của token đầu + token cuối.
 */
export const getInitials = (name?: string): string => {
  const cleaned = (name ?? "").trim();
  if (!cleaned) return "?";

  const words = cleaned.split(/\s+/).filter((w) => !/^\d+$/.test(w));
  if (words.length === 0) return cleaned.slice(0, 2).toUpperCase();

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  const first = words[0][0];
  const last = words[words.length - 1][0];
  return (first + last).toUpperCase();
};

/**
 * Sinh màu nền deterministic từ tên (HSL cố định S/L nên tương phản tốt
 * với chữ trắng ở cả light lẫn dark theme).
 */
export const avatarColor = (name?: string): string => {
  const source = (name ?? "?").trim();
  let hash = 0;
  for (let i = 0; i < source.length; i++) {
    hash = source.charCodeAt(i) + ((hash << 5) - hash);
    hash |= 0; // ép về 32-bit để tránh tràn số
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue} 55% 45%)`;
};
