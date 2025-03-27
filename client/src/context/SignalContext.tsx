import { HubConnection, HubConnectionBuilder } from "@microsoft/signalr";
import { useQueryClient } from "@tanstack/react-query";
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import useInfo from "../features/authentication/hooks/useInfo";
import { setupListeners } from "../features/notification/services/signalService";

type SignalContextType = {
  startCall: (targetUserId: string) => void;
  stopCall: (isCaller: boolean) => void;
  startLocalStream: () => void;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  targetUserId: string | null;
  // show: boolean;
  // onOffer: (callerId: string, offer: string) => void;
};

const SignalContext = createContext<SignalContextType | undefined>(undefined);

export const SignalProvider: React.FC<{
  // userId: string;
  children: React.ReactNode;
}> = ({ children }) => {
  const { data: info } = useInfo();
  const queryClient = useQueryClient();

  // const [isConnected, setIsConnected] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [targetUserId, setTargetUserId] = useState<string | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  // const showRef = useRef<boolean>(false);
  // const [show, setShow] = useState<boolean>(false);
  // const [newCall, setNewCall] = useState<boolean>(false);

  const connectionRef = useRef<HubConnection | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const remoteUserIdRef = useRef<string | null>(null);
  const isRegistered = useRef<boolean>(false);

  const iceServers = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  };

  /* MARK: START CAMERA */
  const startLocalStream = async () => {
    // showRef.current = true;
    // setShow(true);
    // navigator.mediaDevices
    //   .getUserMedia({
    //     video: true,
    //     audio: true,
    //   })
    //   .then((stream) => {
    //     const vid: any = document.getElementById("localVideo");
    //     vid.srcObject = stream;
    //   });

    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    localStreamRef.current = stream;
    setLocalStream(stream);

    // setLocalStream(stream);
    // stream.getTracks().forEach((track) => {
    //   pcRef.current?.addTrack(track, stream);
    // });
    // return stream;
  };

  /* MARK: SETUP CONNECTION */
  const setupPeerConnection = async (
    remoteUserId: string,
    // skipTrackAdding = false,
  ) => {
    pcRef.current = new RTCPeerConnection(iceServers);
    remoteUserIdRef.current = remoteUserId;

    // const remoteStream = new MediaStream();
    // setRemoteStream(remoteStream);

    pcRef.current.onicecandidate = (e) => {
      console.log(e);
      if (e.candidate) {
        connectionRef.current?.send(
          "SendIceCandidate",
          remoteUserId,
          JSON.stringify(e.candidate),
        );
      }
    };

    pcRef.current.ontrack = (e) => {
      // console.log(e);
      console.log("🔔 On track");
      remoteStreamRef.current = e.streams[0];
      // const vid: any = document.getElementById("remoteVideo");
      // vid.srcObject = e.streams[0];

      setRemoteStream(e.streams[0]);

      // e.streams[0].getTracks().forEach((track) => remoteStream.addTrack(track));
    };

    // console.log(typeof pcRef.current.ontrack);

    // if (!skipTrackAdding && localStream) {
    // console.log(localStream);

    // if (localStreamRef.current) {
    //   localStream.getTracks().forEach((track) => {
    //     pcRef.current?.addTrack(track, localStream);
    //   });
    // }

    localStreamRef.current?.getTracks().forEach((track) => {
      pcRef.current?.addTrack(track, localStreamRef.current!);
    });
  };

  /* MARK: START CALL */
  const startCall = async (targetUserId: string) => {
    // if (!localStream) await startLocalStream();
    await setupPeerConnection(targetUserId);

    const offer = await pcRef.current?.createOffer();
    await pcRef.current?.setLocalDescription(offer!);

    connectionRef.current?.send(
      "SendOffer",
      targetUserId,
      info.id,
      JSON.stringify(offer),
    );
  };

  /* MARK: STOP CALL */
  const stopCall = (isCaller = false) => {
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    remoteStreamRef.current?.getTracks().forEach((track) => track.stop());
    pcRef.current?.close();
    pcRef.current = null;
    // showRef.current = false;

    // setShow(false);
    setLocalStream(null);
    setRemoteStream(null);
    setTargetUserId(null);

    const remoteUserId = remoteUserIdRef.current;
    if (
      isCaller &&
      remoteUserId &&
      connectionRef.current?.state === "Connected"
    ) {
      connectionRef.current.send("EndCall", remoteUserId);
    }
  };

  // 🔌 SignalR setup
  useEffect(() => {
    if (!info.id || isRegistered.current) return;
    isRegistered.current = true;

    const connect = async () => {
      const connection = new HubConnectionBuilder()
        .withUrl(
          `${import.meta.env.VITE_ASPNETCORE_CHAT_URL}/ciaohub?userId=${info.id}`,
        )
        .withAutomaticReconnect()
        .build();

      /* MARK: RECEIVE OFFER */
      connection.on("ReceiveOffer", async (callerId: string, offer: string) => {
        console.log("🔔 Received offer");
        setTargetUserId(callerId);
        await setupPeerConnection(callerId);

        const rtcOffer = new RTCSessionDescription(JSON.parse(offer));
        await pcRef.current?.setRemoteDescription(rtcOffer);

        const answer = await pcRef.current?.createAnswer();
        await pcRef.current?.setLocalDescription(answer!);
        connection.send("SendAnswer", callerId, JSON.stringify(answer));
      });

      /* MARK: RECEIVE ANSWER */
      connection.on("ReceiveAnswer", async (answer: string) => {
        console.log("🔔 Received answer");
        const rtcAnswer = new RTCSessionDescription(JSON.parse(answer));
        await pcRef.current?.setRemoteDescription(rtcAnswer);
      });

      /* MARK: RECEIVE CANDIDATE */
      connection.on("ReceiveIceCandidate", async (candidate: string) => {
        console.log("🔔 Received candidate");
        const rtcCandidate = new RTCIceCandidate(JSON.parse(candidate));
        await pcRef.current?.addIceCandidate(rtcCandidate);
      });

      connection.on("CallEnded", () => {
        console.log("🔔 Call ended");
        stopCall();
      });

      setupListeners(connection, queryClient, info);

      await connection.start();
      connectionRef.current = connection;
      // setIsConnected(true);
      console.log("✅ SignalR connected");
    };

    connect();
  }, []);

  return (
    <SignalContext.Provider
      value={{
        startCall,
        stopCall,
        startLocalStream,
        localStream,
        remoteStream,
        targetUserId,
        // show: show,
        // onOffer
      }}
    >
      {children}
    </SignalContext.Provider>
  );
};

export const useSignal = (): SignalContextType => {
  const ctx = useContext(SignalContext);
  if (!ctx) throw new Error("useSignal must be used inside SignalProvider");
  return ctx;
};
