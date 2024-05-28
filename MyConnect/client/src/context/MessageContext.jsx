import React, { createContext, useCallback, useState } from "react";
import { HttpRequest } from "../common/Utility";
import { useAuth } from "../hook/CustomHooks";

const MessageContext = createContext({});

const page = 1;
const limit = 20;

export const MessageProvider = ({ children }) => {
  console.log("MessageProvider rendering");

  const { token } = useAuth();
  const [messages, setMessages] = useState();

  const getMessages = useCallback(
    (id) => {
      HttpRequest({
        method: "get",
        url: import.meta.env.VITE_ENDPOINT_MESSAGE_GET.replace("{id}", id)
          .replace("{page}", page)
          .replace("{limit}", limit),
        token: token,
      }).then((res) => {
        setMessages(res.data.reverse());
      });
    },
    [token],
  );

  const removeLastItem = useCallback(() => {
    const updatedMessages = messages.slice(0, -1);
    setMessages(updatedMessages);
  }, [messages]);

  const addNewItem = useCallback(
    (item) => {
      setMessages([...messages, item]);
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
