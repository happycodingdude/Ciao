import { useMemo, useState } from "react";
import { FriendItemProps } from "../../types/base.types";
import { ContactModel } from "../../types/friend.types";
import ConnectionContact from "./ConnectionContact";
import ConnectionEmpty from "./ConnectionEmpty";

type Props = {
  contacts: ContactModel[];
  friendAction?: FriendItemProps["friendAction"];
  // Hiện ô lọc theo tên (client-side) — chỉ dùng cho tab "All".
  searchable?: boolean;
  emptyIcon: string;
  emptyTitle: string;
  emptyHint?: string;
};

const ConnectionFriendList = ({
  contacts,
  friendAction,
  searchable,
  emptyIcon,
  emptyTitle,
  emptyHint,
}: Props) => {
  const [keyword, setKeyword] = useState("");

  const filtered = useMemo(() => {
    if (!searchable) return contacts;
    const q = keyword.trim().toLowerCase();
    if (!q) return contacts;
    return contacts.filter((c) => (c.name ?? "").toLowerCase().includes(q));
  }, [contacts, keyword, searchable]);

  return (
    <div className="flex flex-col gap-3">
      {searchable && contacts.length > 0 && (
        <div className="relative">
          <i className="fa-solid fa-magnifying-glass text-(--text-main-color-blur) pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xs" />
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Search friends"
            className="bg-(--bg-color-extrathin) text-(--text-main-color) w-full rounded-full border border-(--border-color) py-2.5 pl-10 pr-4 text-sm outline-none focus:border-(--main-color-bold)"
          />
        </div>
      )}

      {filtered.length === 0 ? (
        keyword.trim() ? (
          <ConnectionEmpty
            icon="fa-magnifying-glass"
            title="No matches"
            hint={`No friends named "${keyword.trim()}".`}
          />
        ) : (
          <ConnectionEmpty icon={emptyIcon} title={emptyTitle} hint={emptyHint} />
        )
      ) : (
        <div className="bg-(--bg-color) flex flex-col rounded-2xl border border-(--border-color) p-2 overflow-y-auto">
          {filtered.map((contact) => (
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
