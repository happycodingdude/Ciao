import { HttpRequest } from "../lib/fetch";

const page = 1;
const limit = 10;

export const getNotification = async () => {
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

export const read = async (id) => {
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

export const readAll = async (ids) => {
  return (
    await HttpRequest({
      method: "put",
      url: import.meta.env.VITE_ENDPOINT_NOTIFICATION_GET,
    })
  ).data;
};

export const registerConnection = async (token) => {
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

export const notifyMessage = (message, queryClient, info) => {
  const messageData =
    message.data === undefined ? undefined : JSON.parse(message.data);
  console.log(message);

  switch (message.event) {
    case "NewMessage":
      queryClient.setQueryData(["conversation"], (oldData) => {
        // If exists conversation -> update state and return
        if (
          oldData.conversations.some(
            (conversation) => conversation.id === messageData.conversationId,
          )
        ) {
          const clonedConversations = oldData.conversations.map((item) => {
            return Object.assign({}, item);
          });
          const updatedConversations = clonedConversations.map(
            (conversation) => {
              if (conversation.id !== messageData.conversationId)
                return conversation;
              conversation.lastMessage = messageData.content;
              conversation.lastMessageContact = messageData.contactId;
              conversation.unSeenMessages++;
              return conversation;
            },
          );
          return { ...oldData, conversations: updatedConversations };
        }

        // Else generate new conversation and update state
        return {
          ...oldData,
          conversations: [
            {
              isGroup: false,
              isNotifying: true,
              id: messageData.conversationId,
              lastMessage: messageData.content,
              lastMessageContact: messageData.contactId,
              unSeenMessages: 1,
              participants: [
                {
                  contact: {
                    id: info.data.id,
                    name: info.data.name,
                    avatar: info.data.avatar,
                    isOnline: true,
                  },
                },
                {
                  contact: {
                    id: messageData.contact.id,
                    name: messageData.contact.name,
                    avatar: messageData.contact.avatar,
                    isOnline: messageData.contact.isOnline,
                  },
                },
              ],
            },
            ...oldData.conversations,
          ],
        };
      });
      queryClient.setQueryData(["message"], (oldData) => {
        if (!oldData) return; // Case haven't click any conversation
        if (oldData.id !== messageData.conversationId) return oldData;
        return {
          ...oldData,
          messages: [
            {
              ...messageData,
              contactId: messageData.contactId,
              currentReaction: null,
            },
            ...oldData.messages,
          ],
        };
      });
      break;
    // case "AddMember":
    //   const listChat = Array.from(document.querySelectorAll(".chat-item"));
    //   const oldChat = listChat.find(
    //     (item) => item.dataset.key === messageData.Id,
    //   );
    //   // Old chat and is focused
    //   if (oldChat && oldChat.classList.contains("item-active"))
    //     reFetchParticipants(messageData.Id);
    //   else reFetchConversations();
    //   break;
    // case "NewConversation":
    //   reFetchConversations();
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
