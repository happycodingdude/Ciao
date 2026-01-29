import { useQuery, UseQueryResult } from "@tanstack/react-query";
import attachmentQueryOption from "../features/chatbox/queries/attachmentQuery";
import { AttachmentCache } from "../features/listchat/types";

const useAttachment = (
  conversationId: string,
): UseQueryResult<AttachmentCache> => {
  return useQuery({
    ...attachmentQueryOption(conversationId),
    // enabled: false, // chỉ đọc cache
  });
};

export default useAttachment;
