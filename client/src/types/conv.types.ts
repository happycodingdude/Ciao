import { ChangeEventHandler } from "react";
import { BaseModel, OnCloseType } from "./base.types";

export type ConversationModel_Contact = {
  id?: string;
  name?: string;
  avatar?: string;
  bio?: string;
  isOnline?: boolean;
  // Last Seen (Phase 3): mốc hoạt động cuối (BE đã áp privacy mask); null = online hoặc bị ẩn.
  lastActiveTime?: string | null;
};

export type ConversationModel_Member = BaseModel & {
  isDeleted?: boolean;
  isModerator?: boolean;
  isNotifying?: boolean;
  contact?: ConversationModel_Contact;
  friendId?: string;
  friendStatus?: "friend" | "request_sent" | "request_received" | "new";
  lastSeenTime?: string | null;
  lastDeliveredMessageId?: string | null;
  lastDeliveredTime?: string | null;
  // unSeenMessages?: number;
  isNew?: boolean;
  directConversation?: string | null;
  // Phase 3 — cá nhân hóa (per-user trên member):
  pinnedTime?: string | null; // ghim hội thoại (member của chính mình)
  nickname?: string | null; // biệt danh member này trong hội thoại (mọi người thấy)
  // wallpaper/bubbleColor đã chuyển lên ConversationModel (theme chung cả hội thoại).
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
  hasAttachment?: boolean;
  // Phase 3 — theme chat CHUNG cho cả hội thoại (key preset, null = mặc định);
  // mọi thành viên đều thấy, sync realtime qua event ConversationAppearanceChanged.
  wallpaper?: string | null;
  bubbleColor?: string | null;
};

export type ConversationCache = {
  conversations?: ConversationModel[];
  filterConversations?: ConversationModel[];
  // Trạng thái phân trang của danh sách chat. Nằm TRONG cache để refetch page 1
  // (queryFn trả object mới) tự reset paging về đầu.
  page?: number;
  hasMore?: boolean;
  // Filter tab + search đang active (ListchatFilterContext ghi vào) để các helper
  // append trang mới lọc đúng mà không cần chạm React context.
  listFilter?: string;
  listSearch?: string;
  selected?: ConversationModel | null;
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
