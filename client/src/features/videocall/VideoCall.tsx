import { useDraggable } from "@dnd-kit/core";
import React, { CSSProperties, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useSignal } from "../../context/SignalContext";
import { ConversationModel_Contact } from "../listchat/types";

type VideoCallProps = {
  contact: ConversationModel_Contact;
  position: { x: number; y: number };
};

const VideoCall: React.FC<VideoCallProps> = ({ contact, position }) => {
  const localRef = useRef<HTMLVideoElement>(null);
  const remoteRef = useRef<HTMLVideoElement>(null);

  const { localStream, remoteStream, startCall, stopCall, isCaller } =
    useSignal();

  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: contact.id,
  });
  const style = {
    position: "absolute",
    left: `${position.x}px`,
    top: `${position.y}px`,
    transform: transform
      ? `translate(${transform.x}px, ${transform.y}px)`
      : undefined, // Keeps movement smooth
  };

  useEffect(() => {
    if (localStream) localRef.current.srcObject = localStream;
  }, [localStream]);

  useEffect(() => {
    if (remoteStream) remoteRef.current.srcObject = remoteStream;
  }, [remoteStream]);

  return createPortal(
    <div
      ref={setNodeRef}
      style={style as CSSProperties}
      className="relative z-50 flex h-[45rem] justify-center rounded-[1rem]
      bg-black phone:w-[35rem] laptop:w-[30rem] desktop:w-[35%]"
    >
      <video
        id="localVideo"
        ref={localRef}
        autoPlay
        muted
        className="absolute right-[1rem] top-[1rem] z-10 h-1/3 w-1/3 bg-purple-500"
      />
      {remoteStream !== null ? (
        <video
          id="remoteVideo"
          ref={remoteRef}
          autoPlay
          muted
          className="absolute h-full w-full cursor-grab rounded-[1rem]"
        />
      ) : (
        <div
          style={{
            backgroundImage: `url(${contact.avatar ?? "src/assets/imagenotfound.jpg"})`,
          }}
          {...listeners}
          {...attributes}
          className={`absolute h-full w-full cursor-grab rounded-[1rem] bg-[size:cover]
            bg-[position:center_center] bg-no-repeat opacity-60`}
        ></div>
      )}
      <div className="pointer-events-auto absolute bottom-[10%] flex w-[70%] justify-between">
        {isCaller ? (
          <button
            className="bg-green-500 text-white"
            onClick={() => startCall(contact.avatar)}
          >
            <i className="fa fa-phone" />
          </button>
        ) : (
          ""
        )}
        <button className="bg-red-500 text-white" onClick={stopCall}>
          <i className="fa fa-x" />
        </button>
      </div>
    </div>,
    document.getElementById("portal"),
  );
};

export default VideoCall;
