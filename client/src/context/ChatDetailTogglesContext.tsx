import { createContext, ReactNode, useEffect, useState } from "react";
import { ChatDetailType, TogglesContextType } from "../types/base.types";

// Create the context
export const ChatDetailTogglesContext = createContext<
  TogglesContextType<ChatDetailType> | undefined
>(undefined);

// Create the provider
const ChatDetailTogglesProvider = ({ children }: { children: ReactNode }) => {
  const [toggle, setToggle] = useState<ChatDetailType>(
    localStorage.getItem("toggleChatDetail") as ChatDetailType,
  );

  useEffect(() => {
    localStorage.setItem("toggleChatDetail", toggle);
  }, [toggle]);

  return (
    <ChatDetailTogglesContext.Provider value={{ toggle, setToggle }}>
      {children}
    </ChatDetailTogglesContext.Provider>
  );
};

export default ChatDetailTogglesProvider;
