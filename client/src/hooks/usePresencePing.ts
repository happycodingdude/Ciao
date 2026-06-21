import { useEffect, useRef } from "react";
import HttpRequest from "../lib/fetch";

// Presence threshold phía server = 60s. Phải ping < 60s để giữ "online".
// Ping đều 30s BẤT KỂ tab visible/hidden: "online" = app đang mở (kể cả tab nền),
// không phải "tab đang focus". Nếu chỉ ping khi visible, user mở app ở tab nền sẽ
// bị coi là offline sau 60s → friend hiển thị sai. Tab đóng hẳn → hết ping → tự offline (đúng).
const PING_INTERVAL = 30000; // 30s

export function usePresencePing() {
  const intervalRef = useRef<number | null>(null);
  // Guard chống double-ping của React StrictMode (dev mount→unmount→mount trên cùng instance →
  // ref persist nên chỉ ping tức thì 1 lần). Remount thật (logout/login) = instance mới → ping lại.
  const didInitialPing = useRef(false);

  useEffect(() => {
    const ping = () => {
      HttpRequest<undefined, undefined>({
        method: "get",
        url: import.meta.env.VITE_ENDPOINT_CONTACT_PRESENCE_PING,
      }).catch(() => {});
    };

    if (!didInitialPing.current) {
      didInitialPing.current = true;
      ping(); // Ping ngay khi mount để online tức thì
    }
    intervalRef.current = window.setInterval(ping, PING_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);
}
