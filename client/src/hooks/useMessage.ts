import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { getMessages, getMessagesAround } from "../services/message.service";
import { MessageCache } from "../types/message.types";

export const messageQueryOption = (conversationId: string, page: number) => ({
  queryKey: ["message", conversationId],
  queryFn: () => getMessages(conversationId, page),
  staleTime: 120_000, // 120s
  gcTime: 5 * 60_000, // v5 rename cacheTime → gcTime

  refetchOnMount: true, // chỉ fetch nếu stale
  refetchOnReconnect: true, // reconnect → fetch nếu stale
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
  page: number,
): UseQueryResult<MessageCache> => {
  return useQuery(messageQueryOption(conversationId, page));
};

export default useMessage;
