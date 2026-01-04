import { ChangeEventHandler, MutableRefObject } from "react";
import { OnCloseType } from "../../types";
import {
  AttachmentModel,
  ConversationModel,
  ConversationModel_Contact,
  PendingMessageModel,
} from "../listchat/types";

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

export type UpdateConversationRequest = {
  id: string;
  title: string;
  avatar: string;
};

export type ReactMessageRequest = {
  conversationId: string;
  messageId: string;
  type: string;
  isUnReact: boolean;
};

export type ChatboxMenuProps = {
  chooseFile: ChangeEventHandler<HTMLInputElement>;
  className?: string;
};

export type UpdateConversationProps = OnCloseType & {
  selected: ConversationModel;
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
  id: string;
  message?: string;
  mine: boolean;
  pinned: boolean;
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
