import { QueryClient } from "@tanstack/react-query";
import {
  ChangeEventHandler,
  Dispatch,
  KeyboardEventHandler,
  MutableRefObject,
  SetStateAction,
} from "react";
import { NotifyMessageModel } from "./features/notification/services/notifyMessage";

export type CustomInputProps = {
  type?: string;
  label?: string;
  inputRef?: MutableRefObject<HTMLInputElement & { reset: () => void }>;
  className?: string;
  placeholder?: string;
  tabIndex?: number;
  onKeyDown?: KeyboardEventHandler<HTMLInputElement>;
  onChange?: ChangeEventHandler<HTMLInputElement>;
};

export type TogglesContextType = {
  toggle: string;
  setToggle: Dispatch<SetStateAction<AuthenticationFormType>>;
};

export type AuthenticationFormType = "signin" | "signup" | "forgot";

export type HttpRequest<TReq, TRes = undefined> = {
  method?: "get" | "post" | "put" | "delete" | "patch"; // Restrict to valid HTTP methods
  url: string; // URL should be required
  headers?: Record<string, string>; // Fix typo (should be 'headers', not 'header')
  data?: TReq; // Optional request body of type TReq
  alert?: boolean; // Optional flag
  // controller?: AbortController; // Optional for request cancellation
  response?: TRes; // Expected response type
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
  id: string;
  createdTime: string; // ISO 8601 date string
  updatedTime: string; // ISO 8601 date string
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
