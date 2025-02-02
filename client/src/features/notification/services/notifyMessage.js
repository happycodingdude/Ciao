const notifyMessage = (message, queryClient, info) => {
  const messageData =
    message.data === undefined ? undefined : JSON.parse(message.data);
  console.log(message);

  switch (message.event) {
    case "NewMessage":
      queryClient.setQueryData(["conversation"], (oldData) => {
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
              conversation.lastMessage = messageData.content;
              conversation.lastMessageContact = messageData.contact.id;
              conversation.unSeenMessages++;
              return conversation;
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
        };
      });
      queryClient.setQueryData(["message"], (oldData) => {
        if (!oldData) return; // Case haven't click any conversation
        if (oldData.id !== messageData.conversation.id) return oldData;
        return {
          ...oldData,
          messages: [
            {
              ...messageData,
              contactId: messageData.contact.id,
              currentReaction: null,
            },
            ...oldData.messages,
          ],
        };
      });
      break;
    case "NewConversation":
      queryClient.setQueryData(["conversation"], (oldData) => {
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
