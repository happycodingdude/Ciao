import React, { lazy, Suspense } from "react";
import LocalLoading from "../components/LocalLoading";
import ChatDetailTogglesProvider from "../context/ChatDetailTogglesContext";
import ListchatFilterProvider from "../context/ListchatFilterContext";
import useConversation from "../features/listchat/hooks/useConversation";
import useLoading from "../hooks/useLoading";
import { isPhoneScreen } from "../utils/getScreenSize";
const ListChatContainer = lazy(() => import("./ListChatContainer"));
const ChatboxContainer = lazy(() => import("./ChatboxContainer"));

const ChatSection = () => {
  const { data: conversations } = useConversation(1);
  const { loading } = useLoading();

  return (
    <section className={`relative flex grow overflow-hidden`}>
      <ChatDetailTogglesProvider>
        <Suspense>
          <ListchatFilterProvider>
            <ListChatContainer />
          </ListchatFilterProvider>
        </Suspense>
        <div className="relative h-full w-full">
          {loading && !isPhoneScreen() ? (
            <LocalLoading className="!z-[12]" />
          ) : (
            ""
          )}
          {conversations?.selected ? <ChatboxContainer /> : ""}
        </div>
      </ChatDetailTogglesProvider>
    </section>
  );
};

export default ChatSection;
