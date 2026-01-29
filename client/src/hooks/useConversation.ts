import { useQuery, UseQueryResult } from "@tanstack/react-query";
import conversationQueryOption from "../features/listchat/queries/conversationQuery";
import { ConversationCache } from "../features/listchat/types";

const useConversation = (
  page?: number | undefined,
): UseQueryResult<ConversationCache> => {
  return useQuery({
    ...conversationQueryOption(page ?? 1),
    enabled: typeof page !== "undefined",
  });
};

export default useConversation;
