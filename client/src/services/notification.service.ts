import { QueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { isConversationActive } from "../hooks/useActiveConversation";
import HttpRequest from "../lib/fetch";
import {
  NotificationData,
  RequestPermission,
  UserProfile,
} from "../types/base.types";
import {
  ConversationCache,
  ConversationModel,
  ConversationModel_Member,
} from "../types/conv.types";
import {
  AttachmentCache,
  AttachmentModel,
  MessageCache,
  PendingMessageModel,
} from "../types/message.types";
import { NewConversation, NewMessage } from "../types/notification.types";
import getFirebaseApp from "../utils/firebaseConfig";

const page = 1;
const limit = 10;

export const getNotifications = async () => {
  return (
    await HttpRequest({
      method: "get",
      url: import.meta.env.VITE_ENDPOINT_NOTIFICATION_GET.replace(
        "{page}",
        page,
      ).replace("{limit}", limit),
    })
  ).data;
};

export const read = async (id: string) => {
  return (
    await HttpRequest({
      method: "put",
      url: import.meta.env.VITE_ENDPOINT_NOTIFICATION_GETBYID.replace(
        "{id}",
        id,
      ),
    })
  ).data;
};

export const readAll = async () => {
  return (
    await HttpRequest({
      method: "put",
      url: import.meta.env.VITE_ENDPOINT_NOTIFICATION_GET,
    })
  ).data;
};

export const registerConnection = async (token: string) => {
  return (
    await HttpRequest({
      method: "get",
      url: import.meta.env.VITE_ENDPOINT_NOTIFICATION_REGISTER.replace(
        "{token}",
        token,
      ),
    })
  ).data;
};

// ✅ Use centralized Firebase app
const app = getFirebaseApp();
const messaging = getMessaging(app);

export const requestPermission = ({
  registerConnection,
  onNotification,
}: RequestPermission) => {
  Notification.requestPermission().then((permission) => {
    if (permission == "granted") {
      return getToken(messaging, {
        vapidKey:
          "BM0h2oAh38_Q1ra_BvhpventqyMPRuUJ8Fwseh0IaVuXPfepULakLtaUZHdnVk5sMVCSF4nrvfGNPg0yitS4HBM",
      })
        .then((token) => {
          // console.log(token);
          if (token) {
            // Receive message
            onMessage(messaging, (payload) => {
              // console.log("Message received. ", payload.data);

              // Call the notification handler if provided
              if (onNotification && payload.data) {
                const notification = {
                  event: payload.data.event,
                  data: JSON.parse(payload.data.data ?? "{}"),
                } as NotificationData;
                onNotification(notification);
              }
            });

            registerConnection(token);
          } else console.log("Token failed");
        })
        .catch((err) => {
          console.log("Error: ", err);
        });
    }
  });
};

export const registerSW = () => {
  const sw = navigator.serviceWorker;
  if (sw) {
    return sw
      .register("/firebase-messaging-sw.js", {
        scope: "firebase-cloud-messaging-push-scope", // mandatory value
      })
      .then(() => sw.ready);
  }
};

/* MARK: NOTIFICATION CLASSIFIER */
export const classifyNotification = (
  notificationData: any,
  queryClient: QueryClient,
  userInfo: UserProfile,
) => {
  const { event, data } = notificationData;

  // Skip if notification is from current user
  // if (userId === userInfo.id) return;

  console.log(`Processing notification: ${event}`, data);

  switch (event) {
    case "NewMessage":
      onNewMessage(queryClient, data);
      break;
    case "NewMembers":
      onNewMembers(queryClient, userInfo, data);
      break;
    case "NewConversation":
      onNewConversation(queryClient, userInfo, data);
      break;
    case "NewFriendRequest":
      console.log("NewFriendRequest:", data);
      // TODO: Implement friend request handling
      break;
    case "FriendRequestAccepted":
      console.log("FriendRequestAccepted:", data);
      // TODO: Implement friend request accepted handling
      break;
    case "FriendRequestCanceled":
      console.log("FriendRequestCanceled:", data);
      // TODO: Implement friend request canceled handling
      break;
    case "NewReaction":
      onNewReaction(queryClient, data);
      break;
    case "NewMessagePinned":
      onNewMessagePinned(queryClient, data);
      break;
    default:
      console.warn(`Unknown notification event: ${event}`);
  }
};

/* MARK: SET UP */
// export const setupListeners = (
//   connection: HubConnection,
//   queryClient: QueryClient,
//   userInfo: UserProfile,
// ) => {
//   if (!connection) return;

//   connection.on("NewMessage", (user: string, data: string) => {
//     console.log(data);
//     console.log("user: " + user);
//     if (user == userInfo.id) return;
//     onNewMessage(queryClient, userInfo, JSON.parse(data));
//   });

//   connection.on("NewMembers", (user: string, data: string) => {
//     console.log(data);
//     if (user == userInfo.id) return;
//     onNewMembers(queryClient, userInfo, JSON.parse(data));
//   });

//   connection.on("NewConversation", (user: string, data: string) => {
//     console.log(data);
//     if (user == userInfo.id) return;
//     onNewConversation(queryClient, userInfo, JSON.parse(data));
//   });

//   connection.on("NewFriendRequest", (user: string, data: string) => {
//     console.log(user);
//     console.log(data);
//   });

//   connection.on("FriendRequestAccepted", (user: string, data: string) => {
//     console.log(user);
//     console.log(data);
//   });

//   connection.on("FriendRequestCanceled", (user: string, data: string) => {
//     console.log(user);
//     console.log(data);
//   });

//   connection.on("NewReaction", (user: string, data: string) => {
//     console.log(data);
//     if (user == userInfo.id) return;
//     onNewReaction(queryClient, JSON.parse(data));
//   });

//   connection.on("NewMessagePinned", (user: string, data: string) => {
//     console.log(data);
//     if (user == userInfo.id) return;
//     onNewMessagePinned(queryClient, JSON.parse(data));
//   });
// };

/* MARK: ON NEW MESSAGE */
const onNewMessage = (queryClient: QueryClient, message: NewMessage) => {
  const conversationId = message.conversation.id;
  const isActive = isConversationActive(conversationId);

  /* -----------------------------
   * 1. UPDATE CONVERSATION LIST
   * ----------------------------- */
  queryClient.setQueryData(["conversation"], (oldData: ConversationCache) => {
    if (!oldData) return oldData;

    const existingConversation = oldData.conversations.some(
      (conv) => conv.id === message.conversation.id,
    );
    if (existingConversation) {
      return updateConversationCache(oldData, message.conversation, {
        lastMessageId: message.id,
        lastMessage: message.content,
        lastMessageContact: message.contact.id,
        lastMessageTime: message.createdTime,
        unSeen: !isActive,
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

  /* -----------------------------
   * 2. MESSAGE CACHE (ACTIVE ONLY)
   * ----------------------------- */
  if (isActive) {
    queryClient.setQueryData(
      ["message", conversationId],
      (oldData: MessageCache) =>
        oldData ? updateMessagesCache(oldData, message) : oldData,
    );
  }

  /* -----------------------------
   * 3. INVALIDATE FOR SYNC
   * ----------------------------- */
  queryClient.invalidateQueries({
    queryKey: ["message", conversationId],
    refetchType: "inactive",
  });

  /* -----------------------------
   * 4. ATTACHMENT (ACTIVE ONLY)
   * ----------------------------- */
  if (isActive && message.attachments.length > 0) {
    queryClient.setQueryData(
      ["attachment", conversationId],
      (oldData: AttachmentCache) =>
        oldData
          ? updateAttachmentsCache(oldData, message.attachments)
          : oldData,
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

    const newConversation: ConversationModel = {
      id: conversation.conversation.id,
      title: conversation.conversation.title,
      avatar: conversation.conversation.avatar,
      isGroup: conversation.conversation.isGroup,
      isNotifying: true,
      lastMessage: conversation.conversation.lastMessage,
      lastMessageContact: conversation.conversation.lastMessageContact,
      lastMessageTime: conversation.conversation.lastMessageTime,
      unSeen: true,
      members: conversation.members,

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
  queryClient.setQueryData(
    ["message", reaction.conversationId],
    (oldData: MessageCache) => {
      if (!oldData) return oldData;

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
    },
  );
};

/* MARK: ON NEW MESSAGE PINNED */
const onNewMessagePinned = (
  queryClient: QueryClient,
  messagePinned: NewMessagePinned,
) => {
  queryClient.setQueryData(
    ["message", messagePinned.conversationId],
    (oldData: MessageCache) => {
      if (!oldData) return oldData;

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
    },
  );
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
    unSeen,
    membersUpdater,
  }: Partial<{
    lastMessageId: string;
    lastMessage: string;
    lastMessageContact: string;
    lastMessageTime: string;
    unSeen: boolean;
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
          ...(unSeen && { unSeen }),
          ...(membersUpdater && { members: membersUpdater(conv.members) }),
        }
      : conv,
  );

  return {
    ...oldData,
    conversations: updatedConversations,
    filterConversations: updatedConversations,
  };
};

const updateMessagesCache = (oldData: MessageCache, message: NewMessage) => {
  if (oldData.messages.some((m) => m.id === message.id)) {
    return oldData;
  }
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
        isForwarded: message.isForwarded,
      } as PendingMessageModel,
    ],
  };
};

const updateAttachmentsCache = (
  oldData: AttachmentCache,
  attachments: AttachmentModel[],
) => {
  const today = dayjs().format("MM/DD/YYYY");
  return {
    ...oldData,
    attachments: oldData.attachments.map((item) =>
      item.date === today
        ? { ...item, attachments: [...attachments, ...item.attachments] }
        : item,
    ),
  };
};
