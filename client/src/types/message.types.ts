import { MutableRefObject } from "react";
import { BaseModel } from "./base.types";
import { ConversationModel_Contact } from "./conv.types";

export type MentionModel = {
  name: string;
  avatar: string;
  userId: string;
};

export type SendMessageRequest = {
  type: string;
  content: string;
  isForwarded?: boolean;
  attachments?: AttachmentModel[];
  files?: File[];
};

export type SendMessageResponse = {
  messageId?: string;
  attachments?: string[];
};

export type ReactMessageRequest = {
  conversationId: string;
  messageId: string;
  type: string;
  isUnReact: boolean;
};

export type MessageContentProps = {
  message: PendingMessageModel;
  id: string;
  // mt: boolean;
  refContainer?: MutableRefObject<HTMLDivElement>;
  getContainerRect?: () => DOMRect;
};

export type MessageMenuProps = {
  conversationId: string;
  message: PendingMessageModel;
  mine: boolean;
  contact: ConversationModel_Contact;
  getContainerRect?: () => DOMRect;
};

export type PinMessageRequest = {
  conversationId: string;
  messageId: string;
  pinned: boolean;
};

export type MessageListProps = {
  messages: MessageContentProps[];
  currentUserId: string;
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
