import React, { lazy, Suspense } from "react";
import ChatDetailTogglesProvider from "../context/ChatDetailTogglesContext";
import useConversation from "../features/listchat/hooks/useConversation";
const ListChatContainer = lazy(() => import("./ListChatContainer"));
const ChatboxContainer = lazy(() => import("./ChatboxContainer"));

const ChatSection = () => {
  const { data: conversations } = useConversation(1);
  return (
    // <LoadingProvider>
    // <section className={`relative flex grow overflow-hidden`}>
    //   <Suspense fallback={<LocalLoading />}>
    //     {/* <ListchatTogglesProvider> */}
    //     <ListChatContainer />
    //     {/* </ListchatTogglesProvider> */}
    //   </Suspense>
    //   <Suspense fallback={<LocalLoading />}>
    //     {conversations?.selected ? (
    //       <ChatDetailTogglesProvider>
    //         <ChatboxContainer />
    //       </ChatDetailTogglesProvider>
    //     ) : (
    //       ""
    //     )}
    //   </Suspense>
    // </section>
    <section className={`relative flex grow overflow-hidden`}>
      <ChatDetailTogglesProvider>
        <Suspense>
          {/* <ListchatTogglesProvider> */}
          <ListChatContainer />
          {/* </ListchatTogglesProvider> */}
        </Suspense>
        <Suspense>
          {conversations?.selected ? <ChatboxContainer /> : ""}
        </Suspense>
      </ChatDetailTogglesProvider>
    </section>
    // </LoadingProvider>
  );
};

export default ChatSection;
