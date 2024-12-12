import React from "react";
import { LoadingProvider } from "../../context/LoadingContext";
import ListChatContainer from "../listchat/ListChatContainer";
import ChatboxContainer from "./ChatboxContainer";

export const ChatSection = () => {
  return (
    <LoadingProvider>
      <section className={`flex grow overflow-hidden`}>
        <ListChatContainer />
        <ChatboxContainer />
      </section>
    </LoadingProvider>
  );
};
