import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { MessageCache } from "../../listchat/types";
import messageQueryOption from "../queries/messageQuery";

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
