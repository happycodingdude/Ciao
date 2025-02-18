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
  const messageData =
    model.message.data === undefined
      ? undefined
      : JSON.parse(model.message.data);
  console.log(model.message);

  switch (model.message.event) {
    case "NewMessage":
      model.queryClient.setQueryData(
        ["conversation"],
        (oldData: ConversationCache) => {
          // If exists conversation -> update state and return
          if (
            oldData.conversations.some(
              (conversation) => conversation.id === messageData.conversation.id,
            )
          ) {
            const updatedConversations = oldData.conversations.map(
              (conversation) => {
                if (conversation.id !== messageData.conversation.id)
                  return conversation;
                return {
                  ...conversation,
                  lastMessage: messageData.content,
                  lastMessageContact: messageData.contact.id,
                  unSeenMessages: conversation.unSeenMessages + 1,
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
              isGroup: messageData.conversation.isGroup,
              title: messageData.conversation.title,
              avatar: messageData.conversation.avatar,
              isNotifying: true,
              id: messageData.conversation.id,
              lastMessage: messageData.content,
              lastMessageContact: messageData.contact.id,
              unSeenMessages: 1,
              members: messageData.conversation.members,
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
        // if (oldData.id !== messageData.conversation.id) return oldData;
        return {
          ...oldData,
          messages: [
            ...oldData.messages,
            {
              ...messageData,
              contactId: messageData.contact.id,
              currentReaction: null,
            },
          ],
        } as MessageCache;
      });
      const today: string = moment().format("MM/DD/YYYY");
      if (messageData.attachments.length !== 0) {
        model.queryClient.setQueryData(
          ["attachment"],
          (oldData: AttachmentCache[]) => {
            return oldData.map((item) =>
              item.date === today
                ? {
                    ...item,
                    attachments: [
                      ...messageData.attachments,
                      ...item.attachments,
                    ],
                  }
                : item,
            ) as AttachmentCache[];
          },
        );
      }
      break;
    case "NewConversation":
      model.queryClient.setQueryData(
        ["conversation"],
        (oldData: ConversationCache) => {
          const newConversation = [
            {
              isGroup: messageData.isGroup,
              isNotifying: true,
              id: messageData.id,
              title: messageData.title,
              avatar: messageData.avatar,
              unSeenMessages: 1,
              lastMessage: messageData.lastMessage,
              lastMessageContact: messageData.lastMessageContact,
              members: messageData.members,
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
