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
    newCall,
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

  useEffect(() => {
    if (newCall || calling.current) return;
    calling.current = true;
    const call = async () => {
      let stream = localStream;
      if (!stream) stream = await startLocalStream();
      localRef.current.srcObject = stream;
      //   startLocalStream();
      startCall(targetUserId);
    };
    call();
  }, [newCall]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        gap: "20px",
        marginBottom: "20px",
      }}
    >
      <video id="localVideo" ref={localRef} autoPlay muted />
      <video id="remoteVideo" ref={remoteRef} autoPlay />
      {/* <button onClick={stopCall}>Stop</button> */}
    </div>
  );
};

export default VideoCall;
