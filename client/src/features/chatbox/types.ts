import { ChangeEventHandler } from "react";
import { OnCloseType } from "../../types";
import {
  AttachmentModel,
  ConversationModel,
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
  attachments?: AttachmentModel[];
  files?: File[];
};

export type SendMessageResponse = {
  message?: string;
  attachments?: string[];
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

export type MessageContentProps = {
  message: PendingMessageModel;
  id: string;
  mt: boolean;
};
