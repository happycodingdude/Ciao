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

export type ChatDetailType = "information" | "attachment" | null;

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

export type UserProfile = BaseModel & {
  name: string;
  avatar: string;
  bio: string;
  isOnline: boolean;
  lastLogout: string;
};

export type UpdateProfileRequest = {
  name: string;
  bio: string;
  avatar: string;
};

export type NotificationModel = BaseModel & {
  content: string;
  read: boolean;
  contactId: string;
  sourceId: string;
  sourceType: string;
};
