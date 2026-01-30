import { ChangeEventHandler } from "react";
import { BaseModel, OnCloseType } from "./base.types";

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

export type UpdateConversationRequest = {
  id: string;
  title: string;
  avatar: string;
};

export type ChatboxMenuProps = {
  chooseFile: ChangeEventHandler<HTMLInputElement>;
  className?: string;
};

export type UpdateConversationProps = OnCloseType & {
  selected: ConversationModel;
};

export type CreateGroupChatRequest = {
  title: string;
  avatar?: string;
  members: string[];
};
