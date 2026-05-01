import { HubConnection } from "@microsoft/signalr";
import { useQueryClient } from "@tanstack/react-query";
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import useInfo from "../hooks/useInfo";
import {
  classifyNotification,
  registerConnection,
  requestPermission,
} from "../services/notification.service";
import { UserProfile } from "../types/base.types";

type SignalContextType = {
  startCall: () => void;
  stopCall: () => void;
  startLocalStream: (targetUser: UserProfile) => void;
  answerCall: () => void;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  targetUser: UserProfile | null;
  isCaller: boolean;
  receiveOffer: boolean;
  stopConnection: () => Promise<void>;
};

const SignalContext = createContext<SignalContextType | undefined>(undefined);

export const useSignal = (): SignalContextType => {
  const ctx = useContext(SignalContext);
  if (!ctx) throw new Error("useSignal must be used inside SignalProvider");
  return ctx;
};

export const SignalProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { data: info } = useInfo();
  const queryClient = useQueryClient();

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [targetUser, setTargetUser] = useState<UserProfile | null>(null);
  const [isCaller, setIsCaller] = useState<boolean>(false);
  const [receiveOffer, setReceiveOffer] = useState<boolean>(false);
  const [offer, setOffer] = useState<string | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);

  const connectionRef = useRef<HubConnection | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);

  const iceServers = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  };

  /* MARK: START CAMERA */
  const startLocalStream = async (targetUser: UserProfile) => {
    try {
      setTargetUser(targetUser);
      setIsCaller(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      localStreamRef.current = stream;
      setLocalStream(stream);
    } catch (error) {
      console.error("Error accessing media devices.", error);
    }
  };

  /* MARK: ANSWER CALL */
  const answerCall = async () => {
    if (!offer || !targetUser) return;
    setReceiveOffer(false);
    const rtcOffer = new RTCSessionDescription(JSON.parse(offer));
    await pcRef.current?.setRemoteDescription(rtcOffer);
    const answer = await pcRef.current?.createAnswer();
    await pcRef.current?.setLocalDescription(answer!);
    connectionRef.current?.send(
      "SendAnswer",
      targetUser.id,
      JSON.stringify(answer),
    );
  };

  /* MARK: SETUP CONNECTION */
  const setupPeerConnection = async (remoteUserId: string) => {
    pcRef.current = new RTCPeerConnection(iceServers);
    pcRef.current.onicecandidate = (e) => {
      if (e.candidate) {
        connectionRef.current?.send(
          "SendIceCandidate",
          remoteUserId,
          JSON.stringify(e.candidate),
        );
      }
    };

    pcRef.current.ontrack = (e) => {
      remoteStreamRef.current = e.streams[0];
      setRemoteStream(e.streams[0]);
      setIsCaller(false);
    };

    localStreamRef.current?.getTracks().forEach((track) => {
      pcRef.current?.addTrack(track, localStreamRef.current!);
    });
  };

  /* MARK: START CALL */
  const startCall = async () => {
    if (!targetUser?.id) return;
    await setupPeerConnection(targetUser.id);

    const offer = await pcRef.current?.createOffer();
    await pcRef.current?.setLocalDescription(offer!);

    connectionRef.current?.send(
      "SendOffer",
      targetUser.id,
      info?.id,
      JSON.stringify(offer),
    );

    setIsCaller(false);
  };

  /* MARK: STOP CAMERA */
  const stopCamera = () => {
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    remoteStreamRef.current?.getTracks().forEach((track) => track.stop());
    pcRef.current?.getSenders().forEach((sender) => {
      pcRef.current?.removeTrack(sender);
    });
    pcRef.current?.close();
    pcRef.current = null;

    setLocalStream(null);
    setRemoteStream(null);
    setTargetUser(null);
    setReceiveOffer(false);
    setOffer(null);
    setIsCaller(false);
  };

  /* MARK: STOP CALL */
  const stopCall = () => {
    stopCamera();
    if (connectionRef.current && targetUser?.id) {
      connectionRef.current.send("EndCall", targetUser.id);
    }
  };

  /* MARK: STOP CONNECTION */
  const stopConnection = async () => {
    if (connectionRef.current?.state === "Connected") {
      await connectionRef.current.stop();
    }
  };

  useEffect(() => {
    if (!info?.id) return;

    let isMounted = true;

    requestPermission({
      registerConnection: async (token: string) => {
        if (!isMounted) return;
        await registerConnection(token);
      },
      onNotification: (notificationData: any) => {
        if (!isMounted) return;
        classifyNotification(notificationData, queryClient, info);
      },
    });

    return () => {
      isMounted = false;
    };
  }, [info?.id, queryClient]);

  return (
    <SignalContext.Provider
      value={{
        startCall,
        stopCall,
        startLocalStream,
        answerCall,
        localStream,
        remoteStream,
        targetUser,
        isCaller,
        receiveOffer,
        stopConnection,
      }}
    >
      {children}
    </SignalContext.Provider>
  );
};
