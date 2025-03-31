import React, { useEffect, useRef } from "react";
import { useSignal } from "../../context/SignalContext";

type VideoCallProps = {
  targetUserId: string;
};

const VideoCall: React.FC<VideoCallProps> = ({ targetUserId }) => {
  const localRef = useRef<HTMLVideoElement>(null);
  const remoteRef = useRef<HTMLVideoElement>(null);

  const { localStream, remoteStream, startCall, stopCall, isCaller } =
    useSignal();

  useEffect(() => {
    if (localStream) localRef.current.srcObject = localStream;
  }, [localStream]);

  useEffect(() => {
    if (remoteStream) remoteRef.current.srcObject = remoteStream;
  }, [remoteStream]);

  return (
    <div className="relative h-[40rem] w-full">
      <video
        id="localVideo"
        ref={localRef}
        autoPlay
        muted
        className="absolute right-[1rem] top-[1rem] z-10 h-1/3 w-1/3 bg-green-500"
      />
      <video
        id="remoteVideo"
        ref={remoteRef}
        autoPlay
        muted
        className="absolute h-full w-full bg-yellow-500"
      />
      <div className="absolute bottom-0 flex w-full cursor-pointer justify-center gap-[2rem]">
        {isCaller ? (
          <button onClick={() => startCall(targetUserId)}>Call</button>
        ) : (
          ""
        )}
        <button onClick={() => stopCall(true)}>End call</button>
      </div>
    </div>
  );
};

export default VideoCall;
