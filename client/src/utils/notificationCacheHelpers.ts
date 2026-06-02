import dayjs from "dayjs";
import {
  ConversationCache,
  ConversationModel,
  ConversationModel_Member,
} from "../types/conv.types";
import {
  AttachmentCache,
  AttachmentModel,
  MessageCache,
  PendingMessageModel,
} from "../types/message.types";
import { NewMessage } from "../types/notification.types";

export const createNewConversation = (
  oldData: ConversationCache,
  conversation: ConversationModel,
  lastMessage?: string,
  lastMessageContact?: string,
  lastMessageTime?: string,
): ConversationCache => {
  const newConversation = {
    id: conversation.id,
    title: conversation.title,
    avatar: conversation.avatar,
    isGroup: conversation.isGroup,
    isNotifying: true,
    // Ưu tiên dùng param nếu được truyền vào, fallback về data từ conversation object
    lastMessage: lastMessage ?? conversation.lastMessage,
    lastMessageContact: lastMessageContact ?? conversation.lastMessageContact,
    lastMessageTime: lastMessageTime ?? conversation.lastMessageTime,
  };
  return {
    ...oldData,
    // Prepend lên đầu để conversation mới xuất hiện ở trên cùng danh sách
    conversations: [newConversation, ...(oldData.conversations ?? [])],
    filterConversations: [newConversation, ...(oldData.conversations ?? [])],
  };
};

export const updateConversationCache = (
  oldData: ConversationCache,
  conversation: ConversationModel,
  patch: Partial<{
    lastMessageId: string;
    lastMessage: string;
    lastMessageContact: string;
    lastMessageTime: string;
    unSeen: boolean;
    membersUpdater: (m: ConversationModel_Member[]) => ConversationModel_Member[];
  }>,
): ConversationCache => {
  const updated = (oldData.conversations ?? []).map((conv) =>
    conv.id !== conversation.id
      ? conv
      : {
          ...conv,
          // Chỉ merge field nào có trong patch (falsy → bỏ qua để không ghi đè giá trị hiện tại)
          ...(patch.lastMessageId && { lastMessageId: patch.lastMessageId }),
          ...(patch.lastMessage && { lastMessage: patch.lastMessage }),
          ...(patch.lastMessageContact && { lastMessageContact: patch.lastMessageContact }),
          ...(patch.lastMessageTime && { lastMessageTime: patch.lastMessageTime }),
          ...(patch.unSeen && { unSeen: patch.unSeen }),
          // membersUpdater là function transform → gọi với members hiện tại
          ...(patch.membersUpdater && { members: patch.membersUpdater(conv.members ?? []) }),
        },
  );
  return { ...oldData, conversations: updated, filterConversations: updated };
};

export const updateMessagesCache = (
  oldData: MessageCache,
  message: NewMessage,
): MessageCache => {
  // Tránh duplicate: server có thể gửi lại cùng message nếu reconnect
  if (oldData.messages.some((m) => m.id === message.id)) return oldData;

  return {
    ...oldData,
    messages: [
      ...oldData.messages,
      {
        ...message,
        contactId: message.contact.id,
        // Khởi tạo reaction với giá trị 0 (reaction thực tế đến qua event NewReaction)
        currentReaction: null,
        likeCount: 0,
        loveCount: 0,
        careCount: 0,
        wowCount: 0,
        sadCount: 0,
        angryCount: 0,
        isForwarded: message.isForwarded,
      } as PendingMessageModel,
    ],
  };
};

// Nâng forward delivered horizon cho một member cụ thể trong conversation cache.
// Idempotent: nếu deliveredTime cũ hơn lastDeliveredTime hiện có → no-op, giữ nguyên reference
// để React tránh re-render không cần thiết. Đồng bộ với MemberCache.MemberDelivered ở backend.
export const updateMemberDeliveredHorizon = (
  oldData: ConversationCache,
  conversationId: string,
  contactId: string,
  messageId: string,
  deliveredTime: string,
): ConversationCache => {
  const deliveredMs = dayjs(deliveredTime).valueOf();
  let mutated = false;

  const updated = (oldData.conversations ?? []).map((conv) => {
    if (conv.id !== conversationId) return conv;

    let convChanged = false;
    const members = (conv.members ?? []).map((m) => {
      if (m.contact?.id !== contactId) return m;
      // Idempotent guard: chỉ nâng forward (out-of-order event / duplicate FCM → no-op)
      if (m.lastDeliveredTime && dayjs(m.lastDeliveredTime).valueOf() >= deliveredMs) {
        return m;
      }
      convChanged = true;
      return { ...m, lastDeliveredTime: deliveredTime, lastDeliveredMessageId: messageId };
    });

    if (!convChanged) return conv;
    mutated = true;
    return { ...conv, members };
  });

  // No-op: không tạo reference mới cho ConversationCache nếu không có conversation nào đổi
  if (!mutated) return oldData;
  return { ...oldData, conversations: updated, filterConversations: updated };
};

// Nâng forward read horizon cho một member; đồng thời nâng delivered horizon
// (read implies delivered — đồng bộ với MemberCache.MemberSeenAll ở backend).
export const updateMemberReadHorizon = (
  oldData: ConversationCache,
  conversationId: string,
  contactId: string,
  messageId: string,
  readTime: string,
): ConversationCache => {
  const readMs = dayjs(readTime).valueOf();
  let mutated = false;

  const updated = (oldData.conversations ?? []).map((conv) => {
    if (conv.id !== conversationId) return conv;

    let convChanged = false;
    const members = (conv.members ?? []).map((m) => {
      if (m.contact?.id !== contactId) return m;
      const seenChanged = !m.lastSeenTime || dayjs(m.lastSeenTime).valueOf() < readMs;
      const delivChanged = !m.lastDeliveredTime || dayjs(m.lastDeliveredTime).valueOf() < readMs;
      // Idempotent guard: cả 2 horizon đã >= readTime → no-op
      if (!seenChanged && !delivChanged) return m;
      convChanged = true;
      return {
        ...m,
        ...(seenChanged && { lastSeenTime: readTime }),
        // Read implies delivered: nâng cả delivered horizon nếu còn cũ hơn readTime
        ...(delivChanged && {
          lastDeliveredTime: readTime,
          lastDeliveredMessageId: messageId,
        }),
      };
    });

    if (!convChanged) return conv;
    mutated = true;
    return { ...conv, members };
  });

  if (!mutated) return oldData;
  return { ...oldData, conversations: updated, filterConversations: updated };
};

export const updateAttachmentsCache = (
  oldData: AttachmentCache,
  attachments: AttachmentModel[],
): AttachmentCache => {
  const today = dayjs().format("MM/DD/YYYY");
  return {
    ...oldData,
    attachments: oldData.attachments.map((item) =>
      item.date === today
        // Prepend vào bucket hôm nay để ảnh mới hiển thị trước
        ? { ...item, attachments: [...attachments, ...item.attachments] }
        : item,
    ),
  };
};
