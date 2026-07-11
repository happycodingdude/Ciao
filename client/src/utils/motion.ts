// Tùy chọn "giảm chuyển động" của hệ điều hành/trình duyệt.
// Dùng cho asset động không điều khiển được bằng CSS (APNG, Lottie):
// bật reduce → hiển thị bản tĩnh thay thế.
export const prefersReducedMotion = (): boolean =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;
