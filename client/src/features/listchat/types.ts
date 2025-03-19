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
  unSeenMessages?: number;
  isNew?: boolean;
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
};

export type ConversationCache = {
  conversations?: ConversationModel[];
  filterConversations?: ConversationModel[];
  selected?: ConversationModel;
  reload?: boolean;
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

export type MessageModel = BaseModel & {
  type?: string;
  content?: string | null;
  status?: string;
  isPinned?: boolean;
  seenTime?: string | null;
  contactId?: string;
  attachments?: AttachmentModel[];
  likeCount?: number;
  loveCount?: number;
  careCount?: number;
  wowCount?: number;
  sadCount?: number;
  angryCount?: number;
  currentReaction?: string | null;
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
