import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { AttachmentCache } from "../../listchat/types";
import getAttachments from "../services/getAttachments";

const useAttachment = (
  conversationId?: string,
): UseQueryResult<AttachmentCache> => {
  return useQuery({
    queryKey: ["attachment"],
    queryFn: () => getAttachments(conversationId),
    staleTime: Infinity,
    enabled: false,
  });
};
export default useAttachment;
