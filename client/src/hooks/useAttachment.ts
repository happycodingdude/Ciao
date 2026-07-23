import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { getAttachments } from "../services/message.service";
import { AttachmentCache } from "../types/message.types";

// enabled: cả InformationAttachments (panel Information) lẫn Attachment (panel "View all")
// đều gọi hook này với CÙNG query key — cả hai luôn mounted (ẩn bằng z-index). Trước đây
// không gate nên getAttachments chạy mỗi lần mở hội thoại dù user chưa mở panel nào. Giờ mỗi
// nơi tự truyền cờ hiển thị của mình; query chỉ fetch khi có ÍT NHẤT một observer bật.
const useAttachment = (
  conversationId: string,
  enabled: boolean = true,
): UseQueryResult<AttachmentCache> => {
  return useQuery({
    queryKey: ["attachment", conversationId],
    queryFn: () => getAttachments(conversationId),
    enabled,
    staleTime: 120_000, // 120s
    gcTime: 5 * 60_000, // v5 rename cacheTime → gcTime

    refetchOnMount: true, // chỉ fetch nếu stale
    refetchOnReconnect: true, // reconnect → fetch nếu stale
    refetchOnWindowFocus: false,
  });
};

export default useAttachment;
