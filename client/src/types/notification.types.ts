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
