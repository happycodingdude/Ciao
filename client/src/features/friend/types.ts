import { BaseModel, OnCloseType } from "../../types";

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
};

export type FriendCache = BaseModel & {
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
