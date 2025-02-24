import * as signalR from "@microsoft/signalr";
import { QueryClient } from "@tanstack/react-query";
import moment from "moment";
import { UserProfile } from "../../../types";
import {
  AttachmentCache,
  ConversationCache,
  MessageCache,
} from "../../listchat/types";

let hubConnection: signalR.HubConnection | null = null;
let queryClient: QueryClient | null = null;
let info: UserProfile | null = null;

export const startConnection = async (
  id: string,
  outerQueryClient: QueryClient,
  outerInfo: UserProfile,
) => {
  if (!id) {
    console.error("User ID is required to establish a connection.");
    return;
  }

  hubConnection = new signalR.HubConnectionBuilder()
    .withUrl(`http://localhost:4000/ciaohub?userId=${id}`)
    .withAutomaticReconnect()
    .configureLogging(signalR.LogLevel.Information)
    .build();

  try {
    await hubConnection.start();
    console.log(`SignalR Connected for user: ${id}`);

    const connectionId = await hubConnection.invoke<string>("GetConnectionId");
    console.log(`Connection ID: ${connectionId}`);

    queryClient = outerQueryClient;
    info = outerInfo;

    hubConnection.onclose(() => {
      console.warn("🔴 Connection closed. Reconnecting...");
    });

    hubConnection.onreconnecting(() => {
      console.warn("🟡 Reconnecting...");
    });

    hubConnection.onreconnected((connectionId) => {
      console.log("🟢 Reconnected! New Connection ID:", connectionId);
    });

    hubConnection.on("NewMessage", (user: string, data: string) => {
      console.log(user);
      console.log(data);
      if (user == info.id) return;
      onMessageReceived(JSON.parse(data));
    });

    hubConnection.on("NewConversation", (user: string, data: string) => {
      console.log(user);
      console.log(data);
      if (user == info.id) return;
    });
  } catch (error) {
    console.error("SignalR Connection Error: ", error);
  }
};

const onMessageReceived = (message: NewMessage_Message) => {
  // const message: NewMessage_Message = JSON.parse(data);
  queryClient.setQueryData(["conversation"], (oldData: ConversationCache) => {
    // If exists conversation -> update state and return
    if (
      oldData.conversations.some(
        (conversation) => conversation.id === message.conversation.id,
      )
    ) {
      const updatedConversations = oldData.conversations.map((conversation) => {
        if (conversation.id !== message.conversation.id) return conversation;
        return {
          ...conversation,
          lastMessage: message.content,
          lastMessageContact: message.contact.id,
          members: conversation.members.map((mem) => {
            if (mem.contact.id !== info.id) return mem;
            return { ...mem, unSeenMessages: mem.unSeenMessages + 1 };
          }),
        };
      });
      return {
        ...oldData,
        conversations: updatedConversations,
        filterConversations: updatedConversations,
      };
    }

    // Else generate new conversation and update state
    const newConversation = [
      {
        isGroup: message.conversation.isGroup,
        title: message.conversation.title,
        avatar: message.conversation.avatar,
        isNotifying: true,
        id: message.conversation.id,
        lastMessage: message.content,
        lastMessageContact: message.contact.id,
        members: message.conversation.members.map((mem) => {
          if (mem.contact.id !== info.id) return mem;
          return { ...mem, unSeenMessages: 1 };
        }),
      },
      ...oldData.conversations,
    ];
    return {
      ...oldData,
      conversations: newConversation,
      filterConversations: newConversation,
    } as ConversationCache;
  });
  queryClient.setQueryData(["message"], (oldData: MessageCache) => {
    if (!oldData) return; // Case haven't click any conversation
    if (oldData.conversationId !== message.conversation.id) return oldData; // Receive message of another conversation
    return {
      ...oldData,
      messages: [
        ...oldData.messages,
        {
          ...message,
          contactId: message.contact.id,
          currentReaction: null,
        },
      ],
    } as MessageCache;
  });
  const today: string = moment().format("MM/DD/YYYY");
  if (message.attachments.length !== 0) {
    queryClient.setQueryData(["attachment"], (oldData: AttachmentCache) => {
      if (!oldData) return; // Case haven't click any conversation
      return {
        ...oldData,
        attachments: oldData.attachments.map((item) =>
          item.date === today
            ? {
                ...item,
                attachments: [...message.attachments, ...item.attachments],
              }
            : item,
        ),
      } as AttachmentCache;
    });
  }
};
