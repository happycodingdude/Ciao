import { queryOptions } from "@tanstack/react-query";
import { MessageCache } from "../../listchat/types";
import getMessages from "../services/getMessages";

const messageQueryOption = (conversationId: string, page: number) =>
  queryOptions<MessageCache>({
    queryKey: ["message", conversationId],
    queryFn: () => getMessages(conversationId, page),
    staleTime: 120_000, // 120s
    gcTime: 5 * 60_000, // v5 rename cacheTime → gcTime

    refetchOnMount: true, // chỉ fetch nếu stale
    refetchOnReconnect: true, // reconnect → fetch nếu stale
    refetchOnWindowFocus: false,
  });

export default messageQueryOption;
