import { MutableRefObject } from "react";
import { BaseModel } from "./base.types";
import { ConversationModel_Contact } from "./conv.types";

export type SeenContact = ConversationModel_Contact;

export type MentionModel = {
  name: string;
  avatar: string | null;
  userId: string;
};

// Thẻ danh bạ được chia sẻ (tin nhắn type = contact).
export type SharedContactModel = {
  contactId: string;
  name: string;
  avatar?: string | null;
};

// Bình chọn (tin nhắn type = poll).
export type PollOptionModel = {
  key: string;
  text: string;
  voterIds: string[];
};

export type PollModel = {
  question: string;
  allowMultiple: boolean;
  closedTime?: string | null;
  closedBy?: string | null;
  options: PollOptionModel[];
};

// Thẻ xem trước liên kết (tin text có URL). Sinh async ở BE, về sau qua realtime "LinkPreviewReady".
export type LinkPreviewModel = {
  url: string;
  title?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  siteName?: string | null;
};

export type SendMessageRequest = {
  type: string;
  content: string;
  isForwarded?: boolean;
  attachments?: AttachmentModel[];
  files?: File[];
  // Option B: userId các mention (sentinel "all" cho @All). BE dùng để tạo notification.
  mentions?: string[];
  // Chia sẻ danh bạ: thẻ liên hệ đính kèm khi type = contact.
  sharedContact?: SharedContactModel;
  // Bình chọn: dữ liệu poll khi type = poll.
  poll?: PollModel;
};

export type SendMessageResponse = {
  messageId?: string;
  attachments?: string[];
};

export type ReactMessageRequest = {
  conversationId: string;
  messageId: string;
  type: string;
  isUnReact: boolean;
};

export type MessageContentProps = {
  message: PendingMessageModel;
  id: string;
  // mt: boolean;
  refContainer?: MutableRefObject<HTMLDivElement>;
  getContainerRect?: () => DOMRect;
  showName?: boolean;
  showAvatar?: boolean;
  // True CHỈ khi message này là tin nhắn CUỐI CÙNG của conversation VÀ là của
  // mình (đã confirmed, không pending). Dùng để gate hiển thị message status:
  // theo rule sản phẩm, status (Sent/Delivered/Seen) chỉ được hiện ở tin
  // cuối conversation khi đó là tin của mình.
  isLastFromMe?: boolean;
  // True khi message này là tin CUỐI CÙNG của conversation VÀ là của mình,
  // KỂ CẢ khi còn pending (chưa confirmed). Dùng để RESERVE sẵn chỗ cho slot
  // receipt (icon Sent/Delivered) ngay từ lúc pending → tránh layout shift khi
  // icon xuất hiện sau lúc gửi thành công.
  isLastMine?: boolean;
  // Danh sách contact đã xem tin nhắn này. Theo rule sản phẩm, chỉ được set
  // khi tin này là tin cuối của conversation và là của mình. Pre-compute ở
  // Chatbox (`seenContactsByMessageId`) để tránh scan messages mỗi lần render.
  seenContacts?: SeenContact[];
};

export type MessageMenuProps = {
  conversationId: string;
  id?: string;
  message: PendingMessageModel;
  mine: boolean;
  pinned?: boolean;
  contact: ConversationModel_Contact;
  getContainerRect?: () => DOMRect;
  // Tin chỉ-là-link (hiển thị dạng thẻ preview thay bong bóng text): chỉ cho phép Xoá,
  // ẩn edit/copy/pin/reply/dịch/forward vì không có nội dung text hữu ích để thao tác.
  onlyDelete?: boolean;
};

export type PinMessageRequest = {
  conversationId: string;
  messageId: string;
  pinned: boolean;
};

export type MessageListProps = {
  messages: MessageContentProps[];
  currentUserId: string;
};

export type AttachmentModel = BaseModel & {
  type?: string;
  mediaUrl?: string;
  mediaName?: string;
  mediaSize?: number;
  pending?: boolean;
  local?: boolean;
};

// export type ReactionModel = {
//   contactId: string;
//   type: string;
// };

export type MessageModel = BaseModel & {
  type?: string;
  content?: string | null;
  contactId?: string;
  // Ghim tin đã tách khỏi message: trạng thái ghim inline lấy từ hook usePinMessage
  // (query pinned/ids), không còn nhúng isPinned/pinnedBy trên từng message.
  isForwarded?: boolean;
  replyId?: string;
  replyContent?: string;
  replyContact?: string;
  seenTime?: string | null;
  attachments?: AttachmentModel[];
  likeCount?: number;
  loveCount?: number;
  careCount?: number;
  wowCount?: number;
  sadCount?: number;
  angryCount?: number;
  currentReaction?: string | null;
  // Tính năng 2: edit / recall
  editedTime?: string | null;
  recalledTime?: string | null;
  recalledByContactId?: string | null;
  // Chia sẻ danh bạ: thẻ liên hệ (type = contact).
  sharedContact?: SharedContactModel;
  // Bình chọn (type = poll).
  poll?: PollModel;
  // Preview Link: thẻ xem trước cho tin text có URL (đính kèm async, có thể null lúc đầu).
  // linkPreviews = mọi thẻ (nhiều link → nhiều thẻ); linkPreview (singular) = thẻ đầu (backward-compat).
  linkPreview?: LinkPreviewModel | null;
  linkPreviews?: LinkPreviewModel[] | null;
  // reactions?: ReactionModel[];
};

export type PendingMessageModel = MessageModel & {
  pending?: boolean;
  // Gửi thất bại (API lỗi / mất mạng) → hiển thị trạng thái lỗi thay vì kẹt pending vô hạn.
  failed?: boolean;
};

export type MessageCache = {
  conversationId: string;
  hasMore: boolean;
  messages: PendingMessageModel[];
};

export type AttachmentCache = {
  conversationId: string;
  attachments: AttachmentCache_Attachment[];
};

export type AttachmentCache_Attachment = {
  date: string;
  attachments: AttachmentModel[];
};

export type GroupedMessage ={
  contactId: string;
  messages: PendingMessageModel[];
};

export type MessageSearchResult = BaseModel & {
  type: string;
  content: string;
  contactId: string;
};

// Một mục trong panel "Tin đã ghim" — content server đã build thành chuỗi preview theo loại tin
// (media/sticker/poll...), FE render trực tiếp; nội dung resolve LIVE lúc đọc (edit/recall mới nhất).
export type PinnedMessageItem = {
  id: string; // pinnedMessage id
  messageId: string;
  type: string;
  content: string;
  contactId: string; // người gửi tin (FE resolve tên/avatar từ members)
  pinnedBy?: string | null; // người ghim (tooltip)
  messageCreatedTime?: string | null;
  pinnedTime: string;
  isUnavailable: boolean; // tin gốc đã recall / không còn
};

// Response phân trang panel "Tin đã ghim" (đồng nhất với bookmark: hasMore + list).
export type GetPinnedMessagesResponse = {
  hasMore: boolean;
  items: PinnedMessageItem[];
};

// messageId + người ghim của tin đã ghim trong hội thoại — FE hiển thị badge + tooltip inline.
export type PinnedIdItem = {
  messageId: string;
  pinnedBy?: string | null;
};