import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { getAttachments } from "../services/message.service";
import { AttachmentCache } from "../types/message.types";

const useAttachment = (
  conversationId: string,
): UseQueryResult<AttachmentCache> => {
  return useQuery({
    queryKey: ["attachment", conversationId],
    queryFn: () => getAttachments(conversationId),
    staleTime: 120_000, // 120s
    gcTime: 5 * 60_000, // v5 rename cacheTime → gcTime

    refetchOnMount: true, // chỉ fetch nếu stale
    refetchOnReconnect: true, // reconnect → fetch nếu stale
    refetchOnWindowFocus: false,
  });
};

export default useAttachment;
