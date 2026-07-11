import type { AnimationItem } from "lottie-web";
import { ReactNode, useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "../../utils/motion";

// Trình phát Lottie dùng chung cho mọi Animation Pack (sticker .tgs, hiệu ứng trang trí).
// - Lazy: lottie-web (bản light) + fflate chỉ import khi component thực sự render
//   → không vào bundle chính.
// - .tgs (sticker Telegram) = Lottie JSON nén gzip → tự nhận diện qua magic byte
//   và giải nén; file .json thường parse trực tiếp.
// - Cache animation data theo URL (module-level) → mở lại picker không refetch/parse lại.
// - Chỉ phát khi nằm trong viewport (IntersectionObserver) và tôn trọng
//   prefers-reduced-motion (đứng yên ở frame đầu).

type Props = {
  src: string;
  className?: string;
  loop?: boolean;
  // Hiển thị thay thế khi tải/parse lỗi — không để ô trống vỡ layout.
  fallback?: ReactNode;
};

const animationCache = new Map<string, Promise<unknown>>();

const loadAnimationData = (src: string): Promise<unknown> => {
  const cached = animationCache.get(src);
  if (cached) return cached;
  const promise = (async () => {
    const res = await fetch(src);
    if (!res.ok) throw new Error(`Failed to load animation ${src}: ${res.status}`);
    const buf = new Uint8Array(await res.arrayBuffer());
    // Magic gzip 1f 8b (.tgs hoặc bất kỳ payload nén nào) → giải nén trước khi parse.
    if (buf[0] === 0x1f && buf[1] === 0x8b) {
      const { gunzipSync } = await import("fflate");
      return JSON.parse(new TextDecoder().decode(gunzipSync(buf)));
    }
    return JSON.parse(new TextDecoder().decode(buf));
  })();
  // Lỗi mạng/parse → gỡ khỏi cache để lần render sau thử lại (không cache failure).
  promise.catch(() => animationCache.delete(src));
  animationCache.set(src, promise);
  return promise;
};

const LottiePlayer = ({ src, className, loop = true, fallback = null }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let disposed = false;
    let anim: AnimationItem | null = null;
    let observer: IntersectionObserver | null = null;

    (async () => {
      try {
        const [lottieModule, data] = await Promise.all([
          import("lottie-web/build/player/lottie_light"),
          loadAnimationData(src),
        ]);
        if (disposed) return;
        anim = lottieModule.default.loadAnimation({
          container: el,
          renderer: "svg",
          loop,
          autoplay: false,
          animationData: data,
        });
        if (prefersReducedMotion()) {
          anim.goToAndStop(0, true);
          return;
        }
        // Chỉ phát khi trong viewport → nhiều sticker cùng lịch sử chat không đốt CPU nền.
        observer = new IntersectionObserver(
          ([entry]) => {
            if (!anim) return;
            if (entry.isIntersecting) anim.play();
            else anim.pause();
          },
          { threshold: 0.1 },
        );
        observer.observe(el);
      } catch (err) {
        console.error("Failed to load lottie animation: ", err);
        if (!disposed) setError(true);
      }
    })();

    return () => {
      disposed = true;
      observer?.disconnect();
      anim?.destroy();
      anim = null;
    };
  }, [src, loop]);

  if (error) return <>{fallback}</>;
  return <div ref={containerRef} className={className} />;
};

export default LottiePlayer;
