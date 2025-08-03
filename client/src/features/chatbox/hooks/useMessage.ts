import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { MessageCache } from "../../listchat/types";
import messageQueryOption from "../queries/messageQuery";

// const useMessage = (): UseQueryResult<MessageCache> => {
//   return useQuery({
//     queryKey: ["message"],
//     queryFn: () => Promise.resolve(null),
//     enabled: false, // chỉ đọc cache
//   });
// };

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
