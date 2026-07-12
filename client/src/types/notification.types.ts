import { ConversationModel_Member } from "./conv.types";

// ─── Informations (notifications) page tabs ───────────────────────────────────
export type NotificationTab = "all" | "unread" | "requests" | "system";

// Thứ tự hiển thị tab + validate search param trên route (mirror CONNECTION_TABS).
export const NOTIFICATION_TABS: NotificationTab[] = [
  "all",
  "unread",
  "requests",
  "system",
];

type NewMessage_Contact = {
  id: string;
  name: string | null;
  avatar: string | null;
  bio?: string | null;
  isOnline?: boolean;
};

// type NewMessage_Message_Conversation_Member = {
//   friendId: string | null;
//   friendStatus: string | null;
//   isDeleted: boolean;
//   isModerator: boolean;
//   isNotifying: boolean;
//   contact: NewMessage_Contact;
//   id: string;
//   createdTime: string;
//   updatedTime: string | null;
//   lastSeenTime?: string | null;
//   unSeenMessages?: number;
// };

type NewMessage_Conversation = {
  id: string;
  title: string;
  avatar: string | null;
  isGroup: boolean;
  lastMessage: string | null;
  lastMessageContact: string | null;
  lastMessageTime: string | null;
  // members: NewMessage_Message_Conversation_Member[];
};

export type NewMessage = {
  id: string;
  type: string;
  content: string;
  createdTime: string;
  conversation: NewMessage_Conversation;
  members: ConversationModel_Member[];
  contact: NewMessage_Contact;
  attachments: any[];
  isForwarded?: boolean;
  // Chia sẻ danh bạ: thẻ liên hệ đính kèm (type = contact).
  sharedContact?: { contactId: string; name: string; avatar?: string | null };
  // Bình chọn (type = poll).
  poll?: {
    question: string;
    allowMultiple: boolean;
    closedTime?: string | null;
    closedBy?: string | null;
    options: { key: string; text: string; voterIds: string[] }[];
  };
};

export type NewConversation = {
  conversation: NewMessage_Conversation;
  members: ConversationModel_Member[];
};

export type NewReaction = {
  conversationId: string;
  messageId: string;
  likeCount: number;
  loveCount: number;
  careCount: number;
  wowCount: number;
  sadCount: number;
  angryCount: number;
  userId: string;
  // Enrich (BE EventNewReaction): để FE dựng banner + gate "tin của tôi" mà không lookup cache.
  // null/empty type = unreact → không banner.
  type?: string | null;
  reactorId?: string;
  reactorName?: string | null;
  reactorAvatar?: string | null;
  messageOwnerId?: string | null;
};

// Payload FCM "NewFriendRequest" (BE EventNewFriendRequest).
export type NewFriendRequest = {
  friendId: string;
  contactId: string;
  contactName?: string | null;
  contactAvatar?: string | null;
};

export type NewMessagePinned = {
  conversationId: string;
  messageId: string;
  isPinned: boolean;
  pinnedBy: string;
};

// Payload từ BE (NotifyMessageDeliveredModel / NotifyMessageReadModel).
// contactId = người vừa thực hiện delivered/read (không phải sender của tin nhắn gốc).
// FE dùng để cập nhật horizon của member tương ứng trong conversation cache,
// từ đó MessageContent re-render trạng thái Sent → Delivered → Seen.
export type MessageDeliveredEvent = {
  conversationId: string;
  contactId: string;
  messageId: string;
  deliveredTime: string;
  userId?: string;
};

export type MessageReadEvent = {
  conversationId: string;
  contactId: string;
  messageId: string;
  readTime: string;
  userId?: string;
};

// Tính năng 2: payload từ BE (NotifyMessageEditedModel / NotifyMessageRecalledModel).
export type MessageEditedEvent = {
  conversationId: string;
  messageId: string;
  content: string;
  editedTime: string;
  userId?: string;
};

export type MessageRecalledEvent = {
  conversationId: string;
  messageId: string;
  recalledTime: string;
  recalledByContactId: string;
  userId?: string;
};

// Bình chọn: state authoritative từ BE (EventPollUpdated). FE ghi đè voterIds theo key +
// closedTime/closedBy. Idempotent với duplicate/out-of-order FCM.
export type PollUpdatedEvent = {
  conversationId: string;
  messageId: string;
  options: { key: string; voterIds: string[] }[];
  closedTime?: string | null;
  closedBy?: string | null;
};

// Preview Link: thẻ preview đã sẵn sàng (BE fetch async xong). FE patch message.linkPreview
// theo messageId. Idempotent với duplicate/out-of-order FCM.
type LinkPreviewPayload = {
  url: string;
  title?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  siteName?: string | null;
};

export type LinkPreviewReadyEvent = {
  conversationId: string;
  messageId: string;
  // linkPreviews = mọi thẻ; linkPreview (singular) = thẻ đầu (giữ cho payload cũ).
  linkPreview: LinkPreviewPayload;
  linkPreviews?: LinkPreviewPayload[] | null;
};

// Phase 5 — Đợt 2b: 1 thành viên rời nhóm. Gửi cho member còn lại (cập nhật danh sách +
// dòng hệ thống) và chính người rời (thiết bị khác ẩn hội thoại khỏi danh sách).
export type MemberLeftEvent = {
  conversationId: string;
  contactId: string;
  contactName?: string;
  systemMessage?: {
    id: string;
    type: string;
    content: string;
    contactId: string;
    createdTime: string;
  } | null;
};

// Phase 3 — theme chat chung của hội thoại thay đổi → patch wallpaper/bubbleColor
// của conversation trong cache ["conversation"]. Null = về mặc định.
export type ConversationAppearanceChangedEvent = {
  conversationId: string;
  wallpaper?: string | null;
  bubbleColor?: string | null;
  changedBy: string;
  // Dòng hệ thống "{user} changed the chat theme" đã persist kèm lần đổi →
  // append vào message cache (id thật, khớp dữ liệu khi reload).
  systemMessage?: {
    id: string;
    type: string;
    content: string;
    contactId: string;
    createdTime: string;
  } | null;
};

// 1 contact đổi profile → patch tên/avatar/bio ở mọi nơi denormalize tên người đó.
export type ContactUpdatedEvent = {
  contactId: string;
  name: string;
  avatar: string;
  bio: string;
};
