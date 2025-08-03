import { useQuery, UseQueryResult } from "@tanstack/react-query";
import attachmentQueryOption from "../../chatbox/queries/attachmentQuery";
import { AttachmentCache } from "../../listchat/types";

// const useAttachment = (): UseQueryResult<AttachmentCache> => {
//   return useQuery({
//     queryKey: ["attachment"],
//     queryFn: () => Promise.resolve(null), // không thực sự fetch
//     enabled: false, // chỉ đọc cache
//     staleTime: 60_000,
//     gcTime: 300_000,
//   });
// };

const useAttachment = (
  conversationId: string,
): UseQueryResult<AttachmentCache> => {
  return useQuery({
    ...attachmentQueryOption(conversationId),
    // enabled: false, // chỉ đọc cache
  });
};

export default useAttachment;
