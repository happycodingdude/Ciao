import HttpRequest from "../lib/fetch";
import {
  GetBookmarksResponse,
  GetConversationLinksResponse,
} from "../types/bookmark.types";

// Phase 3 — lưu / bỏ lưu tin nhắn (riêng tư per-user, idempotent).
export const bookmarkMessage = async (
  conversationId: string,
  messageId: string,
  bookmarked: boolean,
) => {
  return (
    await HttpRequest({
      method: "put",
      url: import.meta.env.VITE_ENDPOINT_MESSAGE_BOOKMARK.replace(
        "{conversationId}",
        conversationId,
      )
        .replace("{id}", messageId)
        .replace("{bookmarked}", String(bookmarked)),
    })
  ).data;
};

// Danh sách "Tin nhắn đã lưu" (mới lưu trước, phân trang).
export const getBookmarks = async (page: number, limit: number = 20) => {
  return (
    await HttpRequest<undefined, GetBookmarksResponse>({
      method: "get",
      url: import.meta.env.VITE_ENDPOINT_BOOKMARK_GET.replace(
        "{page}",
        String(page),
      ).replace("{limit}", String(limit)),
    })
  ).data;
};

// Danh sách messageId đã lưu trong 1 hội thoại (hiện trạng thái "đã lưu" trên từng tin).
export const getConversationBookmarkIds = async (conversationId: string) => {
  return (
    await HttpRequest<undefined, string[]>({
      method: "get",
      url: import.meta.env.VITE_ENDPOINT_CONVERSATION_BOOKMARK_IDS.replace(
        "{id}",
        conversationId,
      ),
    })
  ).data;
};

// Danh sách liên kết trong hội thoại (tab "Liên kết" của Media).
export const getConversationLinks = async (
  conversationId: string,
  page: number,
  limit: number = 20,
) => {
  return (
    await HttpRequest<undefined, GetConversationLinksResponse>({
      method: "get",
      url: import.meta.env.VITE_ENDPOINT_CONVERSATION_LINKS.replace(
        "{id}",
        conversationId,
      )
        .replace("{page}", String(page))
        .replace("{limit}", String(limit)),
    })
  ).data;
};
