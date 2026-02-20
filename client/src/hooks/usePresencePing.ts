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
    if (intervalRef.current) return;

    ping(); // ping ngay khi focus

    intervalRef.current = window.setInterval(ping, PING_INTERVAL);
  };

  const stop = () => {
    if (!intervalRef.current) return;

    clearInterval(intervalRef.current);
    intervalRef.current = null;
  };

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        start();
      } else {
        stop();
      }
    };

    // chạy lần đầu
    handleVisibility();

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      stop();
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);
}
