import React from "react";
import LoadingProvider from "../context/LoadingContext";
import ChatboxContainer from "./ChatboxContainer";
import ListChatContainer from "./ListChatContainer";

const ChatSection = () => {
  return (
    <LoadingProvider>
      <section className={`flex grow overflow-hidden`}>
        <ListChatContainer />
        <ChatboxContainer />
      </section>
    </LoadingProvider>
  );
};

export default ChatSection;
