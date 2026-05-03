import { useQueryClient } from "@tanstack/react-query";
import { debounce } from "lodash-es";
import { useCallback, useMemo, useRef, useState } from "react";
import useEventListener from "./useEventListener";
import { getMessages } from "../services/message.service";
import { MessageCache, PendingMessageModel } from "../types/message.types";

export const useChatboxScroll = (
  conversationId: string,
  messages: MessageCache | undefined,
  refPage: React.MutableRefObject<number>,
) => {
  const queryClient = useQueryClient();
  const refChatContent = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const isFetching = useRef(false);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);

  const scrollToBottom = (behavior: ScrollBehavior) => {
    bottomRef.current?.scrollIntoView({ behavior, block: "end" });
  };

  // Khóa scroll trong khi prepend tin nhắn cũ để tránh nhảy vị trí đột ngột
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

  const fetchMoreMessages = useCallback(
    async (convId: string) => {
      const el = refChatContent.current;
      const current = queryClient.getQueryData<MessageCache>(["message", convId]);
      // Không fetch nếu đã hết dữ liệu hoặc DOM chưa mount
      if (!current?.hasMore || !el) return;

      const unlock = lockScroll(el);
      const prevScrollHeight = el.scrollHeight;
      const newMessages = await getMessages(convId, refPage.current);

      queryClient.setQueryData(["message", convId], (old: MessageCache) => ({
        ...old,
        // Prepend tin nhắn cũ hơn lên đầu mảng
        messages: [...newMessages.messages, ...(old.messages ?? [])],
        hasMore: newMessages.hasMore,
      }));

      isFetching.current = false;

      requestAnimationFrame(() => {
        // Giữ nguyên vị trí scroll sau khi prepend bằng cách cộng thêm chiều cao tăng lên
        el.style.scrollBehavior = "auto";
        el.scrollTop += el.scrollHeight - prevScrollHeight;
        el.style.scrollBehavior = "smooth";
        unlock();
      });
    },
    [queryClient],
  );

  const debounceFetch = useMemo(
    () => debounce(fetchMoreMessages, 100),
    [fetchMoreMessages],
  );

  const handleScroll = useCallback(() => {
    const el = refChatContent.current;
    // Bỏ qua nếu đang fetch, chưa có data, hoặc DOM chưa sẵn
    if (!el || isFetching.current || !messages) return;

    const distanceFromBottom = el.scrollHeight - (el.scrollTop + el.clientHeight);
    // Hiển thị nút scroll-to-bottom khi cách đáy ít nhất 50% chiều cao container
    setShowScrollToBottom(el.clientHeight !== 0 && distanceFromBottom >= el.clientHeight / 2);

    // Đã scroll lên đỉnh và còn tin nhắn cũ hơn → load thêm trang trước
    if (el.scrollTop === 0 && messages.hasMore) {
      isFetching.current = true;
      refPage.current += 1;
      debounceFetch(conversationId);
    }
  }, [debounceFetch, conversationId, messages]);

  useEventListener("scroll", handleScroll, refChatContent.current);

  return { refChatContent, bottomRef, scrollToBottom, showScrollToBottom };
};
