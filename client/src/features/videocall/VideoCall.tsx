import { DndContext, useDraggable } from "@dnd-kit/core";
import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useSignal } from "../../context/SignalContext";
import { ConversationModel_Contact } from "../listchat/types";

const VideoCall: React.FC<ConversationModel_Contact> = ({ id, avatar }) => {
  const localRef = useRef<HTMLVideoElement>(null);
  const remoteRef = useRef<HTMLVideoElement>(null);
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: id,
  });

  const { localStream, remoteStream, startCall, stopCall, isCaller } =
    useSignal();

  const style = transform
    ? {
        transform: `translate(${transform.x}px, ${transform.y}px)`,
      }
    : undefined;

  useEffect(() => {
    if (localStream) localRef.current.srcObject = localStream;
  }, [localStream]);

  useEffect(() => {
    if (remoteStream) remoteRef.current.srcObject = remoteStream;
  }, [remoteStream]);

  return createPortal(
    <DndContext>
      <div
        ref={setNodeRef}
        // style={style}
        className="relative flex h-[45rem] justify-center bg-[white] 
      phone:w-[35rem] laptop:w-[30rem] desktop:w-[35%]"
      >
        <video
          id="localVideo"
          ref={localRef}
          {...listeners}
          {...attributes}
          style={style}
          autoPlay
          muted
          className="absolute right-[1rem] top-[1rem] z-10 h-1/3 w-1/3 cursor-grab bg-green-500"
        />
        {remoteStream !== null ? (
          <video
            id="remoteVideo"
            ref={remoteRef}
            autoPlay
            muted
            className="absolute h-full w-full"
          />
        ) : (
          <div
            style={{
              backgroundImage: `url(${avatar ?? "src/assets/imagenotfound.jpg"})`,
            }}
            className={`absolute h-full w-full  bg-[size:cover]
            bg-[position:center_center] bg-no-repeat opacity-70`}
          ></div>
        )}
        <div className="absolute bottom-[10%] flex w-[70%] justify-between">
          {isCaller ? (
            <button
              className="bg-green-500 text-white"
              onClick={() => startCall(id)}
            >
              <i className="fa fa-phone" />
            </button>
          ) : (
            ""
          )}
          <button
            className="bg-red-500 text-white"
            onClick={() => stopCall(true)}
          >
            <i className="fa fa-x" />
          </button>
        </div>
      </div>
    </DndContext>,
    document.getElementById("portal"),
  );

  // return (
  //   <div className="relative flex h-[45rem] w-full justify-center">
  //     <video
  //       id="localVideo"
  //       ref={localRef}
  //       autoPlay
  //       muted
  //       className="absolute right-[1rem] top-[1rem] z-10 h-1/3 w-1/3 bg-green-500"
  //     />
  //     {remoteStream !== null ? (
  //       <video
  //         id="remoteVideo"
  //         ref={remoteRef}
  //         autoPlay
  //         muted
  //         className="absolute h-full w-full"
  //       />
  //     ) : (
  //       <div
  //         style={{
  //           backgroundImage: `url(${avatar ?? "src/assets/imagenotfound.jpg"})`,
  //         }}
  //         className={`absolute h-full w-full bg-[size:cover] bg-[position:center_center] bg-no-repeat opacity-50`}
  //       ></div>
  //     )}
  //     <div className="absolute bottom-[10%] flex w-[70%] justify-between">
  //       {isCaller ? (
  //         <button
  //           className="bg-green-500 text-white"
  //           onClick={() => startCall(id)}
  //         >
  //           <i className="fa fa-phone" />
  //         </button>
  //       ) : (
  //         ""
  //       )}
  //       <button
  //         className="bg-red-500 text-white"
  //         onClick={() => stopCall(true)}
  //       >
  //         <i className="fa fa-x" />
  //       </button>
  //     </div>
  //   </div>
  // );
};

export default VideoCall;
