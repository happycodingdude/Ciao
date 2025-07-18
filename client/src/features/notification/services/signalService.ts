import { HubConnection } from "@microsoft/signalr";
import { QueryClient } from "@tanstack/react-query";
import moment from "moment";
import { UserProfile } from "../../../types";
import {
  AttachmentCache,
  AttachmentModel,
  ConversationCache,
  ConversationModel,
  ConversationModel_Member,
  MessageCache,
  PendingMessageModel,
} from "../../listchat/types";
import {
  NewConversation,
  NewMessage,
  NewMessagePinned,
  NewReaction,
} from "../types";

/* MARK: SET UP */
export const setupListeners = (
  connection: HubConnection,
  queryClient: QueryClient,
  userInfo: UserProfile,
) => {
  if (!connection) return;

  connection.on("NewMessage", (user: string, data: string) => {
    console.log(data);
    if (user == userInfo.id) return;
    onNewMessage(queryClient, userInfo, JSON.parse(data));
  });

  connection.on("NewMembers", (user: string, data: string) => {
    console.log(data);
    if (user == userInfo.id) return;
    onNewMembers(queryClient, userInfo, JSON.parse(data));
  });

  connection.on("NewConversation", (user: string, data: string) => {
    console.log(data);
    if (user == userInfo.id) return;
    onNewConversation(queryClient, userInfo, JSON.parse(data));
  });

  connection.on("NewFriendRequest", (user: string, data: string) => {
    console.log(user);
    console.log(data);
  });

  connection.on("FriendRequestAccepted", (user: string, data: string) => {
    console.log(user);
    console.log(data);
  });

  connection.on("FriendRequestCanceled", (user: string, data: string) => {
    console.log(user);
    console.log(data);
  });

  connection.on("NewReaction", (user: string, data: string) => {
    console.log(data);
    if (user == userInfo.id) return;
    onNewReaction(queryClient, JSON.parse(data));
  });

  connection.on("NewMessagePinned", (user: string, data: string) => {
    console.log(data);
    if (user == userInfo.id) return;
    onNewMessagePinned(queryClient, JSON.parse(data));
  });
};

/* MARK: ON NEW MESSAGE */
const onNewMessage = (
  queryClient: QueryClient,
  userInfo: UserProfile,
  message: NewMessage,
) => {
  queryClient.setQueryData(["conversation"], (oldData: ConversationCache) => {
    if (
      oldData.conversations.some((conv) => conv.id === message.conversation.id)
    ) {
      return updateConversationCache(oldData, message.conversation, {
        lastMessageId: message.id,
        lastMessage: message.content,
        lastMessageContact: message.contact.id,
        lastMessageTime: message.createdTime,
      });
    } else {
      const newConversation = {
        id: message.conversation.id,
        title: message.conversation.title,
        avatar: message.conversation.avatar,
        isGroup: message.conversation.isGroup,
        isNotifying: true,
        lastMessage: message.content,
        lastMessageContact: message.contact.id,
        lastMessageTime: message.createdTime,
      };

      return {
        ...oldData,
        conversations: [newConversation, ...oldData.conversations],
        filterConversations: [newConversation, ...oldData.conversations],
      };
    }
  });

  queryClient.setQueryData(["message"], (oldData: MessageCache) =>
    oldData?.conversationId === message.conversation.id
      ? updateMessagesCache(oldData, message)
      : oldData,
  );

  if (message.attachments.length > 0) {
    queryClient.setQueryData(["attachment"], (oldData: AttachmentCache) =>
      oldData ? updateAttachmentsCache(oldData, message.attachments) : oldData,
    );
  }
};

/* MARK: ON NEW MEMBERS */
const onNewMembers = (
  queryClient: QueryClient,
  userInfo: UserProfile,
  conversation: NewConversation,
) => {
  queryClient.setQueryData(["conversation"], (oldData: ConversationCache) => {
    if (!oldData) return oldData;

    const existingConversation = oldData.conversations.find(
      (conv) => conv.id === conversation.conversation.id,
    );

    if (existingConversation) {
      return updateConversationCache(oldData, conversation.conversation, {
        membersUpdater: (members) => [
          ...members,
          ...conversation.members.filter((mem) => mem.isNew),
        ],
      });
    }

    return createNewConversation(
      oldData,
      conversation.conversation,
      userInfo,
      conversation.members,
    );
  });
};

/* MARK: ON NEW CONVERSATION */
const onNewConversation = (
  queryClient: QueryClient,
  userInfo: UserProfile,
  conversation: NewConversation,
) => {
  queryClient.setQueryData(["conversation"], (oldData: ConversationCache) => {
    if (!oldData) return oldData;

    const newConversation = {
      id: conversation.conversation.id,
      title: conversation.conversation.title,
      avatar: conversation.conversation.avatar,
      isGroup: conversation.conversation.isGroup,
      isNotifying: true,
      lastMessage: conversation.conversation.lastMessage,
      lastMessageContact: conversation.conversation.lastMessageContact,
      lastMessageTime: conversation.conversation.lastMessageTime,
      // members: conversation.members.map((mem) =>
      //   mem.contact.id !== userInfo.id ? mem : { ...mem, unSeenMessages: 0 },
      // ),
    };

    return {
      ...oldData,
      conversations: [newConversation, ...oldData.conversations],
      filterConversations: [newConversation, ...oldData.conversations],
    };
  });
};

/* MARK: ON NEW REACTION */
const onNewReaction = (queryClient: QueryClient, reaction: NewReaction) => {
  queryClient.setQueryData(["message"], (oldData: MessageCache) => {
    if (!oldData || oldData.conversationId !== reaction.conversationId)
      return oldData;

    return {
      ...oldData,
      messages: oldData.messages.map((message) => {
        if (message.id !== reaction.messageId) return message;

        return {
          ...message,
          likeCount: reaction.likeCount,
          loveCount: reaction.loveCount,
          careCount: reaction.careCount,
          wowCount: reaction.wowCount,
          sadCount: reaction.sadCount,
          angryCount: reaction.angryCount,
        };
      }),
    } as MessageCache;
  });
};

/* MARK: ON NEW MESSAGE PINNED */
const onNewMessagePinned = (
  queryClient: QueryClient,
  messagePinned: NewMessagePinned,
) => {
  queryClient.setQueryData(["message"], (oldData: MessageCache) => {
    if (!oldData || oldData.conversationId !== messagePinned.conversationId)
      return oldData;

    return {
      ...oldData,
      messages: oldData.messages.map((message) => {
        if (message.id !== messagePinned.messageId) return message;

        return {
          ...message,
          isPinned: messagePinned.isPinned,
          pinnedBy: messagePinned.pinnedBy,
        };
      }),
    } as MessageCache;
  });
};

/* MARK: HELPER FUNCTIONS */
const createNewConversation = (
  oldData: ConversationCache,
  conversation: ConversationModel,
  userInfo: UserProfile,
  members: ConversationModel_Member[],
  lastMessage?: string,
  lastMessageContact?: string,
  lastMessageTime?: string,
) => {
  if (!oldData) return oldData;

  const newConversation = {
    id: conversation.id,
    title: conversation.title,
    avatar: conversation.avatar,
    isGroup: conversation.isGroup,
    isNotifying: true,
    lastMessage: lastMessage ?? conversation.lastMessage,
    lastMessageContact: lastMessageContact ?? conversation.lastMessageContact,
    lastMessageTime: lastMessageTime ?? conversation.lastMessageTime,
    // members: members.map((mem) =>
    //   mem.contact.id !== userInfo.id ? mem : { ...mem, unSeenMessages: 0 },
    // ),
  };

  return {
    ...oldData,
    conversations: [newConversation, ...oldData.conversations],
    filterConversations: [newConversation, ...oldData.conversations],
  };
};

const updateConversationCache = (
  oldData: ConversationCache,
  conversation: ConversationModel,
  {
    lastMessageId,
    lastMessage,
    lastMessageContact,
    lastMessageTime,
    membersUpdater,
  }: Partial<{
    lastMessageId: string;
    lastMessage: string;
    lastMessageContact: string;
    lastMessageTime: string;
    membersUpdater: (
      members: ConversationModel_Member[],
    ) => ConversationModel_Member[];
  }>,
) => {
  if (!oldData) return oldData;

  const updatedConversations = oldData.conversations.map((conv) =>
    conv.id === conversation.id
      ? {
          ...conv,
          ...(lastMessageId && { lastMessageId }),
          ...(lastMessage && { lastMessage }),
          ...(lastMessageContact && { lastMessageContact }),
          ...(lastMessageTime && { lastMessageTime }),
          ...(membersUpdater && { members: membersUpdater(conv.members) }),
          ...(oldData.selected && oldData.selected.id === conversation.id
            ? { unSeen: false }
            : { unSeen: true }),
        }
      : conv,
  );

  return {
    ...oldData,
    conversations: updatedConversations,
    filterConversations: updatedConversations,
    selected:
      oldData.selected?.id === conversation.id
        ? updatedConversations.find((conv) => conv.id === conversation.id)
        : oldData.selected,
  };
};

const updateMessagesCache = (oldData: MessageCache, message: NewMessage) => {
  return {
    ...oldData,
    messages: [
      ...oldData.messages,
      {
        ...message,
        contactId: message.contact.id,
        currentReaction: null,
        likeCount: 0,
        loveCount: 0,
        careCount: 0,
        wowCount: 0,
        sadCount: 0,
        angryCount: 0,
      } as PendingMessageModel,
    ],
  };
};

const updateAttachmentsCache = (
  oldData: AttachmentCache,
  attachments: AttachmentModel[],
) => {
  const today = moment().format("MM/DD/YYYY");
  return {
    ...oldData,
    attachments: oldData.attachments.map((item) =>
      item.date === today
        ? { ...item, attachments: [...attachments, ...item.attachments] }
        : item,
    ),
  };
};
