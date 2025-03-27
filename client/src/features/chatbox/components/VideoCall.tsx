import React, { useEffect, useRef } from "react";
import { useSignal } from "../../../context/SignalContext";
import useInfo from "../../authentication/hooks/useInfo";

const servers = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

type VideoCallProps = {
  //   userId: string;
  targetUserId: string;
};

const VideoCall: React.FC<VideoCallProps> = ({ targetUserId }) => {
  const { data: info } = useInfo();

  const localRef = useRef<HTMLVideoElement>(null);
  const remoteRef = useRef<HTMLVideoElement>(null);
  const calling = useRef<boolean>(false);

  const {
    // show,
    localStream,
    remoteStream,
    startCall,
    stopCall,
    startLocalStream,
  } = useSignal();

  // const handleStartCamera = async () => {
  //   const stream = await startLocalStream();
  //   if (stream && localRef.current) {
  //     localRef.current.srcObject = stream;
  //   }
  // };

  //   useEffect(() => {
  //     console.log(`show: ${show}`);
  //   }, [show]);

  useEffect(() => {
    if (localStream) localRef.current.srcObject = localStream;
  }, [localStream]);

  useEffect(() => {
    if (remoteStream) remoteRef.current.srcObject = remoteStream;
  }, [remoteStream]);

  return (
    <div
      className="flex flex-wrap justify-center gap-[2rem]"
      //   style={{
      //     display: "flex",
      //     justifyContent: "center",
      //     gap: "20px",
      //     marginBottom: "20px",
      //     flexWrap: "wrap",
      //   }}
    >
      <video id="localVideo" ref={localRef} autoPlay muted />
      <video id="remoteVideo" ref={remoteRef} autoPlay muted />
      <div className="flex w-full justify-center gap-[2rem]">
        <button onClick={() => startCall(targetUserId)}>Call</button>
        <button onClick={() => stopCall(true)}>Stop</button>
      </div>
    </div>
  );
};

export default VideoCall;
