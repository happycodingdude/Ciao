import React, { createContext, useCallback, useState } from "react";
import { HttpRequest } from "../common/Utility";
import { useAuth } from "../hook/CustomHooks";

const MessageContext = createContext({});

const page = 1;
const limit = 20;

export const MessageProvider = ({ children }) => {
  console.log("MessageProvider rendering");

  const auth = useAuth();
  const [messages, setMessages] = useState();

  const getMessages = useCallback(
    (id) => {
      HttpRequest({
        method: "get",
        url: `api/conversations/${id}/messages?page=${page}&limit=${limit}`,
        token: auth.token,
      }).then((res) => {
        setMessages(res.reverse());
      });
    },
    [auth.token],
  );

  const removeLastItem = useCallback(() => {
    const updatedMessages = messages.slice(0, -1);
    setMessages(updatedMessages);
  }, [messages]);

  const addNewItem = useCallback(
    (newItem) => {
      setMessages([...messages, newItem]);
    },
    [messages],
  );

  return (
    <MessageContext.Provider
      value={{ messages, reFetch: getMessages, removeLastItem, addNewItem }}
    >
      {children}
    </MessageContext.Provider>
  );
};

export default MessageContext;
