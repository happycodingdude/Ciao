import { ConversationModel_Member } from "../listchat/types";

type NewMessage_Contact = {
  id: string;
  name: string | null;
  avatar: string | null;
  bio?: string | null;
  isOnline?: boolean;
};

// type NewMessage_Message_Conversation_Member = {
//   friendId: string | null;
//   friendStatus: string | null;
//   isDeleted: boolean;
//   isModerator: boolean;
//   isNotifying: boolean;
//   contact: NewMessage_Contact;
//   id: string;
//   createdTime: string;
//   updatedTime: string | null;
//   lastSeenTime?: string | null;
//   unSeenMessages?: number;
// };

type NewMessage_Conversation = {
  id: string;
  title: string;
  avatar: string | null;
  isGroup: boolean;
  lastMessage: string | null;
  lastMessageContact: string | null;
  lastMessageTime: string | null;
  // members: NewMessage_Message_Conversation_Member[];
};

export type NewMessage = {
  id: string;
  type: string;
  content: string;
  createdTime: string;
  conversation: NewMessage_Conversation;
  members: ConversationModel_Member[];
  contact: NewMessage_Contact;
  attachments: any[];
};

export type NewConversation = {
  conversation: NewMessage_Conversation;
  members: ConversationModel_Member[];
};

export type NewReaction = {
  conversationId: string;
  messageId: string;
  likeCount: number;
  loveCount: number;
  careCount: number;
  wowCount: number;
  sadCount: number;
  angryCount: number;
  userId: string;
};

export type NewMessagePinned = {
  conversationId: string;
  messageId: string;
  isPinned: boolean;
  pinnedBy: string;
};
