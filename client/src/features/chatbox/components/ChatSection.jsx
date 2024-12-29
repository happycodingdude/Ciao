import React from "react";
import LoadingProvider from "../../../context/loadingContext";
import ChatboxContainer from "../../pages/ChatboxContainer";
import ListChatContainer from "../listchat/ListChatContainer";

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
