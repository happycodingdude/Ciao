import {
  infiniteQueryOptions,
  useInfiniteQuery,
  UseInfiniteQueryResult,
} from "@tanstack/react-query";
import { getMessages, getMessagesAround } from "../services/message.service";
import { InfiniteMessageData } from "../utils/messageCache";

// Tin nhắn dùng useInfiniteQuery: mỗi page là 1 MessageCache (xếp cũ→mới bên trong).
// pageParam = số trang (1 = mới nhất). Load trang CŨ hơn bằng fetchPreviousPage → React Query
// PREPEND vào đầu mảng pages → pages luôn theo thứ tự chronological [cũ…mới] (xem messageCache.ts).
//
// - getNextPageParam = undefined: KHÔNG fetch trang "mới hơn" qua query; tin mới đến qua realtime
//   (FCM) được append trực tiếp vào cache → tránh refetch thừa + giữ optimistic.
// - getPreviousPageParam: firstPage (trang cũ nhất đang có) còn hasMore → trang kế = allPages+1.
// - refetchOnMount: refetch-merge — infinite query tự refetch LẠI TẤT CẢ pages đã load khi stale,
//   nên quay lại hội thoại sau staleTime không bị mất các trang đã cuộn.
export const messageQueryOption = (conversationId: string) =>
  infiniteQueryOptions({
    queryKey: ["message", conversationId],
    queryFn: ({ pageParam }) => getMessages(conversationId, pageParam),
    initialPageParam: 1,
    getNextPageParam: () => undefined,
    getPreviousPageParam: (firstPage, allPages) =>
      firstPage.hasMore ? allPages.length + 1 : undefined,
    staleTime: 120_000, // 120s
    gcTime: 5 * 60_000,
    refetchOnMount: true,
    refetchOnReconnect: true,
    refetchOnWindowFocus: false,
  });

// Query 1 trang đầu dạng PHẲNG (MessageCache) cho pane review notification — không cần
// infinite/pagination. KEY RIÊNG ["message","review",id] để KHÔNG đụng cache infinite
// ["message", id] của khung chat chính (khác shape sẽ vỡ).
export const messageFirstPageQueryOption = (conversationId: string) => ({
  queryKey: ["message", "review", conversationId],
  queryFn: () => getMessages(conversationId, 1),
  staleTime: 120_000,
  gcTime: 5 * 60_000,
  refetchOnWindowFocus: false,
});

// Query cửa sổ tin quanh 1 messageId. KEY RIÊNG (kèm messageId) để KHÔNG đụng cache chat
// chính ["message", conversationId] — pane review chỉ cần đúng range, không phá list chat.
export const messagesAroundQueryOption = (
  conversationId: string,
  messageId: string,
) => ({
  queryKey: ["message", "around", conversationId, messageId],
  queryFn: () => getMessagesAround(conversationId, messageId),
  staleTime: 120_000,
  gcTime: 5 * 60_000,
  refetchOnWindowFocus: false,
});

const useMessage = (
  conversationId: string,
): UseInfiniteQueryResult<InfiniteMessageData> => {
  return useInfiniteQuery(messageQueryOption(conversationId));
};

export default useMessage;
