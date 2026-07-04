import { QueryClient } from "@tanstack/react-query";
import { ConversationCache, ConversationModel } from "../types/conv.types";
import { findDirectConversation } from "./conversationCache";
import { applyListchatFilter } from "./listchatFilter";

// Phải khớp `limit=10` hardcode trong VITE_ENDPOINT_CONVERSATION_GET(WITHPAGING).
// Đặt ở đây (module thuần, không đụng import.meta.env) để test được bằng node.
export const CONVERSATIONS_PAGE_LIMIT = 10;

// Chặn trên số trang load liên tiếp khi tìm sâu, tránh loop dài nếu user có
// quá nhiều hội thoại (mỗi trang 1 API call).
const MAX_DEEP_LOAD_PAGES = 30;

/**
 * Append 1 trang conversations mới fetch vào cache list, dùng chung cho scroll
 * load-more và tìm sâu (deep find). Đảm bảo:
 * - Dedup theo id (trang bị trôi offset / entry đã được prepend optimistic).
 * - filterConversations chỉ nhận item khớp filter tab + search đang active
 *   (đọc listFilter/listSearch do ListchatFilterContext ghi vào cache).
 * - Cập nhật page/hasMore để lần fetch sau nối tiếp đúng trang.
 */
export const appendConversationsPage = (
  queryClient: QueryClient,
  fetched: ConversationModel[],
  page: number,
  selfId?: string,
) => {
  queryClient.setQueryData(["conversation"], (old: ConversationCache | undefined) => {
    const base = old ?? { conversations: [], filterConversations: [] };
    const existingIds = new Set((base.conversations ?? []).map((c) => c.id));
    const appended = fetched.filter((c) => !existingIds.has(c.id));
    return {
      ...base,
      conversations: [...(base.conversations ?? []), ...appended],
      filterConversations: [
        ...(base.filterConversations ?? []),
        ...applyListchatFilter(
          appended,
          base.listFilter ?? "all",
          base.listSearch ?? "",
          selfId,
        ),
      ],
      page,
      // Trang trả về ít hơn limit → trang cuối
      hasMore: fetched.length >= CONVERSATIONS_PAGE_LIMIT,
    };
  });
};

/**
 * Tìm direct conversation (1-1) với contact trong cache list; nếu chưa thấy thì
 * load thêm từng trang (append vào cache như scroll load-more) đến khi thấy hoặc
 * hết trang. Trả về conversation tìm được (giữ nguyên vị trí trong list) hoặc
 * undefined nếu thật sự chưa tồn tại.
 *
 * `fetchPage` do call-site truyền vào (thường là getConversations) — giữ module
 * này thuần để test không cần network.
 */
export const loadConversationsUntilFound = async (
  queryClient: QueryClient,
  contactId: string,
  fetchPage: (page: number) => Promise<ConversationCache>,
  selfId?: string,
): Promise<ConversationModel | undefined> => {
  const read = () =>
    queryClient.getQueryData<ConversationCache>(["conversation"]);

  let cached = read();
  let found = findDirectConversation(cached?.conversations ?? [], contactId);

  for (let i = 0; !found && (cached?.hasMore ?? true) && i < MAX_DEEP_LOAD_PAGES; i++) {
    // Cache chưa từng load (gọi trước khi list query chạy) → bắt đầu từ trang 1
    const nextPage = cached ? (cached.page ?? 1) + 1 : 1;
    const res = await fetchPage(nextPage);
    appendConversationsPage(queryClient, res.conversations ?? [], nextPage, selfId);
    cached = read();
    found = findDirectConversation(cached?.conversations ?? [], contactId);
  }
  return found;
};
