import { useQuery, useQueryClient } from "@tanstack/react-query";
import { debounce } from "lodash-es";
import { useCallback, useMemo, useState } from "react";
import useFriend from "../../hooks/useFriend";
import {
  getContacts,
  getFriendSuggestions,
} from "../../services/friend.service";
import {
  ContactModel,
  FriendCache,
  FriendSuggestion,
} from "../../types/friend.types";
import CustomLabel from "../common/CustomLabel";
import ImageWithLightBoxAndNoLazy from "../common/ImageWithLightBoxAndNoLazy";
import AddButton from "../friend/AddButton";
import ConnectionContact from "./ConnectionContact";
import ConnectionEmpty from "./ConnectionEmpty";

const AddFriendPanel = () => {
  const queryClient = useQueryClient();
  const [keyword, setKeyword] = useState("");
  const [contacts, setContacts] = useState<ContactModel[]>([]);
  const [loading, setLoading] = useState(false);
  // Ẩn ngay suggestion vừa gửi lời mời (tránh chờ refetch).
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  // Friend cache = single source of truth cho trạng thái quan hệ. Search results chỉ lấy
  // identity (name/avatar/bio) từ getContacts; status nút luôn phái sinh từ cache → realtime
  // (deny/cancel/unfriend) hay poll cập nhật cache thì nút Add/Cancel/Chat tự đúng.
  const { data: friendCache } = useFriend();

  const { data: suggestions = [], isLoading: suggestionsLoading } = useQuery({
    queryKey: ["friend-suggestions"],
    queryFn: () => getFriendSuggestions(),
    staleTime: 60_000,
  });

  const relByContactId = useMemo(() => {
    const m = new Map<
      string,
      { friendStatus?: ContactModel["friendStatus"]; friendId?: string | null }
    >();
    (friendCache ?? []).forEach((f) => {
      if (f.contact?.id)
        m.set(f.contact.id, {
          friendStatus: f.contact.friendStatus,
          friendId: f.contact.friendId,
        });
    });
    return m;
  }, [friendCache]);

  const displayedContacts = useMemo(
    () =>
      contacts.map((c) => {
        const rel = c.id ? relByContactId.get(c.id) : undefined;
        // Không có trong cache → không còn quan hệ → "new" (hiện nút Add).
        return rel
          ? { ...c, friendStatus: rel.friendStatus, friendId: rel.friendId }
          : { ...c, friendStatus: "new" as const, friendId: null };
      }),
    [contacts, relByContactId],
  );

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

  // Mọi thao tác (Add/Cancel/Chat) cập nhật trực tiếp friend cache ["friend"] → reconcile
  // tự đổi nút. Upsert khi gửi lời mời (new → request_sent); xoá khi huỷ/từ chối/unfriend.
  const handleFriendAction = (
    id?: string | null,
    status?: ContactModel["friendStatus"] | null,
    userId?: string | null,
  ) => {
    if (!userId) return;
    queryClient.setQueryData<FriendCache[]>(["friend"], (old) => {
      const list = old ?? [];
      if (!status || status === "new") {
        return list.filter((f) => f.contact?.id !== userId);
      }
      if (list.some((f) => f.contact?.id === userId)) {
        return list.map((f) =>
          f.contact?.id !== userId
            ? f
            : {
                ...f,
                contact: {
                  ...f.contact,
                  friendId: id ?? undefined,
                  friendStatus: status,
                },
              },
        );
      }
      const sc = contacts.find((c) => c.id === userId);
      if (!sc) return list;
      return [
        ...list,
        { contact: { ...sc, friendId: id ?? undefined, friendStatus: status } },
      ];
    });
  };

  const handleSuggestionAdded = (s: FriendSuggestion, friendId?: string) => {
    setAddedIds((prev) => new Set(prev).add(s.id));
    queryClient.setQueryData<FriendCache[]>(["friend"], (old) => {
      const list = old ?? [];
      if (list.some((f) => f.contact?.id === s.id)) return list;
      return [
        ...list,
        {
          contact: {
            id: s.id,
            name: s.name,
            avatar: s.avatar,
            isOnline: s.isOnline,
            friendId,
            friendStatus: "request_sent",
          },
        },
      ];
    });
  };

  const visibleSuggestions = useMemo(
    () => suggestions.filter((s) => !addedIds.has(s.id)),
    [suggestions, addedIds],
  );

  const trimmed = keyword.trim();

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="relative shrink-0">
        <i className="fa-solid fa-magnifying-glass text-(--text-main-color-blur) pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xs" />
        <input
          type="text"
          value={keyword}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search people by name"
          className="bg-(--bg-color-extrathin) text-(--text-main-color) w-full rounded-full border border-(--border-color) py-2.5 pl-10 pr-4 text-sm outline-none focus:border-(--main-color-bold)"
        />
      </div>

      {trimmed ? (
        loading ? (
          <ConnectionEmpty icon="fa-spinner" title="Searching…" />
        ) : displayedContacts.length === 0 ? (
          <ConnectionEmpty
            icon="fa-magnifying-glass"
            title="No people found"
            hint={`No one matches "${trimmed}".`}
          />
        ) : (
          <div className="bg-(--bg-color) hide-scrollbar flex min-h-0 flex-col overflow-y-auto rounded-2xl border border-(--border-color) p-2">
            {displayedContacts.map((contact) => (
              <ConnectionContact
                key={contact.id}
                contact={contact}
                friendAction={handleFriendAction}
              />
            ))}
          </div>
        )
      ) : suggestionsLoading ? (
        <ConnectionEmpty icon="fa-spinner" title="Loading suggestions…" />
      ) : visibleSuggestions.length === 0 ? (
        <ConnectionEmpty
          icon="fa-user-plus"
          title="Find new friends"
          hint="Type a name to search and send a friend request."
        />
      ) : (
        <div className="flex min-h-0 flex-col gap-2">
          <h2 className="text-(--text-main-color) flex shrink-0 items-center gap-2 text-sm font-semibold">
            <i className="fa-solid fa-user-group text-(--main-color-bold)" />
            People you may know
          </h2>
          <div className="bg-(--bg-color) hide-scrollbar flex min-h-0 flex-col overflow-y-auto rounded-2xl border border-(--border-color) p-2">
            {visibleSuggestions.map((s) => (
              <div
                key={s.id}
                className="hover:bg-(--bg-color-extrathin) flex items-center gap-4 rounded-2xl px-3 py-3"
              >
                <div className="relative shrink-0">
                  <ImageWithLightBoxAndNoLazy
                    src={s.avatar ?? undefined}
                    className="pointer-events-none aspect-square w-12"
                    circle
                    slides={[{ src: s.avatar ?? "" }]}
                  />
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 aspect-square w-3.5 rounded-full border-2 border-white
                      ${s.isOnline ? "bg-(--online-color)" : "bg-(--offline-color)"}`}
                  />
                </div>
                <div className="flex min-w-0 grow flex-col">
                  <CustomLabel
                    className="text-(--text-main-color) font-medium"
                    title={s.name}
                  />
                  <p className="text-(--text-main-color-normal) text-2xs">
                    {s.mutualCount} mutual friend{s.mutualCount === 1 ? "" : "s"}
                  </p>
                </div>
                <AddButton
                  id={s.id}
                  onClose={(friendId?: string) =>
                    handleSuggestionAdded(s, friendId)
                  }
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AddFriendPanel;
