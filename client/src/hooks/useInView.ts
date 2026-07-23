import { useEffect, useRef, useState } from "react";

// Lazy-load theo viewport cho các section trong panel Information (panel LUÔN mounted,
// chỉ ẩn bằng z-index/width). Gắn `ref` vào phần tử mốc của section; `inView` latch = true
// LẦN ĐẦU section lọt vào vùng nhìn rồi GIỮ NGUYÊN (không refetch/nháy khi cuộn qua lại).
//
// IntersectionObserver tính CẢ phần bị clip bởi scroll-container cha, nên section nằm dưới
// "fold" của panel = chưa nhìn thấy → inView=false → query gate theo cờ này sẽ không gọi API
// cho tới khi user cuộn tới. rootMargin dương để prefetch ngay trước khi section hiện ra
// (mượt, không phải chờ spinner) nhưng vẫn bỏ qua các section còn ở xa.
//
// resetKey (thường là conversationId): đổi → reset latch + observe lại từ đầu. Nhờ vậy khi
// chuyển hội thoại, section dưới fold của hội thoại mới KHÔNG bị gọi API sớm theo latch cũ.
const useInView = <T extends HTMLElement>(
  resetKey?: unknown,
  rootMargin = "150px",
) => {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    setInView(false);
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true);
          observer.disconnect(); // latch: quan sát 1 lần là đủ
        }
      },
      { rootMargin },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [resetKey, rootMargin]);

  return [ref, inView] as const;
};

export default useInView;
