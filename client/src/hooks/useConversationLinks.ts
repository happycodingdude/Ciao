import { useQuery } from "@tanstack/react-query";
import { getConversationLinks } from "../services/bookmark.service";

// Links KHÔNG nằm trong cache useAttachment (BE gom LinkPreviews qua endpoint riêng /links),
// nên tab Liên kết dùng query độc lập. BE trả TẤT CẢ link 1 lần — KHÔNG phân trang (đồng bộ cách
// Images/Videos/Files lấy từ getAttachments). Preview (Information) và panel "View all"
// (Attachment) DÙNG CHUNG query key nên bên nào warm cache trước thì bên kia mở là có ngay:
// preview tự cắt tối đa N item, panel render hết trong scroll.
const useConversationLinks = (conversationId: string, enabled: boolean) =>
  useQuery({
    queryKey: ["conversationLinks", conversationId],
    queryFn: () => getConversationLinks(conversationId),
    staleTime: 120_000, // đồng bộ với useAttachment
    enabled,
  });

export default useConversationLinks;
