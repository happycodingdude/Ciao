import { BaseModel } from "../../types";

export type ConversationModel_Contact = {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  isOnline: boolean;
};

export type ConversationModel_Member = BaseModel & {
  isDeleted: boolean;
  isModerator: boolean;
  isNotifying: boolean;
  contact: ConversationModel_Contact;
  friendId: string;
  friendStatus: "friend" | "request_sent" | "request_received" | "new";
};

export type ConversationModel = BaseModel & {
  title: string;
  avatar: string;
  isGroup: boolean;
  deletedTime: string | null;
  members: ConversationModel_Member[];
  unSeenMessages: number;
  lastMessageId: string | null;
  lastMessage: string | null;
  lastMessageTime: string | null;
  lastMessageContact: string | null;
  lastSeenTime: string | null;
  isNotifying: boolean;
};

export type ConversationCache = {
  conversations: ConversationModel[];
  filterConversations: ConversationModel[];
  selected?: ConversationModel;
  reload?: boolean;
  createGroupChat?: boolean;
  quickChat?: boolean;
};

export type AttachmentModel = BaseModel & {
  type: string;
  mediaUrl?: string;
  mediaName?: string;
  mediaSize?: number;
};

export type MessageModel = BaseModel & {
  type: string;
  content: string | null;
  status: string;
  isPinned: boolean;
  seenTime: string | null;
  contactId: string;
  attachments: AttachmentModel[];
  likeCount: number;
  loveCount: number;
  careCount: number;
  wowCount: number;
  sadCount: number;
  angryCount: number;
  currentReaction: string | null;
};

export type MessageCache = {
  hasMore: boolean;
  messages: MessageModel[];
};

export type AttachmentCache = {
  date: string;
  attachments: AttachmentModel[];
};
