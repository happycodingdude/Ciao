import { useQuery, UseQueryResult } from "@tanstack/react-query";
import attachmentQueryOption from "../../chatbox/queries/attachmentQuery";
import { AttachmentCache } from "../../listchat/types";

const useAttachment = (
  conversationId: string,
): UseQueryResult<AttachmentCache> => {
  return useQuery({
    ...attachmentQueryOption(conversationId),
    // enabled: false, // chỉ đọc cache
  });
};

export default useAttachment;
