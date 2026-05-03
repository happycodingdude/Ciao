import { useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { createDirectChatWithMessage } from "../services/friend.service";
import { getAttachments, getMessages, sendMessage } from "../services/message.service";
import { AttachmentCache, MessageCache, SendMessageRequest } from "../types/message.types";
import { ConversationCache } from "../types/conv.types";
import { ContactModel } from "../types/friend.types";
import {
  buildOptimisticConversation,
  findDirectConversation,
  optimisticId,
  prependConversation,
  reopenMember,
  replaceConversationId,
  syncConversations,
} from "../utils/conversationCache";
import {
  buildMessageEntry,
  DirectMessagePayload,
  getLastMessageText,
  upsertAttachmentCache,
} from "../utils/directMessageHelpers";
import { getToday } from "../utils/datetime";
import useConversation from "./useConversation";
import useInfo from "./useInfo";

export type { DirectMessagePayload };

type SendToContactOptions = {
  /** Pre-fetch messages & attachments before updating cache (needed when navigating to the conversation). */
  prefetch?: boolean;
  /** Called right before the API send, receives the resolved conversationId. */
  onNavigate?: (conversationId: string) => void;
};

export const useDirectMessage = () => {
  const queryClient = useQueryClient();
  const { data: info } = useInfo();
  const { data: conversations } = useConversation();

  const sendToContact = async (
    contact: ContactModel,
    payload: DirectMessagePayload,
    options: SendToContactOptions = {},
  ) => {
    const { prefetch = false, onNavigate } = options;
    const hasMedia = !!(payload.attachments?.length);

    // Tìm direct conversation (1-1) đã tồn tại với contact này
    const existedConversation = findDirectConversation(
      conversations?.conversations ?? [],
      contact.id ?? "",
    );

    if (existedConversation) {
      // --- Luồng: cuộc hội thoại đã tồn tại ---
      const convId = existedConversation.id ?? "";

      if (prefetch) {
        // Prefetch khi cần navigate ngay lập tức: đảm bảo cache có data trước khi render
        const hasMsgs = queryClient.getQueryData<MessageCache>(["message", convId]);
        const hasAtts = queryClient.getQueryData<AttachmentCache>(["attachment", convId]);
        if (!hasMsgs || !hasAtts) {
          const [msgs, atts] = await Promise.all([getMessages(convId, 1), getAttachments(convId)]);
          // Chỉ set vào cache nếu chưa có để tránh ghi đè data mới hơn
          if (!hasMsgs) queryClient.setQueryData(["message", convId], msgs);
          if (!hasAtts) queryClient.setQueryData(["attachment", convId], atts);
        }
      }

      const isDeleted =
        (existedConversation.members ?? []).find((m) => m.contact?.id === info?.id)?.isDeleted ??
        false;

      const updatedConv = {
        ...existedConversation,
        lastMessage: getLastMessageText(payload),
        lastMessageTime: dayjs().format(),
        // Nếu user đã rời group/xóa conversation → đánh dấu active lại
        members: reopenMember(existedConversation.members ?? [], info?.id ?? ""),
      };

      queryClient.setQueryData(["conversation"], (old: ConversationCache) =>
        isDeleted
          // User đã xóa hội thoại → prepend lên đầu list (hiện lại)
          ? prependConversation(old, updatedConv)
          // Hội thoại vẫn tồn tại → chỉ cập nhật nội dung lastMessage
          : syncConversations(
              old,
              (old.conversations ?? []).map((c) => (c.id !== convId ? c : updatedConv)),
            ),
      );

      const randomId = optimisticId();
      // Optimistic update: thêm tin nhắn pending ngay lập tức vào cache
      queryClient.setQueryData(["message", convId], (old: MessageCache) => ({
        ...old,
        messages: [...(old.messages ?? []), buildMessageEntry(randomId, payload, info?.id)],
      }));

      // Optimistic update attachment nếu có file đính kèm
      if (hasMedia) upsertAttachmentCache(queryClient, convId, randomId, payload.attachments!);

      onNavigate?.(convId);

      const body: SendMessageRequest = {
        type: payload.type,
        content: payload.content ?? "",
        attachments: payload.attachments,
        isForwarded: payload.isForwarded,
      };

      const res = await sendMessage(convId, body);
      // API thất bại → không confirm optimistic update (tin nhắn vẫn hiện pending)
      if (!res) return;

      // Replace pending id bằng id thật từ server
      queryClient.setQueryData(["message", convId], (old: MessageCache) => ({
        ...old,
        messages: (old.messages ?? []).map((m) =>
          m.id !== randomId ? m : { ...m, id: res.messageId, pending: false },
        ),
      }));
    } else {
      // --- Luồng: chưa có hội thoại với contact này → tạo mới ---
      const tempId = optimisticId();
      const newConv = buildOptimisticConversation(tempId, info!, contact, {
        lastMessage: getLastMessageText(payload),
      });

      // Thêm hội thoại optimistic lên đầu list trước khi API trả về
      queryClient.setQueryData(["conversation"], (old: ConversationCache) =>
        prependConversation(old, newConv),
      );

      onNavigate?.(tempId);

      // Gọi API trong background; không await để không block navigation
      createDirectChatWithMessage(contact.id ?? "", {
        message: payload.content ?? undefined,
        isForwarded: payload.isForwarded ?? false,
      }).then((res) => {
        if (!res) return;

        // Khi có id thật từ server → thay thế tempId trong cache
        queryClient.setQueryData(["conversation"], (old: ConversationCache) =>
          replaceConversationId(old, tempId, res.conversationId ?? ""),
        );

        // Khởi tạo message cache cho conversation mới với tin nhắn đã confirmed
        queryClient.setQueryData(["message", res.conversationId], (): MessageCache => ({
          conversationId: res.conversationId ?? "",
          hasMore: false,
          messages: [buildMessageEntry(res.messageId ?? tempId, payload, info?.id, false)],
        }));

        if (hasMedia) {
          // Khởi tạo attachment cache cho conversation mới
          queryClient.setQueryData(["attachment", res.conversationId], (): AttachmentCache => ({
            conversationId: res.conversationId ?? "",
            attachments: [{ date: getToday("MM/DD/YYYY"), attachments: payload.attachments ?? [] }],
          }));
        }
      });
    }
  };

  return { sendToContact };
};
