import { useQuery, UseQueryResult } from "@tanstack/react-query";
import getConversations from "../services/getConversations";
import { ConversationCache } from "../types";

const useConversation = (
  page?: number | undefined,
): UseQueryResult<ConversationCache> => {
  // const axios = useAxiosRetry();
  return useQuery({
    queryKey: ["conversation"],
    queryFn: () => getConversations(page),
    staleTime: Infinity,
    // enabled: false,
    // refetchOnWindowFocus: false,
  });
};
export default useConversation;
