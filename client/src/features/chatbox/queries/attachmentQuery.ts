import { queryOptions } from "@tanstack/react-query";
import getAttachments from "../../chatdetail/services/getAttachments";
import { AttachmentCache } from "../../listchat/types";

const attachmentQueryOption = (conversationId: string) =>
  queryOptions<AttachmentCache>({
    queryKey: ["attachment", conversationId],
    queryFn: () => getAttachments(conversationId),
    staleTime: 30_000, // 30s
    gcTime: 5 * 60_000, // v5 rename cacheTime → gcTime

    refetchOnMount: true, // chỉ fetch nếu stale
    refetchOnReconnect: true, // reconnect → fetch nếu stale
    refetchOnWindowFocus: false,
  });

export default attachmentQueryOption;
