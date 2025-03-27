import React, { lazy, Suspense } from "react";
import BackgroundPortal from "../components/BackgroundPortal";
import ChatDetailTogglesProvider from "../context/ChatDetailTogglesContext";
import { useSignal } from "../context/SignalContext";
import useInfo from "../features/authentication/hooks/useInfo";
import VideoCall from "../features/chatbox/components/VideoCall";
import useConversation from "../features/listchat/hooks/useConversation";
const ListChatContainer = lazy(() => import("./ListChatContainer"));
const ChatboxContainer = lazy(() => import("./ChatboxContainer"));

const ChatSection = () => {
  const { data: conversations } = useConversation(1);
  const { data: info } = useInfo();
  const { targetUserId, remoteStream, stopCall } = useSignal();
  // const [openVideoCall, setOpenVideoCall] = useState<boolean>(false);

  // useEffect(() => {
  //   console.log(`newCall: ${newCall}`);
  // }, [newCall]);
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
        show={remoteStream !== null}
        className="phone:w-[35rem] laptop:w-[70rem] desktop:w-[35%]"
        title="Video call"
        onClose={() => stopCall(true)}
      >
        <VideoCall targetUserId={targetUserId} />
      </BackgroundPortal>
    </section>
    // </LoadingProvider>
  );
};

export default ChatSection;
