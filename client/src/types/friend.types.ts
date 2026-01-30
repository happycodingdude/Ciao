import { BaseModel, OnCloseType } from "./base.types";

export type ContactModel = BaseModel & {
  username?: string | null;
  password?: string | null;
  name?: string;
  avatar?: string;
  bio?: string;
  isOnline?: boolean;
  lastLogout?: string | null;
  friendId?: string | null;
  friendStatus?: "friend" | "request_sent" | "request_received" | "new";
  directConversation?: string | null;
};

export type FriendCache = BaseModel & {
  status?: string | null;
  contact: ContactModel;
};

// export type QuickChatProfile = {
//   id: string;
//   avatar: string;
//   isOnline: boolean;
//   name: string;
//   friendId: string | null;
//   friendStatus: "friend" | "request_sent" | "request_received" | "new";
// };

export type QuickChatProps = OnCloseType & {
  rect?: DOMRect;
  offset?: number;
  profile?: ContactModel;
};

export type CreateDirectChatReq = {
  message?: string;
  isForwarded?: boolean;
};

export type CreateDirectChatRes = {
  conversationId?: string;
  messageId?: string;
};
