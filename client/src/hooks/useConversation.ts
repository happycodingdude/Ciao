import { queryOptions, useQuery, UseQueryResult } from "@tanstack/react-query";
import { getConversations } from "../services/conv.service";
import { ConversationCache } from "../types/conv.types";

export const conversationQueryOption = (page: number) =>
  queryOptions<ConversationCache>({
    queryKey: ["conversation"],
    queryFn: () => getConversations(page),
    staleTime: 60 * 60 * 1000,
    // staleTime: 10 * 1000,
    // select: (data) => {
    //   const prev = queryClient.getQueryData<ConversationCache>([
    //     "conversation",
    //   ]);
    //   return {
    //     ...data,
    //     selected: prev?.selected ?? null,
    //     reload: true,
    //     quickChat: false,
    //     message: null,
    //   };
    // },
  });

const useConversation = (
  page?: number | undefined,
): UseQueryResult<ConversationCache> => {
  return useQuery({
    queryKey: ["conversation"],
    queryFn: () => getConversations(page),
    staleTime: 60 * 60 * 1000,
    // staleTime: 10 * 1000,
    // select: (data) => {
    //   const prev = queryClient.getQueryData<ConversationCache>([
    //     "conversation",
    //   ]);
    //   return {
    //     ...data,
    //     selected: prev?.selected ?? null,
    //     reload: true,
    //     quickChat: false,
    //     message: null,
    //   };
    // },
  });
};

export default useConversation;
