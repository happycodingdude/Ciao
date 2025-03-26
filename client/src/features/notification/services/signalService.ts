import * as signalR from "@microsoft/signalr";
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
} from "../../listchat/types";
import { NewConversation, NewMessage, NewReaction } from "../types";

let hubConnection: signalR.HubConnection | null = null;

const servers = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

export const startConnection = async (
  userId: string,
  queryClient: QueryClient,
  userInfo: UserProfile,
  pc: RTCPeerConnection,
) => {
  if (!userId) {
    console.error("User ID is required to establish a connection.");
    return;
  }

  hubConnection = new signalR.HubConnectionBuilder()
    .withUrl(
      `${import.meta.env.VITE_ASPNETCORE_CHAT_URL}/ciaohub?userId=${userId}`,
    )
    .withAutomaticReconnect()
    .configureLogging(signalR.LogLevel.Information)
    .build();

  // hubConnection.onclose(async () => {
  //   console.warn("SignalR connection lost. Reconnecting...");
  //   await startConnection(userId,queryClient, userInfo );
  // });

  try {
    await hubConnection.start();
    console.log(`Connected to SignalR as ${userId}`);
    setupListeners(queryClient, userInfo);
    setupVideoCall(pc);
  } catch (error) {
    console.error("Error establishing SignalR connection:", error);
  }
};

const setupListeners = (queryClient: QueryClient, userInfo: UserProfile) => {
  if (!hubConnection) return;

  hubConnection.on("NewMessage", (user: string, data: string) => {
    console.log(data);
    if (user == userInfo.id) return;
    onNewMessage(queryClient, userInfo, JSON.parse(data));
  });

  hubConnection.on("NewMembers", (user: string, data: string) => {
    console.log(data);
    if (user == userInfo.id) return;
    onNewMembers(queryClient, userInfo, JSON.parse(data));
  });

  hubConnection.on("NewConversation", (user: string, data: string) => {
    console.log(data);
    if (user == userInfo.id) return;
    onNewConversation(queryClient, userInfo, JSON.parse(data));
  });

  hubConnection.on("NewFriendRequest", (user: string, data: string) => {
    console.log(user);
    console.log(data);
  });

  hubConnection.on("FriendRequestAccepted", (user: string, data: string) => {
    console.log(user);
    console.log(data);
  });

  hubConnection.on("FriendRequestCanceled", (user: string, data: string) => {
    console.log(user);
    console.log(data);
  });

  hubConnection.on("NewReaction", (user: string, data: string) => {
    console.log(user);
    console.log(data);
    if (user == userInfo.id) return;
    onNewReaction(queryClient, JSON.parse(data));
  });
};

const setupVideoCall = (pc: RTCPeerConnection) => {
  pc = new RTCPeerConnection(servers);
  hubConnection.on("ReceiveOffer", async (callerId: string, offer: string) => {
    console.log("🔔 Received offer");
    // remoteUserIdRef.current = callerId;
    await setupPeerConnection(pc, callerId, true);

    const rtcOffer = new RTCSessionDescription(JSON.parse(offer));
    await pc.setRemoteDescription(rtcOffer);

    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer!);
    hubConnection.send("SendAnswer", callerId, JSON.stringify(answer));
  });

  hubConnection.on("ReceiveAnswer", async (answer: string) => {
    console.log("📩 Received answer");
    const rtcAnswer = new RTCSessionDescription(JSON.parse(answer));
    await pc.setRemoteDescription(rtcAnswer);
  });

  hubConnection.on("ReceiveIceCandidate", async (candidate: string) => {
    console.log("❄️ Received ICE candidate");
    const rtcCandidate = new RTCIceCandidate(JSON.parse(candidate));
    await pc.addIceCandidate(rtcCandidate);
  });

  hubConnection.on("CallEnded", () => {
    console.log("📞 Call ended");
    // stopCall();
  });
};

const setupPeerConnection = async (
  pc: RTCPeerConnection,
  peerId: string,
  isReceiver = false,
) => {
  // pcRef.current = new RTCPeerConnection(servers);

  if (isReceiver)
    pc.onicecandidate = (e) => {
      if (e.candidate) {
        hubConnection.send(
          "SendIceCandidate",
          peerId,
          JSON.stringify(e.candidate),
        );
      }
    };

  pc.ontrack = (e) => {
    // if (remoteVideoRef.current) {
    console.log("📡 ontrack fired");
    // remoteVideoRef.current.srcObject = e.streams[0];
    // }
  };

  // localStreamRef.current?.getTracks().forEach((track) => {
  //   pcRef.current?.addTrack(track, localStreamRef.current!);
  // });
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
        lastMessage: message.content,
        lastMessageContact: message.contact.id,
        lastMessageTime: message.createdTime,
        membersUpdater: (members) =>
          members.map((mem) =>
            mem.contact.id === userInfo.id &&
            oldData.selected?.id !== message.conversation.id
              ? { ...mem, unSeenMessages: mem.unSeenMessages + 1 }
              : mem,
          ),
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
        members: message.members.map((mem) =>
          mem.contact.id === userInfo.id ? { ...mem, unSeenMessages: 0 } : mem,
        ),
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
      members: conversation.members.map((mem) =>
        mem.contact.id !== userInfo.id ? mem : { ...mem, unSeenMessages: 0 },
      ),
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
    members: members.map((mem) =>
      mem.contact.id !== userInfo.id ? mem : { ...mem, unSeenMessages: 0 },
    ),
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
    lastMessage,
    lastMessageContact,
    lastMessageTime,
    membersUpdater,
  }: Partial<{
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
          ...(lastMessage && { lastMessage }),
          ...(lastMessageContact && { lastMessageContact }),
          ...(lastMessageTime && { lastMessageTime }),
          ...(membersUpdater && { members: membersUpdater(conv.members) }),
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
    // selected:
    //   oldData.selected?.id === conversation.id
    //     ? {
    //         ...oldData.selected,
    //         members: membersUpdater
    //           ? membersUpdater(oldData.selected.members)
    //           : oldData.selected.members,
    //       }
    //     : oldData.selected,
  };
};

const updateMessagesCache = (oldData: MessageCache, message: NewMessage) => {
  return {
    ...oldData,
    messages: [
      ...oldData.messages,
      { ...message, contactId: message.contact.id, currentReaction: null },
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
