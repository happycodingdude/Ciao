import { queryOptions, useQuery, UseQueryResult } from "@tanstack/react-query";
import { getConversations } from "../services/conv.service";
import { ConversationCache } from "../types/conv.types";

export const conversationQueryOption = (page: number) =>
  queryOptions<ConversationCache>({
    queryKey: ["conversation"],
    queryFn: () => getConversations(page),
    staleTime: 60 * 60 * 1000,
  });

const useConversation = (
  page?: number | undefined,
): UseQueryResult<ConversationCache> => {
  return useQuery(conversationQueryOption(page ?? 1));
};

export default useConversation;
