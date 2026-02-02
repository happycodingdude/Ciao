import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { getMessages } from "../services/message.service";
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

const useMessage = (
  conversationId: string,
  page: number,
): UseQueryResult<MessageCache> => {
  return useQuery(messageQueryOption(conversationId, page));
};

export default useMessage;
