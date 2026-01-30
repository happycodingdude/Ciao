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
  console.log("Rendering useSignal");

  const ctx = useContext(SignalContext);
  if (!ctx) throw new Error("useSignal must be used inside SignalProvider");
  return ctx;
};

export const SignalProvider: React.FC<{
  // userId: string;
  children: React.ReactNode;
}> = ({ children }) => {
  console.log("Rendering SignalProvider");

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
  // const isRegistered = useRef<boolean>(false);

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
    setReceiveOffer(false);
    const rtcOffer = new RTCSessionDescription(JSON.parse(offer));
    await pcRef.current?.setRemoteDescription(rtcOffer);
    const answer = await pcRef.current?.createAnswer();
    await pcRef.current?.setLocalDescription(answer!);
    connectionRef.current.send(
      "SendAnswer",
      targetUser.id,
      JSON.stringify(answer),
    );
  };

  /* MARK: SETUP CONNECTION */
  const setupPeerConnection = async (remoteUserId: string) => {
    pcRef.current = new RTCPeerConnection(iceServers);
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
      console.log("🔔 On track");

      remoteStreamRef.current = e.streams[0];

      setRemoteStream(e.streams[0]);
      setIsCaller(false);

      // e.streams[0]
      //   .getTracks()
      //   .forEach((track) => remoteStreamRef.current.addTrack(track));
    };

    localStreamRef.current?.getTracks().forEach((track) => {
      pcRef.current?.addTrack(track, localStreamRef.current!);
    });
  };

  /* MARK: START CALL */
  const startCall = async () => {
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
    connectionRef.current.send("EndCall", targetUser.id);
  };

  /* MARK: STOP CONNECTION */
  const stopConnection = async () => {
    if (connectionRef.current?.state === "Connected") {
      await connectionRef.current.stop();
    }
  };

  // 🔌 SignalR setup
  // useEffect(() => {
  //   if (!info?.id) return;
  //   // if (connectionRef.current) return; // ✅ đã có connection → không tạo lại

  //   getSignalConnection(info.id).then((connection) => {
  //     /* MARK: RECEIVE OFFER */
  //     connection.on(
  //       "ReceiveOffer",
  //       async (caller: UserProfile, offer: string) => {
  //         console.log("🔔 Received offer");

  //         // const stream = await navigator.mediaDevices.getUserMedia({
  //         //   video: true,
  //         //   audio: true,
  //         // });
  //         // localStreamRef.current = stream;
  //         // setLocalStream(stream);

  //         // setTargetUser(caller);
  //         // setOffer(offer);
  //         // setReceiveOffer(true);
  //         // await setupPeerConnection(caller.id);

  //         // 1. Get local stream
  //         const stream = await navigator.mediaDevices.getUserMedia({
  //           // video: { width: { ideal: 640 }, height: { ideal: 360 } },
  //           video: true,
  //           audio: true,
  //         });
  //         localStreamRef.current = stream;
  //         setLocalStream(stream);

  //         // 2. Set target
  //         setTargetUser(caller);

  //         // 3. Setup peer connection BEFORE setting offer
  //         await setupPeerConnection(caller.id);

  //         // 4. Set offer and show answer UI
  //         setOffer(offer);
  //         setReceiveOffer(true);
  //       },
  //     );

  //     /* MARK: RECEIVE ANSWER */
  //     connection.on("ReceiveAnswer", async (answer: string) => {
  //       console.log("🔔 Received answer");
  //       const rtcAnswer = new RTCSessionDescription(JSON.parse(answer));
  //       await pcRef.current?.setRemoteDescription(rtcAnswer);
  //     });

  //     /* MARK: RECEIVE CANDIDATE */
  //     connection.on("ReceiveIceCandidate", async (candidate: string) => {
  //       console.log("🔔 Received candidate");
  //       const rtcCandidate = new RTCIceCandidate(JSON.parse(candidate));
  //       await pcRef.current?.addIceCandidate(rtcCandidate);
  //     });

  //     /* MARK: CALL ENDED */
  //     connection.on("CallEnded", () => {
  //       console.log("🔔 Call ended");
  //       stopCamera();
  //     });

  //     setupListeners(connection, queryClient, info);
  //     connectionRef.current = connection;
  //   });

  //   // const connect = async () => {
  //   //   const connection = new HubConnectionBuilder()
  //   //     .withUrl(
  //   //       `${import.meta.env.VITE_ASPNETCORE_CHAT_URL}/ciaohub?userId=${info?.id}`,
  //   //     )
  //   //     .withAutomaticReconnect()
  //   //     .build();

  //   //   setupListeners(connection, queryClient, info);

  //   //   await connection.start();
  //   //   connectionRef.current = connection;
  //   //   console.log("✅ SignalR connected");
  //   // };

  //   // connect();

  //   return () => {
  //     console.log("Cleaning up SignalR connection");
  //     // if (connectionRef.current?.state === "Connected") {
  //     //   connectionRef.current.stop();
  //     // }
  //     // connectionRef.current = null;
  //   };
  // }, [info?.id]);

  // Setup firebase
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
        // Bridge: Firebase notification -> signalService classifier
        classifyNotification(notificationData, queryClient, info);
      },
    });

    return () => {
      console.log("Cleaning up Firebase connection");
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
