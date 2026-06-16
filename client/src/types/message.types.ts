import { MutableRefObject } from "react";
import { BaseModel } from "./base.types";
import { ConversationModel_Contact } from "./conv.types";

export type SeenContact = ConversationModel_Contact;

export type MentionModel = {
  name: string;
  avatar: string | null;
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
  showName?: boolean;
  showAvatar?: boolean;
  // True CHỈ khi message này là tin nhắn CUỐI CÙNG của conversation VÀ là của
  // mình (đã confirmed, không pending). Dùng để gate hiển thị message status:
  // theo rule sản phẩm, status (Sent/Delivered/Seen) chỉ được hiện ở tin
  // cuối conversation khi đó là tin của mình.
  isLastFromMe?: boolean;
  // Danh sách contact đã xem tin nhắn này. Theo rule sản phẩm, chỉ được set
  // khi tin này là tin cuối của conversation và là của mình. Pre-compute ở
  // Chatbox (`seenContactsByMessageId`) để tránh scan messages mỗi lần render.
  seenContacts?: SeenContact[];
};

export type MessageMenuProps = {
  conversationId: string;
  id?: string;
  message: PendingMessageModel;
  mine: boolean;
  pinned?: boolean;
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
  // Tính năng 2: edit / recall
  editedTime?: string | null;
  recalledTime?: string | null;
  recalledByContactId?: string | null;
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

export type GroupedMessage ={
  contactId: string;
  messages: PendingMessageModel[];
};

export type MessageSearchResult = BaseModel & {
  type: string;
  content: string;
  contactId: string;
};