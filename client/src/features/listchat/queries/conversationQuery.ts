import { queryOptions } from "@tanstack/react-query";
import getConversations from "../services/getConversations";
import { ConversationCache } from "../types";

const conversationQueryOption = (page: number) =>
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

export default conversationQueryOption;
