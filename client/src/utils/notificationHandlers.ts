import { QueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { isConversationActive } from "../hooks/useActiveConversation";
import { UserProfile } from "../types/base.types";
import { ConversationCache, ConversationModel } from "../types/conv.types";
import { AttachmentCache, PinnedIdItem } from "../types/message.types";
import { FriendCache } from "../types/friend.types";
import { getMessagePreviewText } from "./messagePreview";
import {
  MessageDeliveredEvent,
  MessageEditedEvent,
  MessageReadEvent,
  MessageRecalledEvent,
  ContactUpdatedEvent,
  ConversationAppearanceChangedEvent,
  LinkPreviewReadyEvent,
  MemberLeftEvent,
  NewConversation,
  NewMessage,
  NewMessagePinned,
  NewReaction,
  PollUpdatedEvent,
} from "../types/notification.types";
import { updateConversationInCache } from "./conversationCache";
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
    case "PollUpdated":       return onPollUpdated(queryClient, data);
    case "LinkPreviewReady":  return onLinkPreviewReady(queryClient, data);
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
    // Phase 3 — theme chat chung của hội thoại thay đổi (người khác đổi) → patch ngay.
    case "ConversationAppearanceChanged":
      return onConversationAppearanceChanged(queryClient, data);
    // Phase 5 — Đợt 2: yêu cầu tham gia mới / được duyệt / từ chối / rút.
    // Payload chỉ có conversationId → refetch hàng chờ (quản trị) + badge notification.
    case "JoinRequestUpdated":
      return onJoinRequestUpdated(queryClient, data);
    // Phase 5 — fix tồn đọng: có người VÀO THẲNG nhóm qua link (gửi quản trị). Cache cần
    // refresh y hệt JoinRequestUpdated (badge notification + hàng chờ — request sót của
    // người vừa vào được BE dọn); banner hiển thị do SignalContext/buildBanner đảm nhiệm.
    case "MemberJoinedByLink":
      return onJoinRequestUpdated(queryClient, data);
    // Phase 5 — Đợt 2b: thành viên rời nhóm.
    case "MemberLeft":
      return onMemberLeft(queryClient, data, userInfo);
  }
};

// Rời nhóm: đánh dấu member đã rời trong cache ["conversation"] — một code path cho cả 2 phía:
//  - Chính người rời (thiết bị khác): member của MÌNH isDeleted → list filter ẩn hội thoại.
//  - Member còn lại: member NGƯỜI RỜI isDeleted → danh sách thành viên/sĩ số cập nhật ngay,
//    kèm dòng hệ thống "{user} left the group" (id thật, khớp dữ liệu khi reload).
const onMemberLeft = (
  queryClient: QueryClient,
  data: MemberLeftEvent,
  userInfo: UserProfile,
) => {
  const { conversationId, contactId, systemMessage } = data ?? {};
  if (!conversationId || !contactId) return;
  queryClient.setQueryData<ConversationCache>(["conversation"], (old) =>
    old
      ? updateConversationInCache(old, conversationId, (c) => ({
          ...c,
          members: (c.members ?? []).map((m) =>
            m.contact?.id !== contactId ? m : { ...m, isDeleted: true },
          ),
        }))
      : old,
  );
  if (contactId !== userInfo.id && systemMessage) {
    upsertRealtimeMessage(queryClient, conversationId, systemMessage);
  }
};

// Hàng chờ join-request là query theo conversation — invalidate để panel quản trị đang mở
// refetch; kèm notification (BE tạo bản ghi bền cho quản trị/người xin ở cùng transaction).
const onJoinRequestUpdated = (
  queryClient: QueryClient,
  data: { conversationId?: string },
) => {
  if (data?.conversationId) {
    queryClient.invalidateQueries({
      queryKey: ["joinRequests", data.conversationId],
    });
  }
  invalidateNotifications(queryClient);
};

// Theme chat (wallpaper + bubbleColor) là thuộc tính chung của conversation —
// patch trực tiếp, không refetch. Sự kiện chỉ fanout cho member KHÁC người đổi
// (người đổi đã optimistic-update trong useConversationAppearance).
const onConversationAppearanceChanged = (
  queryClient: QueryClient,
  data: ConversationAppearanceChangedEvent,
) => {
  const { conversationId, wallpaper, bubbleColor, systemMessage } = data ?? {};
  if (!conversationId) return;
  queryClient.setQueryData<ConversationCache>(["conversation"], (old) =>
    old
      ? updateConversationInCache(old, conversationId, (c) => ({
          ...c,
          wallpaper: wallpaper ?? null,
          bubbleColor: bubbleColor ?? null,
        }))
      : old,
  );
  // Dòng hệ thống "{user} changed the chat theme" — append nếu đang giữ cache tin
  // của hội thoại này (chưa từng mở chat → no-op, GetMessages lần đầu sẽ có sẵn).
  if (systemMessage) {
    upsertRealtimeMessage(queryClient, conversationId, systemMessage);
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
        lastMessage: getMessagePreviewText(message.type, message.content, message.attachments?.map((a) => a?.mediaName)),
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
  userInfo: UserProfile,
  conversation: NewConversation,
) => {
  queryClient.setQueryData(["conversation"], (old: ConversationCache) => {
    if (!old) return old;

    const exists = (old.conversations ?? []).find(
      (c) => c.id === conversation.conversation.id,
    );
    // Event mang system message "X joined ..." → cập nhật preview lastMessage của card
    // (khớp server truth, joiner không cần refetch /conversations).
    const message = conversation.message;
    if (exists) {
      // Event giờ mang snapshot ĐẦY ĐỦ member active (BE AllMembers; payload cũ in-flight
      // chỉ có member mới — merge dưới chạy đúng cho cả hai). Nguyên tắc:
      // - Field server-authoritative (isModerator, isDeleted, nickname) lấy từ event.
      // - Mốc per-user của CHÍNH MÌNH (lastSeenTime/isNotifying/pinnedTime/delivered)
      //   giữ theo cache — FE cập nhật realtime, snapshot có thể cũ hơn; ghi đè lùi làm
      //   sai divider "n tin nhắn mới" / trạng thái mute / Favorites.
      // - Member khác: nhận theo event nhưng lastSeenTime chỉ tiến không lùi (read receipt).
      // - Member chưa có trong cache → append: joiner (card optimistic chỉ có self) nhận
      //   đủ danh sách; member hiện hữu nhận member mới/rejoin.
      return updateConversationCache(old, conversation.conversation as ConversationModel, {
        membersUpdater: (members) => {
          const byId = new Map(
            conversation.members
              .filter((m) => m.contact?.id)
              .map((m) => [m.contact!.id, m]),
          );
          const merged = members.map((m) => {
            const inc = m.contact?.id ? byId.get(m.contact.id) : undefined;
            if (!inc) return m;
            byId.delete(m.contact!.id);
            if (m.contact?.id === userInfo?.id)
              return {
                ...m,
                isModerator: inc.isModerator,
                isDeleted: inc.isDeleted ?? false,
              };
            const keepSeen =
              m.lastSeenTime &&
              (!inc.lastSeenTime ||
                dayjs(inc.lastSeenTime).valueOf() <
                  dayjs(m.lastSeenTime).valueOf());
            return {
              ...m,
              ...inc,
              ...(keepSeen && { lastSeenTime: m.lastSeenTime }),
            };
          });
          return [...merged, ...byId.values()];
        },
        ...(message && {
          lastMessageId: message.id,
          lastMessage: getMessagePreviewText(message.type, message.content),
          lastMessageContact: message.contactId,
          lastMessageTime: message.createdTime,
        }),
        wallpaper: conversation.conversation.wallpaper,
        bubbleColor: conversation.conversation.bubbleColor,
      });
    }
    // Group chưa có trong list → user vừa được thêm vào group / vừa vào lại bằng link → thêm mới.
    // PHẢI kèm members (event mang đủ danh sách; tối thiểu self, isNew, !isDeleted) — nếu thiếu,
    // list lọc theo self-member active sẽ ẩn hội thoại vừa vào → "rejoin không hiện hội thoại".
    return createNewConversation(
      old,
      conversation.conversation as ConversationModel,
      message ? getMessagePreviewText(message.type, message.content) : undefined,
      message?.contactId,
      message?.createdTime,
      conversation.members,
    );
  });
  // System message "X joined ..." cho member đang mở hội thoại — cùng pattern MemberLeft.
  // upsert no-op khi message cache của hội thoại chưa load (member khác/joiner chưa mở chat),
  // dedupe theo id (FCM gửi lại / reload đã fetch bản Mongo).
  if (conversation.message) {
    upsertRealtimeMessage(
      queryClient,
      conversation.conversation.id,
      conversation.message,
    );
  }
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

// Bình chọn realtime: ghi đè voterIds theo key + closedTime/closedBy từ state server.
// Authoritative → reconcile bản optimistic của người vote; idempotent với duplicate/out-of-order.
// closedTime dùng `?? hiện tại` để event vote (poll mở, closedTime null) KHÔNG mở lại poll đã đóng.
const onPollUpdated = (queryClient: QueryClient, ev: PollUpdatedEvent) => {
  const voteMap = new Map((ev.options ?? []).map((o) => [o.key, o.voterIds ?? []]));
  updateMessageById(queryClient, ev.conversationId, ev.messageId, (m) => {
    if (!m.poll) return m;
    return {
      ...m,
      poll: {
        ...m.poll,
        closedTime: ev.closedTime ?? m.poll.closedTime,
        closedBy: ev.closedBy ?? m.poll.closedBy,
        options: m.poll.options.map((o) =>
          voteMap.has(o.key) ? { ...o, voterIds: voteMap.get(o.key)! } : o,
        ),
      },
    };
  });
};

// Preview Link realtime: gắn thẻ preview vào tin theo messageId (BE fetch async xong).
// Idempotent: ghi đè linkPreview từ state server, an toàn với duplicate/out-of-order FCM.
const onLinkPreviewReady = (
  queryClient: QueryClient,
  ev: LinkPreviewReadyEvent,
) => {
  if (!ev?.messageId || !ev?.linkPreview) return;
  // linkPreviews (mới) ưu tiên; fallback linkPreview (payload cũ) → 1 phần tử.
  const previews =
    ev.linkPreviews && ev.linkPreviews.length > 0
      ? ev.linkPreviews
      : ev.linkPreview
        ? [ev.linkPreview]
        : [];
  updateMessageById(queryClient, ev.conversationId, ev.messageId, (m) => ({
    ...m,
    linkPreview: ev.linkPreview,
    linkPreviews: previews,
  }));
};

const onNewMessagePinned = (
  queryClient: QueryClient,
  pinned: NewMessagePinned,
) => {
  // Pin đã tách khỏi message: cập nhật cache pinned ids (nguồn badge inline), không sửa message.
  queryClient.setQueryData<PinnedIdItem[]>(
    ["pinnedIds", pinned.conversationId],
    (old) => {
      const without = (old ?? []).filter(
        (p) => p.messageId !== pinned.messageId,
      );
      return pinned.isPinned
        ? [...without, { messageId: pinned.messageId, pinnedBy: pinned.pinnedBy }]
        : without;
    },
  );
  // Panel "Tin đã ghim" đang mở (nếu có) refetch để list khớp trạng thái mới.
  queryClient.invalidateQueries({
    queryKey: ["pinnedMessages", pinned.conversationId],
  });
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
  // Recall gỡ ghim ở server (xoá PinnedMessage) → đồng bộ FE: bỏ khỏi pinned ids + refetch panel.
  queryClient.setQueryData<PinnedIdItem[]>(
    ["pinnedIds", ev.conversationId],
    (old) => (old ?? []).filter((p) => p.messageId !== ev.messageId),
  );
  queryClient.invalidateQueries({
    queryKey: ["pinnedMessages", ev.conversationId],
  });
};
