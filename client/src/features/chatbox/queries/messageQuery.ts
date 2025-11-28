import { queryOptions } from "@tanstack/react-query";
import { MessageCache } from "../../listchat/types";
import getMessages from "../services/getMessages";

const messageQueryOption = (conversationId: string, page: number) =>
  queryOptions<MessageCache>({
    queryKey: ["message", conversationId],
    queryFn: () => getMessages(conversationId, page),
    staleTime: Infinity, // Keep cache fresh indefinitely until manually invalidated
    refetchOnMount: false, // Don't refetch if cache exists
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    refetchOnReconnect: false, // Don't refetch when network reconnects
  });

export default messageQueryOption;
