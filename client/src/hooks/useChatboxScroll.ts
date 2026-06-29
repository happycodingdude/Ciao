import { useCallback, useLayoutEffect, useRef, useState } from "react";
import useEventListener from "./useEventListener";

/**
 * Quản lý scroll của khung chat:
 * - Nút "scroll to bottom" khi user cuộn lên xa đáy.
 * - PREFETCH trang CŨ hơn khi còn cách đỉnh ~1 viewport (qua fetchPreviousPage của
 *   useInfiniteQuery) để giấu latency, GIỮ NGUYÊN vị trí đọc bằng cách bù chênh lệch scrollHeight
 *   trong useLayoutEffect (chống nhảy).
 *
 * Không còn tự quản refPage / ghi cache thủ công — pagination do React Query lo.
 */
export const useChatboxScroll = (
  hasPreviousPage: boolean,
  isFetchingPreviousPage: boolean,
  fetchPreviousPage: () => void,
  // id tin nhắn đầu danh sách (trang cũ nhất). Đổi = trang cũ vừa được prepend → restore scroll.
  firstMessageId: string | undefined,
  // Đổi hội thoại → huỷ prepend đang chờ của hội thoại cũ (tránh áp delta scroll nhầm convo).
  conversationId: string,
) => {
  const refChatContent = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  // Theo dõi node thật để gắn scroll listener DETERMINISTIC (không chờ render phụ tình cờ).
  const [scrollEl, setScrollEl] = useState<HTMLDivElement | null>(null);

  // Lưu scrollHeight ngay trước khi prepend để khôi phục vị trí sau khi DOM cao thêm.
  const pendingPrepend = useRef<{ prevHeight: number } | null>(null);

  // Đổi hội thoại: huỷ prepend đang chờ của hội thoại trước. Nếu không, effect restore-scroll
  // (chạy khi firstMessageId của convo mới load xong) sẽ áp delta scrollHeight của convo CŨ
  // → nhảy vị trí sai trên convo mới.
  useLayoutEffect(() => {
    pendingPrepend.current = null;
  }, [conversationId]);

  const scrollToBottom = useCallback((behavior: ScrollBehavior) => {
    bottomRef.current?.scrollIntoView({ behavior, block: "end" });
  }, []);

  const handleScroll = useCallback(() => {
    const el = refChatContent.current;
    if (!el) return;

    const distanceFromBottom = el.scrollHeight - (el.scrollTop + el.clientHeight);
    // Hiện nút scroll-to-bottom khi cách đáy ≥ 50% chiều cao container
    setShowScrollToBottom(
      el.clientHeight !== 0 && distanceFromBottom >= el.clientHeight / 2,
    );

    // PREFETCH-AHEAD: bắt đầu load trang cũ TRƯỚC khi user chạm đỉnh, khi còn cách đỉnh trong
    // khoảng ~1 viewport (floor 400px). Mục tiêu: giấu network latency — tới lúc user thật sự
    // cuộn tới đỉnh thì trang cũ đã được prepend sẵn, không phải đứng đợi. Cơ chế bù scrollHeight
    // (theo firstMessageId) giữ nguyên vị trí đọc kể cả khi prepend lúc user chưa ở đỉnh, nên
    // prefetch sớm là an toàn. Các guard (hasPreviousPage / !isFetchingPreviousPage /
    // !pendingPrepend) chống fetch chồng + chain-load vô tận.
    const prefetchMargin = Math.max(400, el.clientHeight);
    if (
      el.scrollTop <= prefetchMargin &&
      hasPreviousPage &&
      !isFetchingPreviousPage &&
      !pendingPrepend.current
    ) {
      pendingPrepend.current = { prevHeight: el.scrollHeight };
      fetchPreviousPage();
    }
  }, [hasPreviousPage, isFetchingPreviousPage, fetchPreviousPage]);

  // Đồng bộ node DOM vào state ngay sau commit để useEventListener gắn đúng vào container
  // (không attach nhầm window do ref.current=null ở render đầu).
  useLayoutEffect(() => {
    setScrollEl(refChatContent.current);
  }, []);

  useEventListener("scroll", handleScroll, scrollEl ?? undefined);

  // Sau khi trang cũ được prepend (firstMessageId đổi): bù scrollTop để vị trí đọc không nhảy.
  useLayoutEffect(() => {
    const el = refChatContent.current;
    const pending = pendingPrepend.current;
    if (!el || !pending) return;
    el.style.scrollBehavior = "auto";
    el.scrollTop += el.scrollHeight - pending.prevHeight;
    el.style.scrollBehavior = "smooth";
    pendingPrepend.current = null;
  }, [firstMessageId]);

  return { refChatContent, bottomRef, scrollToBottom, showScrollToBottom };
};
