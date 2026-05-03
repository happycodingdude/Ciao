import { useQueryClient } from "@tanstack/react-query";
import { debounce } from "lodash-es";
import { useCallback, useMemo, useRef } from "react";
import { useActiveConversation } from "../../hooks/useActiveConversation";
import useConversation from "../../hooks/useConversation";
import useEventListener from "../../hooks/useEventListener";
import useInfo from "../../hooks/useInfo";
import { getConversations } from "../../services/conv.service";
import "../../styles/listchat.css";
import { ConversationCache } from "../../types/conv.types";
import ConversationItem from "../conversation/ConversationItem";
import ListchatLoading from "../common/ListchatLoading";

const ListChatContainer = () => {
  const queryClient = useQueryClient();
  const activeConversationId = useActiveConversation();
  const { data: info } = useInfo();
  const { data: conversations, isLoading, isRefetching } = useConversation(1);

  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const refListConversation = useRef<HTMLDivElement>(null);
  const refPage = useRef<number>(1);
  const isFetching = useRef(false);
  const refHasMore = useRef<boolean>(true);

  // Khóa scroll khi đang append conversations để tránh nhảy vị trí
  const lockScroll = (el: HTMLElement) => {
    const lockedTop = el.scrollTop;
    const prevent = (e: Event) => { e.preventDefault(); el.scrollTop = lockedTop; };
    el.addEventListener("wheel", prevent, { passive: false });
    el.addEventListener("touchmove", prevent, { passive: false });
    return () => {
      el.removeEventListener("wheel", prevent);
      el.removeEventListener("touchmove", prevent);
    };
  };

  const fetchMoreConversations = useCallback(async () => {
    const el = refListConversation.current;
    if (!el) return;
    const unlock = lockScroll(el);
    const newConversations = await getConversations(refPage.current);
    queryClient.setQueryData(["conversation"], (old: ConversationCache) => ({
      ...old,
      // Append xuống cuối list (conversations cũ hơn)
      conversations: [...(old.conversations ?? []), ...(newConversations.conversations ?? [])],
      filterConversations: [
        ...(old.filterConversations ?? []),
        ...(newConversations.filterConversations ?? []),
      ],
    }));
    // Nếu server trả về 0 conversations → đã hết, không fetch thêm
    refHasMore.current = (newConversations.conversations?.length ?? 0) > 0;
    isFetching.current = false;
    requestAnimationFrame(() => unlock());
  }, [queryClient]);

  const debounceFetch = useMemo(
    () => debounce(fetchMoreConversations, 100),
    [fetchMoreConversations],
  );

  const handleScroll = useCallback(() => {
    const el = refListConversation.current;
    if (!el || isFetching.current || !conversations) return;

    const distanceFromBottom = el.scrollHeight - (el.scrollTop + el.clientHeight);
    // Khi cách đáy ≤ 50px và còn data → load trang tiếp
    if (distanceFromBottom <= 50 && refHasMore.current) {
      isFetching.current = true;
      refPage.current += 1;
      debounceFetch();
    }
  }, [debounceFetch]);

  useEventListener("scroll", handleScroll, refListConversation.current);

  // Hiển thị skeleton trong khi load lần đầu hoặc refetch
  if (isLoading || isRefetching) return <ListchatLoading />;

  const scrollToConversation = (id: string) => {
    const container = refListConversation.current;
    const item = itemRefs.current[id];
    if (!container || !item) return;
    // Căn giữa item được chọn trong viewport của list
    container.scrollTo({
      top: item.offsetTop - container.clientHeight / 2 + item.clientHeight / 2,
      behavior: "smooth",
    });
  };

  return (
    <div
      ref={refListConversation}
      className="relative flex min-h-0 flex-1 flex-col gap-6 overflow-y-scroll scroll-smooth p-2"
    >
      {(conversations?.filterConversations ?? [])
        // Chỉ hiển thị conversation mà user chưa rời/xóa (isDeleted = false)
        .filter((conv) =>
          (conv.members ?? []).some((m) => m.contact?.id === info?.id && !m.isDeleted),
        )
        .map((item) => (
          <ConversationItem
            key={item.id}
            item={item}
            selfId={info?.id}
            isActive={item.id === activeConversationId}
            itemRef={(el) => { if (item.id) itemRefs.current[item.id] = el; }}
            onClick={() => { if (item.id) scrollToConversation(item.id); }}
          />
        ))}
    </div>
  );
};

export default ListChatContainer;
