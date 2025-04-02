import React, { lazy, Suspense } from "react";
import BackgroundPortal from "../components/BackgroundPortal";
import ChatDetailTogglesProvider from "../context/ChatDetailTogglesContext";
import { useSignal } from "../context/SignalContext";
import useConversation from "../features/listchat/hooks/useConversation";
import ReceiveOffer from "../features/videocall/ReceiveOffer";
import VideoCall from "../features/videocall/VideoCall";
const ListChatContainer = lazy(() => import("./ListChatContainer"));
const ChatboxContainer = lazy(() => import("./ChatboxContainer"));

const ChatSection = () => {
  const { data: conversations } = useConversation(1);
  // const { data: info } = useInfo();
  const { targetUser, remoteStream, stopCall, receiveOffer } = useSignal();
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
          <ListChatContainer />
          {/* {conversations?.selected ? <LocalLoading /> : <ListChatContainer />} */}
        </Suspense>
        <Suspense>
          {conversations?.selected ? <ChatboxContainer /> : ""}
        </Suspense>
      </ChatDetailTogglesProvider>
      <BackgroundPortal
        show={receiveOffer || remoteStream !== null}
        className="phone:w-[35rem] laptop:w-[30rem] desktop:w-[35%]"
        // title="Video call"
        onClose={() => stopCall()}
        noHeader={true}
      >
        {receiveOffer ? <ReceiveOffer /> : <VideoCall id={targetUser?.id} />}
      </BackgroundPortal>
    </section>
    // </LoadingProvider>
  );
};

export default ChatSection;
