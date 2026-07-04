import { useQueryClient } from "@tanstack/react-query";
import { debounce } from "lodash-es";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { useActiveConversation } from "../../hooks/useActiveConversation";
import useConversation from "../../hooks/useConversation";
import useEventListener from "../../hooks/useEventListener";
import useInfo from "../../hooks/useInfo";
import { getConversations } from "../../services/conv.service";
import "../../styles/listchat.css";
import { ConversationCache } from "../../types/conv.types";
import { appendConversationsPage } from "../../utils/conversationPaging";
import ListchatLoading from "../common/ListchatLoading";
import ConversationItem from "../conversation/ConversationItem";

const ListChatContainer = () => {
  const queryClient = useQueryClient();
  const activeConversationId = useActiveConversation();
  const { data: info } = useInfo();
  const { data: conversations, isLoading, isRefetching } = useConversation(1);

  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const refListConversation = useRef<HTMLDivElement>(null);
  const isFetching = useRef(false);

  // Khóa scroll khi đang append conversations để tránh nhảy vị trí
  const lockScroll = (el: HTMLElement) => {
    const lockedTop = el.scrollTop;
    const prevent = (e: Event) => {
      e.preventDefault();
      el.scrollTop = lockedTop;
    };
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
    try {
      // page/hasMore đọc từ cache (không dùng ref): refetch page 1 tạo cache mới
      // → paging tự reset về đầu, không bị "nhảy cóc" trang.
      const cached = queryClient.getQueryData<ConversationCache>(["conversation"]);
      const nextPage = (cached?.page ?? 1) + 1;
      const newConversations = await getConversations(nextPage);
      // Util dùng chung: dedup theo id + append đúng filter/search + set page/hasMore
      appendConversationsPage(
        queryClient,
        newConversations.conversations ?? [],
        nextPage,
        info?.id,
      );
    } finally {
      // Luôn mở khóa scroll + cho phép fetch tiếp kể cả khi request lỗi
      isFetching.current = false;
      requestAnimationFrame(() => unlock());
    }
  }, [queryClient, info?.id]);

  const debounceFetch = useMemo(
    () => debounce(fetchMoreConversations, 100),
    [fetchMoreConversations],
  );

  const handleScroll = useCallback(() => {
    const el = refListConversation.current;
    if (!el || isFetching.current) return;
    // hasMore đọc trực tiếp từ cache; undefined (chưa fetch thêm lần nào) = còn data
    const cached = queryClient.getQueryData<ConversationCache>(["conversation"]);
    if (!cached || cached.hasMore === false) return;

    const distanceFromBottom =
      el.scrollHeight - (el.scrollTop + el.clientHeight);
    // Khi cách đáy ≤ 50px và còn data → load trang tiếp
    if (distanceFromBottom <= 50) {
      isFetching.current = true;
      debounceFetch();
    }
  }, [debounceFetch, queryClient]);

  useEventListener("scroll", handleScroll, refListConversation.current);

  const scrollToConversation = useCallback((id: string) => {
    const container = refListConversation.current;
    const item = itemRefs.current[id];
    if (!container || !item) return;
    // Căn giữa item được chọn trong viewport của list
    container.scrollTo({
      top: item.offsetTop - container.clientHeight / 2 + item.clientHeight / 2,
      behavior: "smooth",
    });
  }, []);

  // Tự cuộn danh sách tới hội thoại đang mở khi active id đổi qua ĐIỀU HƯỚNG
  // (nút Message ở quick chat, mở direct chat từ nơi khác…), không chỉ khi click
  // item trong list. lastScrolledId để: (1) không giật list về giữa mỗi lần cache
  // cập nhật cho cùng hội thoại đang xem; (2) thử lại ở lần render sau nếu item
  // chưa kịp mount (deep-find vừa append trang mới trước khi điều hướng).
  const lastScrolledId = useRef<string | null>(null);
  useEffect(() => {
    if (!activeConversationId) {
      lastScrolledId.current = null;
      return;
    }
    if (lastScrolledId.current === activeConversationId) return;
    // Item chưa render (đang chờ append) → bỏ qua, list update sau sẽ trigger lại
    if (!itemRefs.current[activeConversationId]) return;
    lastScrolledId.current = activeConversationId;
    const raf = requestAnimationFrame(() =>
      scrollToConversation(activeConversationId),
    );
    return () => cancelAnimationFrame(raf);
  }, [activeConversationId, conversations?.filterConversations, scrollToConversation]);

  // Hiển thị skeleton trong khi load lần đầu hoặc refetch
  if (isLoading || isRefetching) return <ListchatLoading />;

  return (
    <div
      ref={refListConversation}
      className="relative flex min-h-0 flex-1 flex-col gap-3 overflow-y-scroll scroll-smooth px-4 py-2"
    >
      {(conversations?.filterConversations ?? [])
        // Chỉ hiển thị conversation mà user chưa rời/xóa (isDeleted = false)
        .filter((conv) =>
          (conv.members ?? []).some(
            (m) => m.contact?.id === info?.id && !m.isDeleted,
          ),
        )
        .map((item) => (
          <ConversationItem
            key={item.id}
            item={item}
            selfId={info?.id}
            isActive={item.id === activeConversationId}
            itemRef={(el) => {
              if (item.id) itemRefs.current[item.id] = el;
            }}
            onClick={() => {
              if (item.id) scrollToConversation(item.id);
            }}
          />
        ))}
    </div>
  );
};

export default ListChatContainer;
