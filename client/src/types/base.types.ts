import { Dispatch, SetStateAction } from "react";

// Re-export component prop types so existing imports continue to work
export type {
  ChatInputProps,
  CustomButtonProps,
  CustomContentEditableProps,
  CustomInputProps,
  CustomLabelProps,
  FriendCtaButtonProps,
  FriendItemProps,
  ImageWithLightboxProps,
  ListFriendProps,
  MediaPickerProps,
  MessageReactionProps,
  MessageReactionProps_Message,
  MessageReactionProps_Message_Reaction,
  OnCloseType,
  OnlineStatusDotProps,
  BackgroundPortalProps,
  PortalHeaderProps,
  ReactionModel,
  RelightBackgroundProps,
  SideBarProps,
} from "./component.types";

// ─── Context & UI state types ─────────────────────────────────────────────────

export type AuthenticationFormType = "signin" | "signup" | "forgot";

export type TogglesContextType<T> = {
  toggle: T;
  setToggle: Dispatch<SetStateAction<T>>;
};

export type LoadingContextType = {
  loading: boolean;
  setLoading: Dispatch<SetStateAction<boolean>>;
};

export type BooleanContextType = {
  value: boolean;
  setValue: Dispatch<SetStateAction<boolean>>;
};

export type ListchatFilterType = {
  filter: string;
  setFilter: Dispatch<SetStateAction<string>>;
  search: string;
  setSearch: Dispatch<SetStateAction<string>>;
};

export type EventListenerHook<T extends HTMLElement | Window> = (
  event: keyof WindowEventMap | string,
  callback: (event: Event) => void,
  element?: T | null,
) => void;

// ─── HTTP & Auth types ────────────────────────────────────────────────────────

export type HttpRequest<TReq = undefined, TRes = undefined> = {
  method?: "get" | "post" | "put" | "delete" | "patch";
  url: string;
  headers?: Record<string, string>;
  data?: TReq | undefined;
  alert?: boolean;
  response?: TRes;
  timeout?: number;
};

export type SigninRequest = {
  username: string;
  password: string;
};

export type SignupRequest = SigninRequest & {
  name: string;
};

export type TokenModel = {
  accessToken: string;
  refreshToken: string;
  userId: string;
};

export type RefreshRequest = {
  userId: string;
  refreshToken: string;
};

export type RequestPermission = {
  registerConnection: (token: string) => void;
  onNotification?: (notificationData: NotificationData) => void;
};

export type NotificationData = {
  event: string;
  data: Record<string, any>;
};

// ─── Domain types ─────────────────────────────────────────────────────────────

export type BaseModel = {
  id?: string;
  createdTime?: string;
  updatedTime?: string;
};

// Per-user preferences (embedded trên Contact). camelCase khớp JSON serializer của BE.
export type ContactSettings = {
  // Privacy
  showOnlineStatus: boolean;
  showLastSeen: boolean;
  // Notification preferences
  pushEnabled: boolean;
  notifyOnMessage: boolean;
  notifyOnFriendRequest: boolean;
  notifyOnReaction: boolean;
  soundEnabled: boolean;
};

export type UserProfile = BaseModel & {
  name: string;
  avatar: string;
  bio: string;
  isOnline: boolean;
  lastLogout: string;
  // GetInfo trả kèm Settings (optional để tương thích payload cũ).
  settings?: ContactSettings;
};

export type UpdateProfileRequest = {
  name: string;
  bio: string;
  avatar: string;
};

export type ChangePasswordRequest = {
  oldPassword: string;
  newPassword: string;
};

export type NotificationModel = BaseModel & {
  content: string;
  read: boolean;
  contactId: string;
  sourceId: string;
  sourceType: string;
  // Bóc tách cho UI kiểu Teams (avatar + tên đậm + action + preview).
  // Optional: bản ghi cũ chưa có → FE fallback về content/icon.
  actorName?: string;
  actorAvatar?: string;
  action?: string;
  preview?: string;
  sourceMessageId?: string; // tin nhắn gốc → highlight trong pane review
};
