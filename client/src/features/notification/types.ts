type NewMessage_Message_Contact = {
  id: string;
  name: string | null;
  avatar: string | null;
  bio?: string | null;
  isOnline?: boolean;
};

type NewMessage_Message_Conversation_Member = {
  friendId: string | null;
  friendStatus: string | null;
  isDeleted: boolean;
  isModerator: boolean;
  isNotifying: boolean;
  contact: NewMessage_Message_Contact;
  id: string;
  createdTime: string;
  updatedTime: string | null;
  lastSeenTime?: string | null;
  unSeenMessages?: number;
};

type NewMessage_Message_Conversation = {
  id: string;
  title: string;
  avatar: string | null;
  isGroup: boolean;
  lastMessage: string | null;
  lastMessageContact: string | null;
  members: NewMessage_Message_Conversation_Member[];
};

type NewMessage_Message = {
  id: string;
  type: string;
  content: string;
  conversation: NewMessage_Message_Conversation;
  contact: NewMessage_Message_Contact;
  attachments: any[];
};
