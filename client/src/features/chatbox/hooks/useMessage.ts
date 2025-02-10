import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { MessageCache } from "../../listchat/types";
import getMessages from "../services/getMessages";

const useMessage = (
  conversationId?: string,
  page?: number,
): UseQueryResult<MessageCache> => {
  return useQuery({
    queryKey: ["message"],
    queryFn: () => getMessages(conversationId, page),
    staleTime: Infinity,
    enabled: false,
  });
};

export default useMessage;
