import { BaseModel } from "../../types";

export type ConversationModel_Contact = {
  id?: string;
  name?: string;
  avatar?: string;
  bio?: string;
  isOnline?: boolean;
};

export type ConversationModel_Member = BaseModel & {
  isDeleted?: boolean;
  isModerator?: boolean;
  isNotifying?: boolean;
  contact?: ConversationModel_Contact;
  friendId?: string;
  friendStatus?: "friend" | "request_sent" | "request_received" | "new";
  lastSeenTime?: string | null;
  // unSeenMessages?: number;
  isNew?: boolean;
  directConversation?: string | null;
};

export type ConversationModel = BaseModel & {
  title?: string;
  avatar?: string;
  isGroup?: boolean;
  members?: ConversationModel_Member[];
  lastMessageId?: string | null;
  lastMessage?: string | null;
  lastMessageTime?: string | null;
  lastMessageContact?: string | null;
  lastSeenTime?: string | null;
  isNotifying?: boolean;
  unSeen?: boolean;
};

export type ConversationCache = {
  conversations?: ConversationModel[];
  filterConversations?: ConversationModel[];
  // selected?: ConversationModel;
  // reload?: boolean;
  createGroupChat?: boolean;
  quickChat?: boolean;
  message?: ConversationCache_Message;
};

export type ConversationCache_Message = {
  id?: string;
  type?: string;
  content?: string | null;
  contactId?: string;
  currentReaction?: string | null;
  pending?: boolean;
};

export type AttachmentModel = BaseModel & {
  type?: string;
  mediaUrl?: string;
  mediaName?: string;
  mediaSize?: number;
  pending?: boolean;
  local?: boolean;
};

// export type ReactionModel = {
//   contactId: string;
//   type: string;
// };

export type MessageModel = BaseModel & {
  type?: string;
  content?: string | null;
  contactId?: string;
  isPinned?: boolean;
  isForwarded?: boolean;
  replyId?: string;
  replyContent?: string;
  replyContact?: string;
  seenTime?: string | null;
  attachments?: AttachmentModel[];
  likeCount?: number;
  loveCount?: number;
  careCount?: number;
  wowCount?: number;
  sadCount?: number;
  angryCount?: number;
  currentReaction?: string | null;
  pinnedBy?: string | null;
  // reactions?: ReactionModel[];
};

export type PendingMessageModel = MessageModel & {
  pending?: boolean;
};

export type MessageCache = {
  conversationId: string;
  hasMore: boolean;
  messages: PendingMessageModel[];
};

export type AttachmentCache = {
  conversationId: string;
  attachments: AttachmentCache_Attachment[];
};

export type AttachmentCache_Attachment = {
  date: string;
  attachments: AttachmentModel[];
};
