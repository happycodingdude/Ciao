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

  const getConversations = useCallback(() => {
    HttpRequest({
      method: "get",
      url: import.meta.env.VITE_ENDPOINT_CONVERSATION_GETWITHPAGING.replace(
        "{page}",
        page,
      ).replace("{limit}", limit),
      token: auth.token,
    }).then((res) => {
      const filterConversations = res.data.filter((item) =>
        item.participants.some(
          (participant) =>
            participant.contactId === auth.id && !participant.isDeleted,
        ),
      );
      setConversations(filterConversations);
    });
  }, [auth.token]);

  const newMessage = useCallback(
    (message) => {
      // Đã tồn tại hội thoại
      if (conversations.some((chat) => chat.Id === message.conversationId)) {
        const updatedConversations = conversations.map((chat) => {
          if (chat.id !== message.conversationId) return chat; // Khác hội thoại
          const updatedChat = { ...chat };
          if (updatedChat.id !== selected?.id)
            updatedChat.unSeenMessages++; // Hội thoại đang ko focus
          else updatedChat.unSeenMessages = 0; // Hội thoại đang focus
          updatedChat.lastMessageId = message.id;
          updatedChat.lastMessage = message.content;
          updatedChat.lastMessageTime = message.createdTime;
          updatedChat.lastMessageContact = message.contactId;
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
        if (chat.id !== conversation.id) return chat;
        chat.unSeenMessages = 0;
        return chat;
      });
      setConversations(updatedConversations);
      // setSelected(conversation);
    },
    [conversations],
  );

  const removeConversation = useCallback(
    (id) => {
      setConversations(conversations.filter((item) => item.id !== id));
    },
    [conversations],
  );

  const checkExist = useCallback(
    (id) => {
      return conversations.find(
        (conversation) =>
          conversation.isGroup === false &&
          conversation.participants.some((item) => item.contactId === id),
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
