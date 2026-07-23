import { useInfiniteQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useEffect, useMemo, useRef, useState } from "react";
import { willResetPanelOnConversation } from "../../context/ChatDetailTogglesContext";
import useChatDetailToggles from "../../hooks/useChatDetailToggles";
import { useServerSearchFallback } from "../../hooks/useServerSearchFallback";
import { Route } from "../../routes/_layout.conversations.$conversationId";
import { getConversationBookmarks } from "../../services/bookmark.service";
import { BookmarkItemModel } from "../../types/bookmark.types";
import { formatMessageTime, renderContent } from "../../utils/searchHighlight";
import ImageWithLightBoxAndNoLazy from "../common/ImageWithLightBoxAndNoLazy";
import ModalSearchInput from "../common/ModalSearchInput";

// Số tin lưu tải mỗi trang (load-more).
const PAGE_LIMIT = 20;

// Panel "Tin nhắn đã lưu" của hội thoại — UI đồng bộ với InformationPin (luồng thống nhất).
// Luồng dữ liệu:
// 1. Mở panel → load trang đầu tin đã lưu (phân trang), cuộn tới cuối tự load trang kế (load-more).
// 2. Gõ keyword → filter client-side trong list đã load; không match → API search theo keyword.
// 3. Click 1 tin → nhảy tới tin trong khung chat (jump target in-memory, KHÔNG đổi URL, giữ panel mở).
const InformationBookmark = () => {
  const { conversationId } = Route.useParams();
  const { showBookmark, jumpTarget, requestJump } = useChatDetailToggles();
  // Đang có jump-to-message chạy dở (Chatbox chưa clearJump) → khoá click item mới.
  const pendingJumpId = jumpTarget?.messageId;

  const [keyword, setKeyword] = useState("");
  const refInput = useRef<HTMLInputElement>(null);

  // Infinite query: dedupe StrictMode, refetch mỗi lần mở lại panel (staleTime 0),
  // thao tác lưu/bỏ lưu chỉ cần invalidate key này để list tự cập nhật.
  const enabled = showBookmark && !willResetPanelOnConversation(conversationId);
  const {
    data,
    isLoading: loading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["conversationBookmarks", conversationId],
    queryFn: ({ pageParam }) =>
      getConversationBookmarks(conversationId, pageParam, PAGE_LIMIT),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) =>
      lastPage?.hasMore ? allPages.length + 1 : undefined,
    enabled,
  });

  const items = useMemo(
    () => data?.pages.flatMap((p) => p.bookmarks) ?? [],
    [data],
  );

  // Component always-mounted (sibling trong ChatboxContainer). Mỗi lần MỞ panel:
  // reset keyword + auto-focus (preventScroll: tránh xê dịch layout khi sidebar transition width).
  useEffect(() => {
    if (!showBookmark || willResetPanelOnConversation(conversationId)) return;
    setKeyword("");
    if (refInput.current) refInput.current.value = "";
    refInput.current?.focus({ preventScroll: true });
  }, [showBookmark, conversationId]);

  const trimmedKeyword = keyword.trim();

  // Filter client-side trong list đã load (case-insensitive, theo nội dung tin).
  const localMatches = useMemo(() => {
    if (!trimmedKeyword) return items;
    const kw = trimmedKeyword.toLowerCase();
    return items.filter((m) => m.content?.toLowerCase().includes(kw));
  }, [items, trimmedKeyword]);

  // Local không match → fallback API search theo keyword (debounce + stale guard).
  const { needServerSearch, serverResults, searching } =
    useServerSearchFallback(trimmedKeyword, localMatches.length, (kw) =>
      getConversationBookmarks(conversationId, 1, PAGE_LIMIT, kw).then(
        (r) => r.bookmarks,
      ),
    );

  const displayed = needServerSearch ? serverResults : localMatches;
  const busy = loading || (needServerSearch && searching);

  // Load-more: quan sát sentinel cuối list trong chính container cuộn (chỉ chế độ browse).
  const scrollRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (needServerSearch) return;
    const el = sentinelRef.current;
    const root = scrollRef.current;
    if (!el || !root) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage)
          fetchNextPage();
      },
      { root, rootMargin: "160px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [needServerSearch, hasNextPage, isFetchingNextPage, fetchNextPage, displayed.length]);

  // Click 1 tin đã lưu → set jump target in-memory (không đổi URL); Chatbox tự kéo trang cũ tới
  // khi tin xuất hiện rồi scroll + highlight. Tin unavailable / đang jump dở → bỏ qua.
  const handleItemClick = (m: BookmarkItemModel) => {
    if (!m.messageId || m.isUnavailable || pendingJumpId) return;
    requestJump(conversationId, m.messageId);
  };

  return (
    <div
      className={`absolute top-0 pb-4 ${showBookmark ? "z-10" : "z-0"} bg-(--bg-color) flex h-full w-full flex-col`}
    >
      {/* Header chỉ tiêu đề — đóng panel bằng cách click lại icon Bookmark trên ChatboxHeaderMenu. */}
      <div className="border-b-(--border-color) panel-header-h bg-(--bg-color) flex items-center border-b-[.1rem] px-4">
        <p className="text-base font-medium">Saved messages</p>
      </div>

      {/* Ô search — filter live trong list đã load, fallback API khi không match. */}
      <div className="px-4 py-3">
        <ModalSearchInput
          inputRef={refInput}
          placeholder="Filter saved messages..."
          onChange={(e) => setKeyword(e.target.value)}
        />
      </div>

      {/* Danh sách tin đã lưu (mới lưu trước) */}
      <div
        ref={scrollRef}
        className="hide-scrollbar flex grow flex-col overflow-y-auto"
      >
        {busy && (
          <p className="text-(--text-main-color-blur) p-4 text-center">
            {loading ? "Loading..." : "Searching..."}
          </p>
        )}
        {!busy && displayed.length === 0 && (
          <p className="text-(--text-main-color-blur) p-4 text-center">
            {trimmedKeyword ? "No matches" : "No saved messages"}
          </p>
        )}
        {!busy &&
          displayed.map((m) => (
            <div
              key={m.id}
              onClick={() => handleItemClick(m)}
              className={`border-b-(--border-color) flex items-start gap-3 border-b-[.1rem] px-4 py-3
                ${m.isUnavailable ? "opacity-60" : `hover:bg-(--bg-color-extrathin) ${pendingJumpId ? "cursor-wait" : "cursor-pointer"}`}`}
            >
              {/* Avatar người gửi bên trái */}
              <ImageWithLightBoxAndNoLazy
                src={m.senderAvatar ?? undefined}
                className="aspect-square h-8 shrink-0"
                circle
                slides={[{ src: m.senderAvatar ?? "" }]}
                onClick={() => {}}
              />
              <div className="flex min-w-0 grow flex-col gap-1">
                {/* Hàng trên: tên + thời gian góc phải */}
                <div className="flex items-start justify-between gap-2">
                  <p className="text-2xs truncate font-medium">
                    {m.senderName || "Unknown"}
                  </p>
                  <p className="text-3xs text-(--text-main-color-blur) shrink-0">
                    {m.messageCreatedTime
                      ? formatMessageTime(dayjs(m.messageCreatedTime))
                      : ""}
                  </p>
                </div>
                <p className="text-2xs wrap-break-word">
                  {m.isUnavailable ? (
                    <span className="italic">Message unavailable</span>
                  ) : (
                    renderContent(m.content, trimmedKeyword)
                  )}
                </p>
              </div>
            </div>
          ))}

        {/* Sentinel load-more + chỉ báo đang tải trang kế (chỉ chế độ browse). */}
        {!busy && !needServerSearch && (
          <div ref={sentinelRef} className="h-px w-full shrink-0" />
        )}
        {isFetchingNextPage && (
          <p className="text-(--text-main-color-blur) p-3 text-center">
            Loading more...
          </p>
        )}
      </div>
    </div>
  );
};

export default InformationBookmark;
