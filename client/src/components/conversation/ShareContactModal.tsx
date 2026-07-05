import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import useFriend from "../../hooks/useFriend";
import { ContactModel } from "../../types/friend.types";
import ListFriendLoading from "../common/ListFriendLoading";

type Props = {
  onPick: (contact: ContactModel) => void;
  onClose: () => void;
};

// Modal chọn một người bạn để chia sẻ thẻ danh bạ vào hội thoại hiện tại.
const ShareContactModal = ({ onPick, onClose }: Props) => {
  const { data, isLoading } = useFriend();
  const [query, setQuery] = useState("");

  const friends = useMemo(() => (data ?? []).map((f) => f.contact), [data]);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? friends.filter((c) => (c.name ?? "").toLowerCase().includes(q)) : friends;
  }, [friends, query]);

  // Portal ra body: tránh ancestor có transform khiến `fixed` không canh giữa viewport.
  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[80vh] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-(--modal-border-color) bg-(--bg-color) shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-(--modal-border-color) px-4 py-3">
          <p className="font-semibold text-(--text-main-color)">Chia sẻ danh bạ</p>
          <button type="button" onClick={onClose} className="cursor-pointer text-(--text-main-color-blur) hover:text-(--text-main-color)">
            <i className="fa fa-times" />
          </button>
        </div>

        <div className="p-3">
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm bạn bè…"
            className="w-full rounded-xl border border-(--modal-border-color) bg-(--search-bg-color) px-4 py-2 text-(--text-main-color) outline-none"
          />
        </div>

        <div className="hide-scrollbar flex-1 overflow-y-auto px-3 pb-3">
          {isLoading ? (
            <ListFriendLoading />
          ) : filtered.length === 0 ? (
            <p className="py-8 text-center text-(--text-main-color-blur)">Không có bạn bè phù hợp</p>
          ) : (
            filtered.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => onPick(c)}
                className="flex w-full items-center gap-3 rounded-xl p-2 text-left hover:bg-(--bg-color-extrathin)"
              >
                <img
                  src={
                    c.avatar ||
                    "https://ui-avatars.com/api/?name=" + encodeURIComponent(c.name || "U")
                  }
                  alt={c.name ?? ""}
                  className="h-10 w-10 shrink-0 rounded-full object-cover"
                />
                <span className="truncate font-medium text-(--text-main-color)">{c.name}</span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default ShareContactModal;
