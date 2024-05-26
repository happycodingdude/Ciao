import React, { createContext, useCallback, useState } from "react";
import { HttpRequest } from "../common/Utility";
import { useAuth } from "../hook/CustomHooks";

const ConversationContext = createContext({});

const page = 1;
const limit = 20;

export const ConversationProvider = ({ children }) => {
  console.log("ConversationProvider rendering");

  const auth = useAuth();
  const [conversations, setConversations] = useState();
  const [selected, setSelected] = useState();

  const getConversations = useCallback(
    (controller = new AbortController()) => {
      HttpRequest({
        method: "get",
        url: import.meta.env.VITE_ENDPOINT_CONVERSATION_GET.replace('{page}',page).replace('{limit}',limit),
        token: auth.token,
        controller: controller,
      }).then((res) => {
        const filterConversations = res.data.filter((item) =>
          item.Participants.some(
            (participant) =>
              participant.ContactId === auth.id && !participant.IsDeleted,
          ),
        );
        setConversations(filterConversations);
      });
    },
    [auth.token],
  );

  const newMessage = useCallback(
    (message) => {
      // Đã tồn tại hội thoại
      if (conversations.some((chat) => chat.Id === message.ConversationId)) {
        const updatedConversations = conversations.map((chat) => {
          if (chat.Id !== message.ConversationId) return chat; // Khác hội thoại
          const updatedChat = { ...chat };
          if (updatedChat.Id !== selected?.Id)
            updatedChat.UnSeenMessages++; // Hội thoại đang ko focus
          else updatedChat.UnSeenMessages = 0; // Hội thoại đang focus
          updatedChat.LastMessageId = message.Id;
          updatedChat.LastMessage = message.Content;
          updatedChat.LastMessageTime = message.CreatedTime;
          updatedChat.LastMessageContact = message.ContactId;
          return updatedChat;
        });
        setConversations(updatedConversations);
      } else getConversations();
    },
    [conversations, selected, getConversations],
  );

  const clickConversation = useCallback(
    (conversation) => {
      const updatedConversations = conversations.map((chat) => {
        if (chat.Id !== conversation.Id) return chat;
        chat.UnSeenMessages = 0;
        return chat;
      });
      setConversations(updatedConversations);
      // setSelected(conversation);
    },
    [conversations],
  );

  const removeConversation = useCallback(
    (id) => {
      setConversations(conversations.filter((item) => item.Id !== id));
    },
    [conversations],
  );

  const checkExist = useCallback(
    (id) => {
      return conversations.find(
        (conversation) =>
          conversation.IsGroup === false &&
          conversation.Participants.some((item) => item.ContactId === id),
      );
    },
    [conversations],
  );

  const addNewItem = useCallback(
    (item) => {
      conversations.splice(0, 0, item);
    },
    [conversations],
  );

  return (
    <ConversationContext.Provider
      value={{
        conversations,
        setConversations,
        selected,
        setSelected,
        reFetch: getConversations,
        newMessage,
        clickConversation,
        removeConversation,
        checkExist,
        addNewItem,
      }}
    >
      {children}
    </ConversationContext.Provider>
  );
};

export default ConversationContext;
