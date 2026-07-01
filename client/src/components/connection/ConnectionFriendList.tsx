import { useMemo, useState } from "react";
import { FriendItemProps } from "../../types/base.types";
import { ContactModel } from "../../types/friend.types";
import ConnectionContact from "./ConnectionContact";
import ConnectionEmpty from "./ConnectionEmpty";

type SortMode = "online" | "az";

type Props = {
  contacts: ContactModel[];
  friendAction?: FriendItemProps["friendAction"];
  // Hiện ô lọc theo tên (client-side) — chỉ dùng cho tab "All".
  searchable?: boolean;
  // Hiện toggle sắp xếp Online-first ↔ A-Z (group theo chữ cái) — chỉ tab "All".
  sortable?: boolean;
  emptyIcon: string;
  emptyTitle: string;
  emptyHint?: string;
};

const collator = new Intl.Collator(undefined, { sensitivity: "base" });
const byName = (a: ContactModel, b: ContactModel) =>
  collator.compare(a.name ?? "", b.name ?? "");

// Chữ cái nhóm cho chế độ A-Z; ký tự không phải A-Z gom vào "#".
const groupLetter = (contact: ContactModel) => {
  const first = (contact.name ?? "").trim().charAt(0).toUpperCase();
  return /[A-Z]/.test(first) ? first : "#";
};

const ConnectionFriendList = ({
  contacts,
  friendAction,
  searchable,
  sortable,
  emptyIcon,
  emptyTitle,
  emptyHint,
}: Props) => {
  const [keyword, setKeyword] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("online");

  const filtered = useMemo(() => {
    if (!searchable) return contacts;
    const q = keyword.trim().toLowerCase();
    if (!q) return contacts;
    return contacts.filter((c) => (c.name ?? "").toLowerCase().includes(q));
  }, [contacts, keyword, searchable]);

  const ordered = useMemo(() => {
    const base = [...filtered];
    if (sortMode === "az") return base.sort(byName);
    // Online-first: online lên đầu, trong mỗi nhóm sort theo tên.
    return base.sort((a, b) => {
      const ao = a.isOnline ? 0 : 1;
      const bo = b.isOnline ? 0 : 1;
      return ao !== bo ? ao - bo : byName(a, b);
    });
  }, [filtered, sortMode]);

  // Chỉ group khi A-Z; mỗi group = 1 header chữ cái sticky + danh sách contact.
  const groups = useMemo(() => {
    if (sortMode !== "az") return null;
    const map = new Map<string, ContactModel[]>();
    for (const c of ordered) {
      const key = groupLetter(c);
      (map.get(key) ?? map.set(key, []).get(key)!).push(c);
    }
    return [...map.entries()];
  }, [ordered, sortMode]);

  const showControls = contacts.length > 0 && (searchable || sortable);

  return (
    <div className="flex h-full flex-col gap-3">
      {showControls && (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {searchable && (
            <div className="relative min-w-[12rem] grow">
              <i className="fa-solid fa-magnifying-glass text-(--text-main-color-blur) pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xs" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Search friends"
                className="bg-(--bg-color-extrathin) text-(--text-main-color) border-(--border-color) w-full rounded-full border py-2.5 pl-10 pr-4 text-sm outline-none focus:border-light-blue-500"
              />
            </div>
          )}

          {sortable && (
            <div className="bg-(--bg-color-extrathin) border-(--border-color) flex shrink-0 rounded-full border p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setSortMode("online")}
                className={`rounded-full px-3 py-1.5 transition-colors ${
                  sortMode === "online"
                    ? "bg-light-blue-500 font-medium text-white"
                    : "text-(--text-main-color)"
                }`}
              >
                <i className="fa-solid fa-bolt mr-1" />
                Online
              </button>
              <button
                type="button"
                onClick={() => setSortMode("az")}
                className={`rounded-full px-3 py-1.5 transition-colors ${
                  sortMode === "az"
                    ? "bg-light-blue-500 font-medium text-white"
                    : "text-(--text-main-color)"
                }`}
              >
                A–Z
              </button>
            </div>
          )}
        </div>
      )}

      {ordered.length === 0 ? (
        keyword.trim() ? (
          <ConnectionEmpty
            icon="fa-magnifying-glass"
            title="No matches"
            hint={`No friends named "${keyword.trim()}".`}
          />
        ) : (
          <ConnectionEmpty
            icon={emptyIcon}
            title={emptyTitle}
            hint={emptyHint}
          />
        )
      ) : (
        <div className="bg-(--bg-color) hide-scrollbar border-(--border-color) flex min-h-0 flex-col overflow-y-auto rounded-2xl border p-2">
          {groups
            ? groups.map(([letter, items]) => (
                <div key={letter}>
                  <div className="bg-(--bg-color) text-(--text-main-color-blur) sticky top-0 z-10 px-3 py-1 text-xs font-semibold">
                    {letter}
                  </div>
                  {items.map((contact) => (
                    <ConnectionContact
                      key={contact.id}
                      contact={contact}
                      friendAction={friendAction}
                      showPresence
                    />
                  ))}
                </div>
              ))
            : ordered.map((contact) => (
                <ConnectionContact
                  key={contact.id}
                  contact={contact}
                  friendAction={friendAction}
                  showPresence
                />
              ))}
        </div>
      )}
    </div>
  );
};

export default ConnectionFriendList;
