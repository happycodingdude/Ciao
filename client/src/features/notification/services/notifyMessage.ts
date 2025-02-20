import { QueryClient } from "@tanstack/react-query";
import moment from "moment";
import { UserProfile } from "../../../types";
import {
  AttachmentCache,
  ConversationCache,
  MessageCache,
} from "../../listchat/types";

export type NotifyMessage = {
  data: string;
  event: string;
};

export type NotifyMessageModel = {
  message: NotifyMessage;
  queryClient: QueryClient;
  info: UserProfile;
};

const notifyMessage = (model: NotifyMessageModel) => {
  switch (model.message.event) {
    case "NewMessage":
      const message: NewMessage_Message = JSON.parse(model.message.data);
      model.queryClient.setQueryData(
        ["conversation"],
        (oldData: ConversationCache) => {
          // If exists conversation -> update state and return
          if (
            oldData.conversations.some(
              (conversation) => conversation.id === message.conversation.id,
            )
          ) {
            const updatedConversations = oldData.conversations.map(
              (conversation) => {
                if (conversation.id !== message.conversation.id)
                  return conversation;
                return {
                  ...conversation,
                  lastMessage: message.content,
                  lastMessageContact: message.contact.id,
                  members: conversation.members.map((mem) => {
                    if (mem.contact.id !== model.info.id) return mem;
                    return { ...mem, unSeenMessages: mem.unSeenMessages + 1 };
                  }),
                };
              },
            );
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
                if (mem.contact.id !== model.info.id) return mem;
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
        },
      );
      model.queryClient.setQueryData(["message"], (oldData: MessageCache) => {
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
        model.queryClient.setQueryData(
          ["attachment"],
          (oldData: AttachmentCache[]) => {
            return oldData.map((item) =>
              item.date === today
                ? {
                    ...item,
                    attachments: [...message.attachments, ...item.attachments],
                  }
                : item,
            ) as AttachmentCache[];
          },
        );
      }
      break;
    case "NewConversation":
      const conversation: NewMessage_Message_Conversation = JSON.parse(
        model.message.data,
      );
      model.queryClient.setQueryData(
        ["conversation"],
        (oldData: ConversationCache) => {
          const newConversation = [
            {
              isGroup: conversation.isGroup,
              isNotifying: true,
              id: conversation.id,
              title: conversation.title,
              avatar: conversation.avatar,
              lastMessage: conversation.lastMessage,
              lastMessageContact: conversation.lastMessageContact,
              members: conversation.members.map((mem) => {
                if (mem.contact.id !== model.info.id) return mem;
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
        },
      );
      break;
    // case "AddMember":
    //   const listChat = Array.from(document.querySelectorAll(".chat-item"));
    //   const oldChat = listChat.find(
    //     (item) => item.dataset.key === messageData.Id,
    //   );
    //   // Old chat and is focused
    //   if (oldChat && oldChat.classList.contains("item-active"))
    //     reFetchmembers(messageData.Id);
    //   else reFetchConversations();
    //   break;
    // case "NewFriendRequest":
    //   reFetchRequestById(messageData.RequestId);
    //   break;
    // case "AcceptFriendRequest":
    //   reFetchRequestById(messageData.RequestId);
    //   reFetchFriends();
    //   break;
    // case "CancelFriendRequest":
    //   reFetchRequest(messageData.ContactId);
    //   break;
    // case "NewNotification":
    //   reFetchNotifications();
    //   break;
    default:
      break;
  }
};
export default notifyMessage;
