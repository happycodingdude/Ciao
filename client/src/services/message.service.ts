import HttpRequest from "../lib/fetch";
import {
  AttachmentCache,
  AttachmentCache_Attachment,
  MessageCache,
  MessageSearchResult,
  PinMessageRequest,
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
            ).replace("{page}", page),
    })
  ).data as MessageCache;
  const result: MessageCache = {
    conversationId: conversationId,
    hasMore: data.hasMore,
    messages: data.messages,
  };
  return result;
};

export const sendMessage = async (
  id: string,
  data: SendMessageRequest,
  timeout?: number,
) => {
  return (
    await HttpRequest<SendMessageRequest, SendMessageResponse>({
      method: "post",
      url: import.meta.env.VITE_ENDPOINT_MESSAGE_SEND.replace(
        "{conversationId}",
        id,
      ),
      data: data,
      timeout: timeout,
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
