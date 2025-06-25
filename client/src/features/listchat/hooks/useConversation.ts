import { useQuery, UseQueryResult } from "@tanstack/react-query";
import getConversations from "../services/getConversations";
import { ConversationCache } from "../types";

const useConversation = (
  page?: number | undefined,
): UseQueryResult<ConversationCache> => {
  return useQuery({
    queryKey: ["conversation"],
    queryFn: () => getConversations(page),
    staleTime: Infinity,
    enabled: typeof page !== "undefined", // 👈 Chỉ gọi khi page đã xác định
  });
};
export default useConversation;
