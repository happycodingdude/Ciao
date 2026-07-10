import { StarFilled, StarOutlined } from "@ant-design/icons";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type Props = {
  favorited: boolean;
  pinning: boolean;
  onToggleFavorite: () => void;
  // Báo cho item cha biết menu đang mở để giữ nút ba chấm hiển thị (ẩn badge thời gian).
  onOpenChange?: (open: boolean) => void;
};

const MENU_W = 208; // w-52
const MENU_H = 48; // ước lượng để tính flip-up (sẽ tăng khi thêm item mới)

// Menu ba chấm của mỗi hội thoại — chứa các hành động với hội thoại (trước mắt: Favorites).
// Popover render qua portal (position fixed) để không bị overflow của khung danh sách cắt,
// cùng pattern với UnfriendMenu bên trang Connections.
const ConversationItemMenu = ({
  favorited,
  pinning,
  onToggleFavorite,
  onOpenChange,
}: Props) => {
  const [open, setOpenState] = useState(false);
  const setOpen = (next: boolean) => {
    setOpenState(next);
    onOpenChange?.(next);
  };
  const [pos, setPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);

  const openMenu = () => {
    const rect = btnRef.current?.getBoundingClientRect();
    if (!rect) return;
    // Mở bên phải icon; nếu tràn phải viewport → lật sang trái.
    let left = rect.right + 8;
    if (left + MENU_W > window.innerWidth - 8) left = rect.left - MENU_W - 8;
    const top = Math.max(
      8,
      Math.min(rect.top, window.innerHeight - MENU_H - 8),
    );
    setPos({ top, left });
    setOpen(true);
  };

  // Popover dùng fixed theo viewport (không reposition) → đóng khi scroll/resize cho an toàn.
  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [open]);

  return (
    <>
      {/* stopPropagation + preventDefault để không điều hướng vào hội thoại */}
      <button
        ref={btnRef}
        type="button"
        aria-label="Tùy chọn hội thoại"
        className={`text-(--text-main-color-blur) bg-(--bg-color-extrathin) absolute right-2 top-2 z-10 flex aspect-square w-7 items-center justify-center rounded-full transition-opacity
          ${open ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          open ? setOpen(false) : openMenu();
        }}
      >
        <i className="fa-solid fa-ellipsis" />
      </button>

      {open &&
        createPortal(
          <>
            <button
              type="button"
              className="fixed inset-0 z-[60] cursor-default"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setOpen(false);
              }}
              tabIndex={-1}
              aria-hidden
            />
            <div
              style={{ position: "fixed", top: pos.top, left: pos.left, width: MENU_W }}
              className="bg-(--bg-color) z-[61] rounded-xl border border-(--border-color) p-1.5 shadow-lg"
            >
              <button
                type="button"
                disabled={pinning}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onToggleFavorite();
                  setOpen(false);
                }}
                className="text-(--text-main-color) hover:bg-(--bg-color-extrathin) flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs disabled:opacity-50"
              >
                {favorited ? (
                  <StarFilled style={{ color: "#eab308" }} />
                ) : (
                  <StarOutlined className="text-(--text-main-color-blur)" />
                )}
                {favorited ? "Bỏ khỏi Favorites" : "Thêm vào Favorites"}
              </button>
              {/* Các hành động khác với hội thoại sẽ được thêm vào đây */}
            </div>
          </>,
          document.body,
        )}
    </>
  );
};

export default ConversationItemMenu;
