import { QueryClient } from "@tanstack/react-query";
import { isConversationActive } from "../hooks/useActiveConversation";
import { UserProfile } from "../types/base.types";
import { ConversationCache, ConversationModel } from "../types/conv.types";
import { AttachmentCache, MessageCache } from "../types/message.types";
import {
  NewConversation,
  NewMessage,
  NewMessagePinned,
  NewReaction,
} from "../types/notification.types";
import {
  createNewConversation,
  updateAttachmentsCache,
  updateConversationCache,
  updateMessagesCache,
} from "./notificationCacheHelpers";

// Phân luồng sự kiện realtime từ SignalR/push notification theo tên event
export const classifyNotification = (
  notificationData: any,
  queryClient: QueryClient,
  userInfo: UserProfile,
) => {
  const { event, data } = notificationData;
  switch (event) {
    case "NewMessage":       return onNewMessage(queryClient, data);
    case "NewMembers":       return onNewMembers(queryClient, userInfo, data);
    case "NewConversation":  return onNewConversation(queryClient, userInfo, data);
    case "NewReaction":      return onNewReaction(queryClient, data);
    case "NewMessagePinned": return onNewMessagePinned(queryClient, data);
  }
};

const onNewMessage = (queryClient: QueryClient, message: NewMessage) => {
  const conversationId = message.conversation.id;
  // Kiểm tra user đang mở đúng conversation nhận tin hay không
  const isActive = isConversationActive(conversationId);

  queryClient.setQueryData(["conversation"], (old: ConversationCache) => {
    if (!old) return old;

    const exists = (old.conversations ?? []).some((c) => c.id === conversationId);
    if (exists) {
      // Conversation đã có → chỉ update metadata (lastMessage, unSeen...)
      return updateConversationCache(old, message.conversation as ConversationModel, {
        lastMessageId: message.id,
        lastMessage: message.content,
        lastMessageContact: message.contact.id,
        lastMessageTime: message.createdTime,
        // Đánh dấu unSeen chỉ khi user không đang xem conversation này
        unSeen: !isActive,
      });
    }
    // Conversation chưa có trong list → thêm mới (user được thêm vào group hoặc tin nhắn từ contact mới)
    return {
      ...old,
      conversations: [buildConvFromMessage(message), ...(old.conversations ?? [])],
      filterConversations: [buildConvFromMessage(message), ...(old.conversations ?? [])],
    };
  });

  if (isActive) {
    // User đang xem conversation → cập nhật message list ngay lập tức
    queryClient.setQueryData(["message", conversationId], (old: MessageCache) =>
      old ? updateMessagesCache(old, message) : old,
    );
  }

  // Invalidate cache cho các conversation không active để refetch khi user mở
  queryClient.invalidateQueries({
    queryKey: ["message", conversationId],
    refetchType: "inactive",
  });

  if (isActive && message.attachments.length > 0) {
    // Chỉ update attachment cache khi đang xem và tin có file đính kèm
    queryClient.setQueryData(["attachment", conversationId], (old: AttachmentCache) =>
      old ? updateAttachmentsCache(old, message.attachments) : old,
    );
  }
};

// Helper: map dữ liệu tin nhắn mới sang ConversationModel để thêm vào list
const buildConvFromMessage = (message: NewMessage): ConversationModel => ({
  id: message.conversation.id,
  title: message.conversation.title,
  avatar: message.conversation.avatar ?? undefined,
  isGroup: message.conversation.isGroup,
  isNotifying: true,
  lastMessage: message.content,
  lastMessageContact: message.contact.id,
  lastMessageTime: message.createdTime,
});

const onNewMembers = (
  queryClient: QueryClient,
  _userInfo: UserProfile,
  conversation: NewConversation,
) => {
  queryClient.setQueryData(["conversation"], (old: ConversationCache) => {
    if (!old) return old;

    const exists = (old.conversations ?? []).find(
      (c) => c.id === conversation.conversation.id,
    );
    if (exists) {
      // Group đã có → chỉ append thành viên mới (filter isNew để tránh duplicate)
      return updateConversationCache(old, conversation.conversation as ConversationModel, {
        membersUpdater: (members) => [
          ...members,
          ...conversation.members.filter((m) => m.isNew),
        ],
      });
    }
    // Group chưa có trong list → user vừa được thêm vào group → thêm mới
    return createNewConversation(old, conversation.conversation as ConversationModel);
  });
};

const onNewConversation = (
  queryClient: QueryClient,
  _userInfo: UserProfile,
  conversation: NewConversation,
) => {
  queryClient.setQueryData(["conversation"], (old: ConversationCache) => {
    if (!old) return old;

    // Đây là conversation hoàn toàn mới (ví dụ: người khác tạo direct chat với mình)
    const newConv: ConversationModel = {
      id: conversation.conversation.id,
      title: conversation.conversation.title,
      avatar: conversation.conversation.avatar ?? undefined,
      isGroup: conversation.conversation.isGroup,
      isNotifying: true,
      lastMessage: conversation.conversation.lastMessage,
      lastMessageContact: conversation.conversation.lastMessageContact,
      lastMessageTime: conversation.conversation.lastMessageTime,
      // Đánh dấu unSeen vì user chưa mở conversation này lần nào
      unSeen: true,
      members: conversation.members,
    };
    return {
      ...old,
      conversations: [newConv, ...(old.conversations ?? [])],
      filterConversations: [newConv, ...(old.conversations ?? [])],
    };
  });
};

const onNewReaction = (queryClient: QueryClient, reaction: NewReaction) => {
  queryClient.setQueryData(["message", reaction.conversationId], (old: MessageCache) => {
    if (!old) return old;
    return {
      ...old,
      messages: old.messages.map((m) =>
        m.id !== reaction.messageId
          ? m
          // Cập nhật toàn bộ reaction counts của tin nhắn theo dữ liệu server
          : {
              ...m,
              likeCount: reaction.likeCount,
              loveCount: reaction.loveCount,
              careCount: reaction.careCount,
              wowCount: reaction.wowCount,
              sadCount: reaction.sadCount,
              angryCount: reaction.angryCount,
            },
      ),
    } as MessageCache;
  });
};

const onNewMessagePinned = (
  queryClient: QueryClient,
  pinned: NewMessagePinned,
) => {
  queryClient.setQueryData(["message", pinned.conversationId], (old: MessageCache) => {
    if (!old) return old;
    return {
      ...old,
      messages: old.messages.map((m) =>
        m.id !== pinned.messageId
          ? m
          // Đồng bộ trạng thái pin và người ghim từ server
          : { ...m, isPinned: pinned.isPinned, pinnedBy: pinned.pinnedBy },
      ),
    } as MessageCache;
  });
};
