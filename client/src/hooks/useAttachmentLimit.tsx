import { useEffect, useState } from "react";

export const useAttachmentLimit = () => {
  const [limit, setLimit] = useState(6); // Mặc định cho mobile/laptop nhỏ

  useEffect(() => {
    // Định nghĩa các mốc khớp với bộ resolution rem (1rem = 16px)
    const laptop = window.matchMedia("(min-width: 80rem)"); // 1280px
    const laptopLg = window.matchMedia("(min-width: 95rem)"); // 1520px
    const desktop = window.matchMedia("(min-width: 160rem)"); // 2560px

    const updateLimit = () => {
      if (desktop.matches) {
        setLimit(10);
      } else if (laptopLg.matches) {
        setLimit(8);
      } else {
        setLimit(6);
      }
    };

    updateLimit(); // Chạy lần đầu

    // Lắng nghe thay đổi màn hình
    laptop.addEventListener("change", updateLimit);
    laptopLg.addEventListener("change", updateLimit);
    desktop.addEventListener("change", updateLimit);

    return () => {
      laptop.removeEventListener("change", updateLimit);
      laptopLg.removeEventListener("change", updateLimit);
      desktop.removeEventListener("change", updateLimit);
    };
  }, []);

  return limit;
};
