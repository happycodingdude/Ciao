import {
  ChangeEventHandler,
  Dispatch,
  HTMLAttributes,
  KeyboardEventHandler,
  MutableRefObject,
  ReactNode,
  SetStateAction,
} from "react";
import { ContactModel } from "./friend.types";

export type CustomInputProps = {
  type?: string;
  label?: string;
  inputRef?: MutableRefObject<(HTMLInputElement & { reset?: () => void }) | undefined>;
  className?: string;
  placeholder?: string;
  tabIndex?: number;
  onKeyDown?: KeyboardEventHandler<HTMLInputElement>;
  onChange?: ChangeEventHandler<HTMLInputElement>;
};

export type SideBarProps = {
  page?: string;
  setPage?: Dispatch<SetStateAction<string>>;
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
  slides?: { src: string }[];
  index?: number;
  circle?: boolean;
  pending?: boolean;
  onClick?: () => void;
  local?: boolean;
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
  gradientWidth?: string | number;
  gradientHeight?: string | number;
  rounded?: string;
  onClick?: () => void;
  processing?: boolean;
  width?: string | number;
  height?: string | number;
  top?: string | number;
  sm?: boolean;
};

export type OnCloseType = {
  onClose?: (id?: string) => void;
};

export type BackgroundPortalProps = OnCloseType & {
  children?: ReactNode;
  show?: boolean;
  title?: string;
  className?: string;
  noHeader?: boolean;
};

export type PortalHeaderProps = OnCloseType & {
  title?: string;
};

export type ListFriendProps = OnCloseType & {};

export type FriendItemProps = OnCloseType & {
  friend?: ContactModel;
  friendAction?: (
    id?: string | null,
    status?: "friend" | "request_sent" | "request_received" | "new" | null,
    userId?: string | null,
  ) => void;
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
  isEmpty?: boolean;
  quickChat?: boolean;
};

export type OnlineStatusDotProps = {
  online?: boolean;
  className?: string;
};

export type CustomLabelProps = {
  title?: string;
  className?: string;
  tooltip?: boolean;
};

export type ReactionModel = {
  contactId: string;
  type: string;
};

export type MessageReactionProps_Message_Reaction = {
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
  reaction: MessageReactionProps_Message_Reaction;
  topReactions: string[];
};

export type MessageReactionProps = {
  message: MessageReactionProps_Message;
  react: (type: string) => void;
  pending: boolean;
};
