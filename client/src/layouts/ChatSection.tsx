import React, { lazy, Suspense } from "react";
import LocalLoading from "../components/LocalLoading";
import ChatDetailTogglesProvider from "../context/ChatDetailTogglesContext";
import useConversation from "../features/listchat/hooks/useConversation";
const ListChatContainer = lazy(() => import("./ListChatContainer"));
const ChatboxContainer = lazy(() => import("./ChatboxContainer"));

const ChatSection = () => {
  const { data: conversations } = useConversation(1);
  return (
    // <LoadingProvider>
    <section className={`flex grow overflow-hidden`}>
      <Suspense fallback={<LocalLoading />}>
        <ListChatContainer />
      </Suspense>
      <Suspense fallback={<LocalLoading />}>
        {conversations?.selected ? (
          // || conversations?.createGroupChat
          // || conversations?.quickChat
          <ChatDetailTogglesProvider>
            <ChatboxContainer />
          </ChatDetailTogglesProvider>
        ) : (
          ""
        )}
      </Suspense>
    </section>
    // </LoadingProvider>
  );
};

export default ChatSection;
