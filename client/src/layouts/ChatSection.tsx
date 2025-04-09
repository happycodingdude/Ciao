import React, { lazy, Suspense } from "react";
import ChatDetailTogglesProvider from "../context/ChatDetailTogglesContext";
import useConversation from "../features/listchat/hooks/useConversation";
const ListChatContainer = lazy(() => import("./ListChatContainer"));
const ChatboxContainer = lazy(() => import("./ChatboxContainer"));

const ChatSection = () => {
  const { data: conversations } = useConversation(1);

  return (
    <section className={`relative flex grow overflow-hidden`}>
      <ChatDetailTogglesProvider>
        <Suspense>
          <ListChatContainer />
        </Suspense>
        <Suspense>
          {conversations?.selected ? <ChatboxContainer /> : ""}
        </Suspense>
      </ChatDetailTogglesProvider>
    </section>
  );
};

export default ChatSection;
