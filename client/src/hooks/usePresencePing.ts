import { useEffect, useRef } from "react";
import HttpRequest from "../lib/fetch";

const PING_INTERVAL = 30000; // 30s

export function usePresencePing() {
  const intervalRef = useRef<number | null>(null);

  const ping = () => {
    HttpRequest<undefined, undefined>({
      method: "get",
      url: import.meta.env.VITE_ENDPOINT_CONTACT_PRESENCE_PING,
    }).catch(() => {});
  };

  const start = () => {
    // Đã có interval chạy → không tạo thêm (tránh duplicate ping)
    if (intervalRef.current) return;

    ping(); // Ping ngay khi tab được focus để cập nhật trạng thái online tức thì

    intervalRef.current = window.setInterval(ping, PING_INTERVAL);
  };

  const stop = () => {
    // Không có interval nào đang chạy → không cần cleanup
    if (!intervalRef.current) return;

    clearInterval(intervalRef.current);
    intervalRef.current = null;
  };

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        // Tab được focus lại → bắt đầu ping để cập nhật online status
        start();
      } else {
        // Tab bị ẩn/minimized → dừng ping để tiết kiệm request
        stop();
      }
    };

    handleVisibility(); // Chạy ngay lần đầu để handle trạng thái hiện tại của tab

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      stop();
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);
}
