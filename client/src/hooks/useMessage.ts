import { useQuery, UseQueryResult } from "@tanstack/react-query";
import messageQueryOption from "../features/chatbox/queries/messageQuery";
import { MessageCache } from "../features/listchat/types";

const useMessage = (
  conversationId: string,
  page: number,
): UseQueryResult<MessageCache> => {
  return useQuery({
    ...messageQueryOption(conversationId, page),
    // enabled: false, // chỉ đọc cache
  });
};

export default useMessage;
