import * as signalR from "@microsoft/signalr";
import { QueryClient } from "@tanstack/react-query";
import moment from "moment";
import { UserProfile } from "../../../types";
import {
  AttachmentCache,
  ConversationCache,
  ConversationModel,
  MessageCache,
} from "../../listchat/types";
import { NewConversation, NewMessage } from "../types";

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
    .withUrl(`${import.meta.env.VITE_ASPNETCORE_CHAT_URL}/ciaohub?userId=${id}`)
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
      onNewMessage(JSON.parse(data));
    });

    hubConnection.on("NewConversation", (user: string, data: string) => {
      console.log(user);
      console.log(data);
      if (user == info.id) return;
      onNewConversation(JSON.parse(data));
    });

    hubConnection.on("NewMember", (user: string, data: string) => {
      console.log(user);
      console.log(data);
      if (user == info.id) return;
      onNewMembers(JSON.parse(data));
    });
  } catch (error) {
    console.error("SignalR Connection Error: ", error);
  }
};

const onNewMessage = (message: NewMessage) => {
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
          lastMessageTime: message.createdTime,
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
    const newConversation: ConversationModel[] = [
      {
        id: message.conversation.id,
        title: message.conversation.title,
        avatar: message.conversation.avatar,
        isGroup: message.conversation.isGroup,
        isNotifying: true,
        lastMessage: message.content,
        lastMessageContact: message.contact.id,
        lastMessageTime: message.createdTime,
        members: message.members.map((mem) => {
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

const onNewConversation = (conversation: NewConversation) => {
  // console.log(conversation);
  queryClient.setQueryData(["conversation"], (oldData: ConversationCache) => {
    const newConversation: ConversationModel[] = [
      {
        id: conversation.conversation.id,
        title: conversation.conversation.title,
        avatar: conversation.conversation.avatar,
        isGroup: conversation.conversation.isGroup,
        isNotifying: true,
        lastMessage: conversation.conversation.lastMessage,
        lastMessageContact: conversation.conversation.lastMessageContact,
        lastMessageTime: conversation.conversation.lastMessageTime,
        members: conversation.members.map((mem) => {
          if (mem.contact.id !== info.id) return mem;
          return { ...mem, unSeenMessages: 0 };
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
};

const onNewMembers = (conversation: NewConversation) => {
  queryClient.setQueryData(["conversation"], (oldData: ConversationCache) => {
    const existedConversation = oldData.conversations.some(
      (conv) => conv.id === conversation.conversation.id,
    );
    if (existedConversation) {
      const updatedConversation: ConversationModel[] =
        oldData.conversations.map((conv) => {
          if (conv.id !== conversation.conversation.id) return conv;
          return {
            ...conv,
            members: [...conv.members, ...conversation.members],
          };
        });
      return {
        ...oldData,
        conversations: updatedConversation,
        filterConversations: updatedConversation,
      } as ConversationCache;
    } else {
      const newConversation: ConversationModel[] = [
        {
          id: conversation.conversation.id,
          title: conversation.conversation.title,
          avatar: conversation.conversation.avatar,
          isGroup: conversation.conversation.isGroup,
          isNotifying: true,
          lastMessage: conversation.conversation.lastMessage,
          lastMessageContact: conversation.conversation.lastMessageContact,
          lastMessageTime: conversation.conversation.lastMessageTime,
          members: conversation.members.map((mem) => {
            if (mem.contact.id !== info.id) return mem;
            return { ...mem, unSeenMessages: 0 };
          }),
        },
        ...oldData.conversations,
      ];
      return {
        ...oldData,
        conversations: newConversation,
        filterConversations: newConversation,
      } as ConversationCache;
    }
  });
};
