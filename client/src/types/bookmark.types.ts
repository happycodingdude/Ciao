// Phase 3 — Bookmark (tin nhắn đã lưu) + tab Liên kết (Media).

export type BookmarkItemModel = {
  id: string; // bookmark id
  conversationId: string;
  conversationTitle: string;
  isGroup: boolean;
  messageId: string;
  messageType: string;
  content: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string | null;
  messageCreatedTime?: string | null;
  bookmarkedTime: string;
  isUnavailable: boolean; // tin gốc đã thu hồi hoặc không còn
};

// Response phân trang panel "Tin đã lưu" của hội thoại (hasMore + list).
export type GetConversationBookmarksResponse = {
  hasMore: boolean;
  bookmarks: BookmarkItemModel[];
};

export type ConversationLinkItem = {
  messageId: string;
  contactId: string;
  createdTime: string;
  url: string;
  title?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  siteName?: string | null;
};

export type GetConversationLinksResponse = {
  hasMore: boolean;
  links: ConversationLinkItem[];
};
