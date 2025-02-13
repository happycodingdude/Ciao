import { QueryClient } from "@tanstack/react-query";
import {
  ChangeEventHandler,
  Dispatch,
  HTMLAttributes,
  KeyboardEventHandler,
  MutableRefObject,
  ReactNode,
  SetStateAction,
} from "react";
import { ContactModel } from "./features/friend/types";
import { NotifyMessageModel } from "./features/notification/services/notifyMessage";

export type CustomInputProps = {
  type?: string;
  label?: string;
  inputRef?: MutableRefObject<HTMLInputElement & { reset?: () => void }>;
  className?: string;
  placeholder?: string;
  tabIndex?: number;
  onKeyDown?: KeyboardEventHandler<HTMLInputElement>;
  onChange?: ChangeEventHandler<HTMLInputElement>;
};

export type SideBarProps = {
  page: string;
  setPage: Dispatch<SetStateAction<string>>;
};

export type RelightBackgroundProps = {
  children?: ReactNode;
  lighten?: boolean;
  className?: string;
  onClick?: () => void;
  paddingClassName?: string;
} & HTMLAttributes<HTMLDivElement>;

export type ImageWithLightboxProps = {
  src?: string;
  title?: string;
  className?: string;
  imageClassName?: string;
  roundedClassName?: string;
  slides?: { src: string }[]; // Assuming slides contain image URLs
  index?: number;
  circle?: boolean;
  pending?: boolean;
  onClick?: () => void;
};

export type MediaPickerProps = {
  className?: string;
  multiple?: boolean;
  accept?: string;
  id?: string;
  onChange?: ChangeEventHandler<HTMLInputElement>;
};

export type CustomButtonProps = {
  title?: string;
  className?: string;
  padding?: string;
  gradientWidth?: string | number;
  gradientHeight?: string | number;
  rounded?: string;
  onClick?: () => void;
  processing?: boolean;
};

export type OnCloseType = {
  onClose?: (id?: string) => void;
};

export type BackgroundPortalProps = OnCloseType & {
  children?: ReactNode;
  show?: boolean;
  title?: string;
  className?: string;
};

export type PortalHeaderProps = OnCloseType & {
  title?: string;
};

export type ListFriendProps = OnCloseType & {};

export type FriendItemProps = OnCloseType & {
  friend?: ContactModel; // Define this type based on your data
  setContacts?: Dispatch<SetStateAction<ContactModel[]>>; // Function to update contacts
};

export type FriendCtaButtonProps = OnCloseType & {
  id?: string;
};

export type ChatInputProps = {
  className?: string;
  quickChat?: boolean;
  noMenu?: boolean;
  noEmoji?: boolean;
  inputRef?: MutableRefObject<HTMLInputElement>;
};

export type CustomContentEditableProps = {
  onKeyDown?: KeyboardEventHandler<HTMLElement>;
  onKeyUp?: KeyboardEventHandler<HTMLElement>;
  className?: string;
};

export type OnlineStatusDotProps = {
  online?: boolean;
  className?: string;
};

export type CustomLabelProps = {
  title?: string;
  className?: string;
  tooltip?: string;
};

export type ReactionModel = {
  likeCount: number;
  loveCount: number;
  careCount: number;
  wowCount: number;
  sadCount: number;
  angryCount: number;
  total: number;
  currentReaction: string | null;
};

export type MessageReactionProps_Message = {
  mine: boolean;
  reaction: ReactionModel;
  topReactions: string[];
};

export type MessageReactionProps = {
  message: MessageReactionProps_Message;
  react: (type: string) => void;
  pending: boolean;
};

export type AuthenticationFormType = "signin" | "signup" | "forgot";

export type ChatDetailType = "information" | "attachment" | null;

export type TogglesContextType<T> = {
  toggle: string;
  setToggle: Dispatch<SetStateAction<T>>;
};

export type LoadingContextType = {
  loading: boolean;
  setLoading: Dispatch<SetStateAction<boolean>>;
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

export type HttpRequest<TReq = undefined, TRes = undefined> = {
  method?: "get" | "post" | "put" | "delete" | "patch"; // Restrict to valid HTTP methods
  url: string; // URL should be required
  headers?: Record<string, string>; // Fix typo (should be 'headers', not 'header')
  data?: TReq | undefined; // Optional request body of type TReq
  alert?: boolean; // Optional flag
  // controller?: AbortController; // Optional for request cancellation
  response?: TRes; // Expected response type
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
  notifyMessage: (model: NotifyMessageModel) => void;
  queryClient: QueryClient;
  info: UserProfile;
};

export type BaseModel = {
  id?: string;
  createdTime?: string; // ISO 8601 date string
  updatedTime?: string; // ISO 8601 date string
};

export type UserProfile = BaseModel & {
  name: string;
  avatar: string;
  bio: string;
  isOnline: boolean;
  lastLogout: string; // ISO 8601 date string
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
