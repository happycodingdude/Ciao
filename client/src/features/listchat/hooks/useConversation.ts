import { useQuery, UseQueryResult } from "@tanstack/react-query";
import conversationQueryOption from "../queries/conversationQuery";
import { ConversationCache } from "../types";

const useConversation = (
  page?: number | undefined,
): UseQueryResult<ConversationCache> => {
  return useQuery({
    ...conversationQueryOption(page ?? 1),
    enabled: typeof page !== "undefined",
  });
};

export default useConversation;
