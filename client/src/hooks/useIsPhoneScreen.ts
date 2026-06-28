import { useSyncExternalStore } from "react";

// Phiên bản reactive của isPhoneScreen(): tự cập nhật khi resize / xoay màn hình.
// Dùng useSyncExternalStore để tránh re-render thừa và an toàn SSR.
const subscribe = (callback: () => void) => {
  window.addEventListener("resize", callback);
  return () => window.removeEventListener("resize", callback);
};

const getSnapshot = () => window.innerWidth < 768;

export const useIsPhoneScreen = () =>
  useSyncExternalStore(subscribe, getSnapshot, () => false);

export default useIsPhoneScreen;
