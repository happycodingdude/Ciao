import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { removeFriend } from "../../services/friend.service";

type Props = {
  friendId?: string | null;
  // Gọi sau khi DELETE thành công để cập nhật cache (status → "new").
  onUnfriended?: () => void;
};

const POPOVER_W = 192; // w-48
const POPOVER_H = 104; // ước lượng để tính flip-up

// Huỷ kết bạn (DELETE /friends/{id}) — popover confirm render qua portal (position fixed) để
// KHÔNG bị `overflow-y-auto` của khung danh sách cắt. Mở NGANG với icon ba chấm.
const UnfriendMenu = ({ friendId, onUnfriended }: Props) => {
  const [open, setOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);

  const openMenu = () => {
    const rect = btnRef.current?.getBoundingClientRect();
    if (!rect) return;
    // Hiển thị ngang với icon: đặt popover bên trái icon; nếu tràn trái → lật sang phải.
    let left = rect.left - POPOVER_W - 8;
    if (left < 8) left = rect.right + 8;
    // Căn giữa theo chiều dọc với icon, chặn trong viewport.
    const top = Math.max(
      8,
      Math.min(rect.top + rect.height / 2 - POPOVER_H / 2, window.innerHeight - POPOVER_H - 8),
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

  const unfriend = async () => {
    if (!friendId || processing) return;
    setProcessing(true);
    try {
      await removeFriend(friendId);
      onUnfriended?.();
      setOpen(false);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={() => (open ? setOpen(false) : openMenu())}
        className="text-(--text-main-color-blur) hover:bg-(--bg-color-extrathin) flex aspect-square w-8 shrink-0 items-center justify-center rounded-full transition-colors"
        aria-label="More options"
      >
        <i className="fa-solid fa-ellipsis-vertical" />
      </button>

      {open &&
        createPortal(
          <>
            <button
              type="button"
              className="fixed inset-0 z-[60] cursor-default"
              onClick={() => setOpen(false)}
              tabIndex={-1}
              aria-hidden
            />
            <div
              style={{ position: "fixed", top: pos.top, left: pos.left, width: POPOVER_W }}
              className="bg-(--bg-color) z-[61] rounded-xl border border-(--border-color) p-3 shadow-lg"
            >
              <p className="text-(--text-main-color) pb-2 text-xs font-medium">
                Remove this friend?
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="text-(--text-main-color) hover:bg-(--bg-color-extrathin) flex-1 rounded-lg border border-(--border-color) py-1.5 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={unfriend}
                  disabled={processing}
                  className="bg-(--danger-text-color) flex-1 rounded-lg py-1.5 text-xs font-medium text-white disabled:opacity-50"
                >
                  {processing ? <i className="fa fa-spinner fa-spin" /> : "Unfriend"}
                </button>
              </div>
            </div>
          </>,
          document.body,
        )}
    </>
  );
};

export default UnfriendMenu;
