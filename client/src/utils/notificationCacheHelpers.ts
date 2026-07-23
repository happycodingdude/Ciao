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
  // Danh sách thành viên đi kèm. BẮT BUỘC truyền khi biết (vd. sự kiện NewMembers): danh sách
  // hội thoại ở ListChatContainer lọc theo self-member `!isDeleted` — thiếu members thì hội thoại
  // vừa thêm/vừa vào lại nhóm sẽ bị ẩn hoàn toàn.
  members?: ConversationModel_Member[],
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
    members: members ?? conversation.members,
    // Theme chung hội thoại — event NewMembers mang theo (nguồn khác không có → undefined).
    wallpaper: conversation.wallpaper,
    bubbleColor: conversation.bubbleColor,
  };
  return {
    ...oldData,
    // Prepend lên đầu để conversation mới xuất hiện ở trên cùng danh sách
    conversations: [newConversation, ...(oldData.conversations ?? [])],
    // Mirror từ filterConversations (không phải conversations) để không reset bộ lọc/search đang active.
    filterConversations: [newConversation, ...(oldData.filterConversations ?? [])],
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
    // Theme chung hội thoại (null = mặc định). undefined = event không mang → giữ nguyên.
    wallpaper: string | null;
    bubbleColor: string | null;
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
          // unSeen là boolean → phải dùng !== undefined, KHÔNG dùng truthy (false bị bỏ qua
          // → unSeen kẹt true → badge overcount khi tin đến lúc đang xem chính hội thoại đó).
          ...(patch.unSeen !== undefined && { unSeen: patch.unSeen }),
          // membersUpdater là function transform → gọi với members hiện tại
          ...(patch.membersUpdater && { members: patch.membersUpdater(conv.members ?? []) }),
          // Theme: null là giá trị hợp lệ (về mặc định) → guard bằng !== undefined
          ...(patch.wallpaper !== undefined && { wallpaper: patch.wallpaper }),
          ...(patch.bubbleColor !== undefined && { bubbleColor: patch.bubbleColor }),
        },
  );
  return { ...oldData, conversations: updated, filterConversations: updated };
};

// Đánh dấu 1 conversation là ĐÃ XEM trong cache (cả conversations + filterConversations).
// Gọi đúng thời điểm user đọc tin cuối (markRead ở Chatbox) → tự sửa cả trường hợp race:
// tin đến lúc đang xem nhưng isConversationActive lỡ trả false → unSeen bị set true →
// badge đếm oan dù list tô màu "active". No-op nếu đã seen (giữ reference, tránh re-render).
export const markConversationSeen = (
  oldData: ConversationCache,
  conversationId: string,
): ConversationCache => {
  let changed = false;
  const clear = (list?: ConversationModel[]) =>
    (list ?? []).map((c) => {
      if (c.id !== conversationId || !c.unSeen) return c;
      changed = true;
      return { ...c, unSeen: false };
    });
  const conversations = clear(oldData.conversations);
  const filterConversations = clear(oldData.filterConversations);
  if (!changed) return oldData;
  return { ...oldData, conversations, filterConversations };
};

// Map NewMessage (payload FCM) → PendingMessageModel để đưa vào message cache.
export const toPendingMessage = (message: NewMessage): PendingMessageModel =>
  ({
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
  }) as PendingMessageModel;

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

      const horizonMessageId = m.lastDeliveredMessageId;
      // Idempotent theo messageId: horizon đã tới message này hoặc xa hơn → no-op
      if (horizonMessageId) {
        if (horizonMessageId === messageId) return m;
        if (
          horizonMessageId.length === messageId.length &&
          horizonMessageId > messageId
        ) {
          return m;
        }
      }
      // Fallback time-only khi chưa có horizon messageId (legacy / partial data)
      if (
        !horizonMessageId &&
        m.lastDeliveredTime &&
        dayjs(m.lastDeliveredTime).valueOf() >= deliveredMs
      ) {
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

// Tính năng 2: cập nhật message khi nhận event MessageEdited (idempotent — chỉ apply forward).
// Preserve reference khi không đổi để tránh re-render thừa.
export const updateMessageEdited = (
  oldData: MessageCache,
  messageId: string,
  content: string,
  editedTime: string,
): MessageCache => {
  const editedMs = dayjs(editedTime).valueOf();
  let mutated = false;

  const messages = oldData.messages.map((m) => {
    if (m.id !== messageId) return m;
    // Idempotent guard: bỏ qua nếu đã edit mới hơn hoặc bằng.
    if (m.editedTime && dayjs(m.editedTime).valueOf() >= editedMs) return m;
    mutated = true;
    return { ...m, content, editedTime };
  });

  if (!mutated) return oldData;
  return { ...oldData, messages };
};

// Cập nhật message khi nhận event MessageRecalled — clear nội dung/attachment, set recalled.
// No-op nếu đã recalled (idempotent với duplicate event).
export const updateMessageRecalled = (
  oldData: MessageCache,
  messageId: string,
  recalledTime: string,
  recalledByContactId: string,
): MessageCache => {
  let mutated = false;

  const messages = oldData.messages.map((m) => {
    if (m.id !== messageId) return m;
    if (m.recalledTime) return m; // đã recalled → no-op
    mutated = true;
    return {
      ...m,
      recalledTime,
      recalledByContactId,
      content: "",
      attachments: [],
    };
  });

  if (!mutated) return oldData;
  return { ...oldData, messages };
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
