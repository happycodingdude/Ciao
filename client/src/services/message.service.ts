import HttpRequest from "../lib/fetch";
import {
  AttachmentCache,
  AttachmentCache_Attachment,
  GetPinnedMessagesResponse,
  MessageCache,
  MessageSearchResult,
  PinMessageRequest,
  PinnedIdItem,
  ReactMessageRequest,
  SendMessageRequest,
  SendMessageResponse,
} from "../types/message.types";

export const getMessages = async (conversationId: string, page: number) => {
  const data = (
    await HttpRequest<undefined, MessageCache>({
      method: "get",
      url:
        page === 1
          ? import.meta.env.VITE_ENDPOINT_MESSAGE_GET.replace(
            "{id}",
            conversationId,
          )
          : import.meta.env.VITE_ENDPOINT_MESSAGE_GETWITHPAGING.replace(
            "{id}",
            conversationId,
          ).replace("{page}", String(page)),
    })
  ).data as MessageCache;
  const result: MessageCache = {
    conversationId: conversationId,
    hasMore: data.hasMore,
    messages: data.messages,
  };
  return result;
};

// Lấy cửa sổ tin nhắn quanh 1 messageId (mặc định 5 trước + 5 sau). Dùng cho pane review
// notification: tin được mention/react có thể nằm sâu trong lịch sử, không có ở page 1.
export const getMessagesAround = async (
  conversationId: string,
  messageId: string,
  radius: number = 5,
): Promise<MessageCache> => {
  const data = (
    await HttpRequest<undefined, MessageCache>({
      method: "get",
      url: import.meta.env.VITE_ENDPOINT_MESSAGE_GET_AROUND.replace(
        "{id}",
        conversationId,
      )
        .replace("{messageId}", messageId)
        .replace("{radius}", String(radius)),
    })
  ).data as MessageCache;
  return {
    conversationId,
    hasMore: data.hasMore,
    messages: data.messages,
  };
};

export const sendMessage = async (
  id: string,
  data: SendMessageRequest,
  requestTimeout?: number,
) => {
  return (
    await HttpRequest<SendMessageRequest, SendMessageResponse>({
      method: "post",
      url: import.meta.env.VITE_ENDPOINT_MESSAGE_SEND.replace(
        "{conversationId}",
        id,
      ),
      data: data,
      // Abort nếu server treo/chậm quá lâu → reject → đánh dấu tin failed (không pending vô hạn)
      requestTimeout,
    })
  ).data;
};

export const reactMessage = async (model: ReactMessageRequest) => {
  return (
    await HttpRequest({
      method: "put",
      url: model.isUnReact
        ? import.meta.env.VITE_ENDPOINT_MESSAGE_UNREACT.replace(
          "{conversationId}",
          model.conversationId,
        ).replace("{id}", model.messageId)
        : import.meta.env.VITE_ENDPOINT_MESSAGE_REACT.replace(
          "{conversationId}",
          model.conversationId,
        )
          .replace("{id}", model.messageId)
          .replace("{type}", model.type),
    })
  ).data;
};

export const pinMessage = async (model: PinMessageRequest) => {
  return (
    await HttpRequest({
      method: "put",
      url: import.meta.env.VITE_ENDPOINT_MESSAGE_PIN.replace(
        "{conversationId}",
        model.conversationId,
      )
        .replace("{id}", model.messageId)
        .replace("{pinned}", model.pinned),
    })
  ).data;
};

export const searchMessages = async (
  conversationId: string,
  keyword: string,
) => {
  return (
    await HttpRequest<undefined, MessageSearchResult[]>({
      method: "get",
      url: import.meta.env.VITE_ENDPOINT_MESSAGE_SEARCH.replace(
        "{id}",
        conversationId,
      ).replace("{keyword}", encodeURIComponent(keyword)),
    })
  ).data ?? [];
};

// Panel "Tin đã ghim" — phân trang (page/limit) cho load-more; keyword optional: server lọc
// theo nội dung khi FE không match trong list đã tải sẵn (đồng bộ hành vi với getConversationBookmarks).
export const getPinnedMessages = async (
  conversationId: string,
  page: number = 1,
  limit: number = 20,
  keyword: string = "",
) => {
  return (
    await HttpRequest<undefined, GetPinnedMessagesResponse>({
      method: "get",
      url: import.meta.env.VITE_ENDPOINT_MESSAGE_PINNED.replace(
        "{id}",
        conversationId,
      )
        .replace("{page}", String(page))
        .replace("{limit}", String(limit))
        .replace("{keyword}", encodeURIComponent(keyword)),
    })
  ).data ?? { hasMore: false, items: [] };
};

// messageId + người ghim của tin đã ghim trong hội thoại — FE hiển thị badge/tooltip inline
// trên từng tin (đối xứng getConversationBookmarkIds).
export const getConversationPinnedIds = async (conversationId: string) => {
  return (
    await HttpRequest<undefined, PinnedIdItem[]>({
      method: "get",
      url: import.meta.env.VITE_ENDPOINT_CONVERSATION_PINNED_IDS.replace(
        "{id}",
        conversationId,
      ),
    })
  ).data ?? [];
};

export const getAttachments = async (conversationId: string) => {
  const data = (
    await HttpRequest<undefined, AttachmentCache_Attachment[]>({
      method: "get",
      url: import.meta.env.VITE_ENDPOINT_ATTACHMENT_GET.replace(
        "{id}",
        conversationId,
      ),
      timeout: 500,
    })
  ).data;
  const result: AttachmentCache = {
    conversationId: conversationId,
    attachments: (data ?? []) as AttachmentCache_Attachment[],
  };
  return result;
};

export const markDelivered = async (conversationId: string, messageId: string, deliveredTime?: string) => {
  return (
    await HttpRequest({
      method: "post",
      url: import.meta.env.VITE_ENDPOINT_MESSAGE_SEND.replace(
        "{conversationId}",
        conversationId,
      ) + "/delivered",
      data: { messageId, deliveredTime: deliveredTime || new Date().toISOString() },
    })
  ).data;
};

export const markRead = async (conversationId: string, messageId: string, readTime?: string) => {
  return (
    await HttpRequest({
      method: "post",
      url: import.meta.env.VITE_ENDPOINT_MESSAGE_SEND.replace(
        "{conversationId}",
        conversationId,
      ) + "/read",
      data: { messageId, readTime: readTime || new Date().toISOString() },
    })
  ).data;
};

// Tính năng 2: edit (PUT) — chỉ áp dụng cho message type text của chính mình, còn trong TTL.
export const editMessage = async (
  conversationId: string,
  messageId: string,
  content: string,
) => {
  return (
    await HttpRequest<{ content: string }, boolean>({
      method: "put",
      url: import.meta.env.VITE_ENDPOINT_MESSAGE_EDIT.replace(
        "{conversationId}",
        conversationId,
      ).replace("{id}", messageId),
      data: { content },
    })
  ).data;
};

// Dịch tin nhắn: gửi text + ngôn ngữ đích, nhận bản dịch (provider abstraction ở BE).
export const translateMessage = async (
  text: string,
  targetLang?: string,
): Promise<{ translatedText: string; detectedSourceLang?: string }> => {
  return (
    await HttpRequest<
      { text: string; targetLang?: string },
      { translatedText: string; detectedSourceLang?: string }
    >({
      method: "post",
      url: import.meta.env.VITE_ENDPOINT_MESSAGE_TRANSLATE,
      data: { text, targetLang },
    })
  ).data as { translatedText: string; detectedSourceLang?: string };
};

// Bình chọn: bỏ phiếu 1 option (fire-and-forget, persist atomic ở BE).
export const votePoll = async (
  conversationId: string,
  messageId: string,
  optionKey: string,
  allowMultiple: boolean,
) => {
  return (
    await HttpRequest({
      method: "put",
      url: import.meta.env.VITE_ENDPOINT_MESSAGE_POLL_VOTE.replace(
        "{conversationId}",
        conversationId,
      )
        .replace("{id}", messageId)
        .replace("{optionKey}", encodeURIComponent(optionKey))
        .replace("{allowMultiple}", String(allowMultiple)),
    })
  ).data;
};

// Bình chọn: đóng poll (chỉ người tạo).
export const closePoll = async (conversationId: string, messageId: string) => {
  return (
    await HttpRequest({
      method: "put",
      url: import.meta.env.VITE_ENDPOINT_MESSAGE_POLL_CLOSE.replace(
        "{conversationId}",
        conversationId,
      ).replace("{id}", messageId),
    })
  ).data;
};

// Recall (delete-for-everyone) — sender hoặc moderator group, còn trong TTL.
export const recallMessage = async (
  conversationId: string,
  messageId: string,
) => {
  return (
    await HttpRequest<undefined, boolean>({
      method: "post",
      url: import.meta.env.VITE_ENDPOINT_MESSAGE_RECALL.replace(
        "{conversationId}",
        conversationId,
      ).replace("{id}", messageId),
    })
  ).data;
};
