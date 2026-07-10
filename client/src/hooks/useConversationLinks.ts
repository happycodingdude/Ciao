import { useInfiniteQuery } from "@tanstack/react-query";
import { getConversationLinks } from "../services/bookmark.service";

// Links KHÔNG nằm trong cache useAttachment (BE gom LinkPreviews qua endpoint phân trang
// riêng), nên tab Liên kết dùng infinite query độc lập.
// limit nằm trong queryKey để cache preview của Information (limit=8) và cache panel
// Attachment (limit=20) tách biệt — page 1 của hai bên khác kích thước, không dùng chung được.
const useConversationLinks = (
  conversationId: string,
  limit: number,
  enabled: boolean,
) => {
  return useInfiniteQuery({
    queryKey: ["conversationLinks", conversationId, limit],
    queryFn: ({ pageParam }) =>
      getConversationLinks(conversationId, pageParam, limit),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) =>
      lastPage?.hasMore ? allPages.length + 1 : undefined,
    staleTime: 120_000, // đồng bộ với useAttachment
    enabled,
  });
};

export default useConversationLinks;
