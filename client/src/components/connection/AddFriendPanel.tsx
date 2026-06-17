import { debounce } from "lodash-es";
import { useCallback, useMemo, useState } from "react";
import { getContacts } from "../../services/friend.service";
import { ContactModel } from "../../types/friend.types";
import ConnectionContact from "./ConnectionContact";
import ConnectionEmpty from "./ConnectionEmpty";

type Props = {
  // Gọi sau khi gửi/huỷ lời mời để friend cache refetch → tab Requests phản ánh ngay.
  onChanged?: () => void;
};

const AddFriendPanel = ({ onChanged }: Props) => {
  const [keyword, setKeyword] = useState("");
  const [contacts, setContacts] = useState<ContactModel[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchContacts = useCallback(async (name: string) => {
    if (!name.trim()) {
      setContacts([]);
      setLoading(false);
      return;
    }
    try {
      const result = await getContacts(name);
      setContacts(result ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  const debouncedFetch = useMemo(
    () => debounce(fetchContacts, 300),
    [fetchContacts],
  );

  const onSearch = (value: string) => {
    setKeyword(value);
    setLoading(!!value.trim());
    debouncedFetch(value);
  };

  // Cập nhật trạng thái nút ngay trên item vừa thao tác + báo cha refetch friend cache.
  const handleFriendAction = (
    id?: string | null,
    status?: "friend" | "request_sent" | "request_received" | "new" | null,
    userId?: string | null,
  ) => {
    setContacts((current) =>
      current.map((c) =>
        c.id !== userId
          ? c
          : ({ ...c, friendId: id, friendStatus: status } as ContactModel),
      ),
    );
    onChanged?.();
  };

  const trimmed = keyword.trim();

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <i className="fa-solid fa-magnifying-glass text-(--text-main-color-blur) pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xs" />
        <input
          type="text"
          value={keyword}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search people by name"
          className="bg-(--bg-color-extrathin) text-(--text-main-color) w-full rounded-full border border-(--border-color) py-2.5 pl-10 pr-4 text-sm outline-none focus:border-(--main-color-bold)"
        />
      </div>

      {!trimmed ? (
        <ConnectionEmpty
          icon="fa-user-plus"
          title="Find new friends"
          hint="Type a name to search and send a friend request."
        />
      ) : loading ? (
        <ConnectionEmpty icon="fa-spinner" title="Searching…" />
      ) : contacts.length === 0 ? (
        <ConnectionEmpty
          icon="fa-magnifying-glass"
          title="No people found"
          hint={`No one matches "${trimmed}".`}
        />
      ) : (
        <div className="bg-(--bg-color) flex flex-col rounded-2xl border border-(--border-color) p-2">
          {contacts.map((contact) => (
            <ConnectionContact
              key={contact.id}
              contact={contact}
              friendAction={handleFriendAction}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AddFriendPanel;
