import { QueryClient } from "@tanstack/react-query";
import { isConversationActive } from "../hooks/useActiveConversation";
import { UserProfile } from "../types/base.types";
import { ConversationCache, ConversationModel } from "../types/conv.types";
import { AttachmentCache } from "../types/message.types";
import { FriendCache } from "../types/friend.types";
import {
  MessageDeliveredEvent,
  MessageEditedEvent,
  MessageReadEvent,
  MessageRecalledEvent,
  ContactUpdatedEvent,
  NewConversation,
  NewMessage,
  NewMessagePinned,
  NewReaction,
} from "../types/notification.types";
import {
  createNewConversation,
  toPendingMessage,
  updateAttachmentsCache,
  updateConversationCache,
  updateMemberDeliveredHorizon,
  updateMemberReadHorizon,
  updateMessageEdited,
  updateMessageRecalled,
} from "./notificationCacheHelpers";
import {
  mutateMessagePages,
  updateMessageById,
  upsertRealtimeMessage,
} from "./messageCache";
import { markDelivered } from "../services/message.service";
import { playNotificationSound } from "./notificationSound";

// Phân luồng sự kiện realtime từ SignalR/push notification theo tên event
export const classifyNotification = (
  notificationData: any,
  queryClient: QueryClient,
  userInfo: UserProfile,
) => {
  const { event, data } = notificationData;
  switch (event) {
    case "NewMessage":        return onNewMessage(queryClient, data, userInfo);
    case "NewMembers":        return onNewMembers(queryClient, userInfo, data);
    case "NewConversation":   return onNewConversation(queryClient, userInfo, data);
    case "NewReaction":       return onNewReaction(queryClient, data);
    case "NewMessagePinned":  return onNewMessagePinned(queryClient, data);
    case "MessageDelivered":  return onMessageDelivered(queryClient, data, userInfo);
    case "MessageRead":       return onMessageRead(queryClient, data, userInfo);
    case "MessageEdited":     return onMessageEdited(queryClient, data);
    case "MessageRecalled":   return onMessageRecalled(queryClient, data);
    // Friend events (realtime qua SignalR). Cập nhật cache ["friend"] TRỰC TIẾP từ payload
    // (friendId) — không refetch. Riêng NewFriendRequest: phía nhận chưa có entry và payload
    // không kèm contact info → buộc refetch (vẫn do event kích hoạt, không phải poll).
    case "NewFriendRequest":  return onFriendRequestReceived(queryClient);
    case "FriendRequestAccepted": return onFriendAccepted(queryClient, data);
    case "FriendRequestCanceled":
    case "FriendRequestDenied":
    case "Unfriended":
      return onFriendRemoved(queryClient, data);
    // 1 contact đổi profile → patch tên/avatar/bio ở friend list + members.
    case "ContactUpdated":    return onContactUpdated(queryClient, data);
  }
};

type FriendEventData = { friendId?: string };

// Làm mới CẢ HAI cache notification khi có event tạo notification mới:
//  - ["notifications","infinite"]: trang /notifications + badge bell ở sidebar (cùng nguồn).
//  - ["notification"]: dropdown notification ở menu mobile.
//
// RACE: notification do BE tạo BẤT ĐỒNG BỘ (Kafka NotificationConsumer). FCM push được bắn
// lúc gửi tin — TRƯỚC khi bản ghi notification persist. Vì vậy refetch ngay thường trả list
// CŨ (chưa có noti mới) và không có event thứ 2 báo "đã persist". Hệ quả: đang đứng yên ở
// trang /notifications (tab focus, không refetchOnWindowFocus) thì trang không cập nhật gì.
//
// FIX: ngoài lần invalidate tức thì (đủ khi consumer nhanh / data đã có), lặp lại invalidate
// trễ vài nhịp để bắt được bản ghi persist muộn. invalidate chỉ refetch query đang ACTIVE
// (badge sidebar + trang nếu đang mở) và notification là sự kiện tần suất thấp → chi phí
// không đáng kể. (Triệt để hơn: BE phát event "NotificationCreated" sau khi persist.)
const REFRESH_DELAYS_MS = [0, 1200, 3000];

const invalidateNotifications = (queryClient: QueryClient) => {
  const run = () => {
    queryClient.invalidateQueries({ queryKey: ["notifications", "infinite"] });
    queryClient.invalidateQueries({ queryKey: ["notification"] });
  };
  for (const delay of REFRESH_DELAYS_MS) {
    if (delay === 0) run();
    else setTimeout(run, delay);
  }
};

const onFriendRequestReceived = (queryClient: QueryClient) => {
  queryClient.invalidateQueries({ queryKey: ["friend"] });
  queryClient.invalidateQueries({ queryKey: ["friend-suggestions"] });
  // friend_request luôn tạo 1 notification → làm mới badge bell + list.
  invalidateNotifications(queryClient);
};

// Lời mời được chấp nhận: entry đã có (request_sent) → đổi status sang "friend".
const onFriendAccepted = (queryClient: QueryClient, data: FriendEventData) => {
  const friendId = data?.friendId;
  if (!friendId) return;
  queryClient.setQueryData<FriendCache[]>(["friend"], (old) =>
    (old ?? []).map((f) =>
      f.contact?.friendId !== friendId
        ? f
        : { ...f, contact: { ...f.contact, friendStatus: "friend" } },
    ),
  );
};

// Huỷ lời mời / từ chối / huỷ kết bạn: xoá entry theo friendId.
const onFriendRemoved = (queryClient: QueryClient, data: FriendEventData) => {
  const friendId = data?.friendId;
  if (!friendId) return;
  queryClient.setQueryData<FriendCache[]>(["friend"], (old) =>
    (old ?? []).filter((f) => f.contact?.friendId !== friendId),
  );
  queryClient.invalidateQueries({ queryKey: ["friend-suggestions"] });
};

// Patch tên/avatar/bio của 1 contact ở mọi nơi FE denormalize: friend list + member
// của từng conversation (direct-chat title FE suy từ otherMember.contact.name nên cũng tự đúng).
const onContactUpdated = (
  queryClient: QueryClient,
  data: ContactUpdatedEvent,
) => {
  const { contactId, name, avatar, bio } = data ?? {};
  if (!contactId) return;

  queryClient.setQueryData<FriendCache[]>(["friend"], (old) =>
    (old ?? []).map((f) =>
      f.contact?.id !== contactId
        ? f
        : { ...f, contact: { ...f.contact, name, avatar, bio } },
    ),
  );

  const patchMembers = (conv: ConversationModel): ConversationModel => {
    if (!conv.members?.some((m) => m.contact?.id === contactId)) return conv;
    return {
      ...conv,
      members: conv.members.map((m) =>
        m.contact?.id !== contactId
          ? m
          : { ...m, contact: { ...m.contact, name, avatar, bio } },
      ),
    };
  };

  queryClient.setQueryData(["conversation"], (old: ConversationCache) => {
    if (!old) return old;
    return {
      ...old,
      conversations: old.conversations?.map(patchMembers),
      filterConversations: old.filterConversations?.map(patchMembers),
      selected: old.selected ? patchMembers(old.selected) : old.selected,
    };
  });
};

const onNewMessage = (queryClient: QueryClient, message: NewMessage, userInfo: UserProfile) => {
  const conversationId = message.conversation.id;
  // Kiểm tra user đang mở đúng conversation nhận tin hay không
  const isActive = isConversationActive(conversationId);

  // Phase 3 — phát âm thông báo khi có tin mới ở conversation KHÔNG đang mở,
  // nếu user bật SoundEnabled (mặc định bật khi payload cũ chưa có settings).
  if (!isActive && userInfo.settings?.soundEnabled !== false) {
    playNotificationSound();
  }

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
    // Conversation chưa có trong list → thêm mới (user được thêm vào group hoặc tin nhắn từ contact mới).
    // PHẢI kèm members (nếu thiếu, list lọc theo membership sẽ ẨN hội thoại mới → "không nhận
    // được tin") và unSeen (nếu thiếu, badge không đếm → lệch số).
    const newConv = buildConvFromMessage(message, !isActive);
    return {
      ...old,
      conversations: [newConv, ...(old.conversations ?? [])],
      filterConversations: [newConv, ...(old.filterConversations ?? [])],
    };
  });

  // Append tin mới vào message cache (no-op nếu conversation chưa load pages → user mở sẽ
  // fetch fresh; không invalidate-inactive để tránh reset pagination, đúng FCM-only).
  // Dùng upsert thay vì append thô: tin CỦA CHÍNH MÌNH có thể đang có bản optimistic
  // pending ở tab này (FCM về TRƯỚC khi API send confirm) → confirm bản đó thay vì
  // append bản thứ hai gây bubble đúp.
  upsertRealtimeMessage(queryClient, conversationId, toPendingMessage(message), userInfo.id);

  if (isActive && message.attachments.length > 0) {
    // Chỉ update attachment cache khi đang xem và tin có file đính kèm
    queryClient.setQueryData(["attachment", conversationId], (old: AttachmentCache) =>
      old ? updateAttachmentsCache(old, message.attachments) : old,
    );
  }

  if (message.contact.id !== userInfo.id) {
    markDelivered(conversationId, message.id).catch(console.error);

    // BE tạo notification mention khi user bị nhắc tên (@[name]) hoặc nhắc cả nhóm (@[All]).
    // Chỉ invalidate badge bell khi ĐÚNG có mention tới mình → tránh refetch mỗi tin nhắn.
    // Token tên khớp convention dùng ở ConversationReview/renderMessageWithMentions.
    const content = message.content ?? "";
    const mentionsMe =
      content.includes("@[All]") ||
      (!!userInfo.name && content.includes(`@[${userInfo.name}]`));
    if (mentionsMe) {
      invalidateNotifications(queryClient);
    }
  }
};

// Helper: map dữ liệu tin nhắn mới sang ConversationModel để thêm vào list.
// Gắn ĐỦ members (để list không lọc ẩn) + unSeen (để badge đếm đúng) + lastMessageId.
const buildConvFromMessage = (
  message: NewMessage,
  unSeen: boolean,
): ConversationModel => ({
  id: message.conversation.id,
  title: message.conversation.title,
  avatar: message.conversation.avatar ?? undefined,
  isGroup: message.conversation.isGroup,
  isNotifying: true,
  lastMessageId: message.id,
  lastMessage: message.content,
  lastMessageContact: message.contact.id,
  lastMessageTime: message.createdTime,
  unSeen,
  members: message.members,
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
      // Phải mirror từ filterConversations (không phải conversations) để không reset
      // bộ lọc/search đang active khi có hội thoại mới tới realtime.
      filterConversations: [newConv, ...(old.filterConversations ?? [])],
    };
  });
};

const onNewReaction = (queryClient: QueryClient, reaction: NewReaction) => {
  // Cập nhật toàn bộ reaction counts của tin nhắn theo dữ liệu server
  updateMessageById(queryClient, reaction.conversationId, reaction.messageId, (m) => ({
    ...m,
    likeCount: reaction.likeCount,
    loveCount: reaction.loveCount,
    careCount: reaction.careCount,
    wowCount: reaction.wowCount,
    sadCount: reaction.sadCount,
    angryCount: reaction.angryCount,
  }));
  // BE tạo notification khi có người react tin của user → làm mới badge bell + list.
  // Reaction tần suất thấp nên invalidate không đáng kể.
  invalidateNotifications(queryClient);
};

const onNewMessagePinned = (
  queryClient: QueryClient,
  pinned: NewMessagePinned,
) => {
  // Đồng bộ trạng thái pin và người ghim từ server
  updateMessageById(queryClient, pinned.conversationId, pinned.messageId, (m) => ({
    ...m,
    isPinned: pinned.isPinned,
    pinnedBy: pinned.pinnedBy,
  }));
};

// Receipt events từ FCM — cập nhật horizon của member tương ứng trong conversation cache.
// BE đã loại sender khỏi recipient list (NotificationConsumer.HandleNotifyMessage*), nên
// về lý thuyết user nhận event đều là người khác. Tuy nhiên multi-tab cùng userId vẫn có
// thể nhận event của chính mình → cache helper tự idempotent (no-op nếu time cũ hơn).
const onMessageDelivered = (
  queryClient: QueryClient,
  ev: MessageDeliveredEvent,
  userInfo: UserProfile,
) => {
  // Bỏ qua event do chính mình gây ra (defense in depth — BE đã filter)
  if (ev.contactId === userInfo.id) return;

  queryClient.setQueryData(["conversation"], (old: ConversationCache) =>
    old
      ? updateMemberDeliveredHorizon(
          old,
          ev.conversationId,
          ev.contactId,
          ev.messageId,
          ev.deliveredTime,
        )
      : old,
  );
};

const onMessageRead = (
  queryClient: QueryClient,
  ev: MessageReadEvent,
  userInfo: UserProfile,
) => {
  if (ev.contactId === userInfo.id) return;

  queryClient.setQueryData(["conversation"], (old: ConversationCache) =>
    old
      ? updateMemberReadHorizon(
          old,
          ev.conversationId,
          ev.contactId,
          ev.messageId,
          ev.readTime,
        )
      : old,
  );
};

// Tính năng 2: edit/recall realtime. BE đã loại người thực hiện khỏi recipient list,
// cache helper idempotent (no-op nếu cũ hơn / đã recalled) nên an toàn với duplicate FCM.
const onMessageEdited = (queryClient: QueryClient, ev: MessageEditedEvent) => {
  mutateMessagePages(queryClient, ev.conversationId, (page) =>
    updateMessageEdited(page, ev.messageId, ev.content, ev.editedTime),
  );
};

const onMessageRecalled = (
  queryClient: QueryClient,
  ev: MessageRecalledEvent,
) => {
  mutateMessagePages(queryClient, ev.conversationId, (page) =>
    updateMessageRecalled(
      page,
      ev.messageId,
      ev.recalledTime,
      ev.recalledByContactId,
    ),
  );
};
