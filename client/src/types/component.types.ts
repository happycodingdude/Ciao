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
  // Biến thể gọn hơn sm (thấp hơn) dùng cho ngữ cảnh dày đặc như thẻ QuickChat.
  compact?: boolean;
};

export type OnCloseType = {
  onClose?: (id?: string) => void;
};

export type BackgroundPortalProps = OnCloseType & {
  children?: ReactNode;
  show?: boolean;
  title?: string;
  // Mô tả ngắn 1 dòng hiển thị dưới tiêu đề ở phần đầu hộp thoại.
  description?: string;
  // Biểu tượng đại diện cho chức năng, hiển thị bên trái tiêu đề.
  icon?: ReactNode;
  className?: string;
  noHeader?: boolean;
};

export type PortalHeaderProps = OnCloseType & {
  title?: string;
  description?: string;
  icon?: ReactNode;
};

export type ListFriendProps = OnCloseType & {};

export type FriendItemProps = OnCloseType & {
  friend?: ContactModel;
  friendAction?: (
    id?: string | null,
    status?: "friend" | "request_sent" | "request_received" | "new" | null,
    userId?: string | null,
  ) => void;
  // Nhãn tùy biến cho nút thêm bạn (vd QuickChat: "Add friend"). Mặc định "Add".
  addLabel?: string;
  // Thu nhỏ nút quan hệ bạn bè cho ngữ cảnh gọn (QuickChat). Mặc định false.
  compact?: boolean;
};

export type FriendCtaButtonProps = OnCloseType & {
  id?: string;
  // Cho phép override nhãn/độ rộng nút Add ở từng ngữ cảnh (giữ default cho chỗ cũ).
  title?: string;
  width?: number;
  // Biến thể gọn (thấp + chữ nhỏ) cho thẻ QuickChat. Mặc định false.
  compact?: boolean;
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
  // Placeholder tùy biến (vd QuickChat: "Message @Tên…"). Mặc định giữ nguyên text cũ.
  placeholder?: string;
  // Callback khi user paste image vào editor. Optional vì không phải nơi nào dùng
  // CustomContentEditable cũng cần upload (vd. QuickChat chỉ gửi text).
  onPasteFiles?: (files: File[]) => void;
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
