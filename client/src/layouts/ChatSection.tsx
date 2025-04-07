import { DndContext, DragEndEvent } from "@dnd-kit/core";
import React, { lazy, Suspense, useEffect, useState } from "react";
import ChatDetailTogglesProvider from "../context/ChatDetailTogglesContext";
import { useSignal } from "../context/SignalContext";
import useConversation from "../features/listchat/hooks/useConversation";
import ReceiveOffer from "../features/videocall/ReceiveOffer";
import VideoCall, { PositionProps } from "../features/videocall/VideoCall";
const ListChatContainer = lazy(() => import("./ListChatContainer"));
const ChatboxContainer = lazy(() => import("./ChatboxContainer"));

const ChatSection = () => {
  const { data: conversations } = useConversation(1);
  // const { data: info } = useInfo();
  const { targetUser, remoteStream, stopCall, receiveOffer } = useSignal();

  const [position, setPosition] = useState<PositionProps>({ x: 0, y: 0 });
  // Center the modal when it first renders
  useEffect(() => {
    // const centerX = window.innerWidth / 2 - 200; // Adjust based on modal width
    // const centerY = window.innerHeight / 2 - 300; // Adjust based on modal height
    setPosition({
      x: (window.innerWidth * 2) / 3,
      y: (window.innerHeight * 2) / 4,
    });
  }, []);

  const handleDragEnd = (event: DragEndEvent) => {
    // console.log(event);
    if (event.delta) {
      setPosition((prev) => ({
        x: prev.x + event.delta.x,
        y: prev.y + event.delta.y,
      }));
    }
  };

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
      {/* <BackgroundPortal
        show={receiveOffer || remoteStream !== null}
        className="phone:w-[35rem] laptop:w-[30rem] desktop:w-[35%]"
        // title="Video call"
        onClose={() => stopCall()}
        noHeader={true}
      > */}
      <DndContext onDragEnd={handleDragEnd}>
        {receiveOffer ? (
          <ReceiveOffer position={position} />
        ) : (
          <VideoCall contact={targetUser} position={position} />
        )}
      </DndContext>
      {/* </BackgroundPortal> */}
    </section>
    // </LoadingProvider>
  );
};

export default ChatSection;
