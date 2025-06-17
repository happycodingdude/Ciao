import { useQuery } from "@tanstack/react-query";
import getAttachments from "../services/getAttachments";

// const useAttachment = (
//   conversationId?: string,
// ): UseQueryResult<AttachmentCache> => {
//   return useQuery({
//     queryKey: ["attachment"],
//     queryFn: () => getAttachments(conversationId),
//     staleTime: Infinity,
//     enabled: false,
//   });
// };

const useAttachment = (conversationId?: string) => {
  return useQuery({
    queryKey: ["attachments", conversationId ?? "none"],
    queryFn: () => getAttachments(conversationId!),
    enabled: false, // ❌ không tự gọi API
    staleTime: 60_000,
    gcTime: 300_000,
  });
};

export default useAttachment;
