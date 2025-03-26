import { HubConnection, HubConnectionBuilder } from "@microsoft/signalr";
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import useInfo from "../features/authentication/hooks/useInfo";

type SignalContextType = {
  startCall: (targetUserId: string) => void;
  stopCall: () => void;
  startLocalStream: () => any;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  newCall: boolean;
  // onOffer: (callerId: string, offer: string) => void;
};

const SignalContext = createContext<SignalContextType | undefined>(undefined);

export const SignalProvider: React.FC<{
  userId: string;
  children: React.ReactNode;
}> = ({ userId, children }) => {
  const { data: info } = useInfo();
  // const [isConnected, setIsConnected] = useState(false);
  // const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [newCall, setNewCall] = useState<boolean>(false);

  const connectionRef = useRef<HubConnection | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const remoteUserIdRef = useRef<string | null>(null);
  const isRegistered = useRef<boolean>(false);

  const iceServers = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  };

  // 🎥 Local camera setup
  const startLocalStream = async (): Promise<MediaStream> => {
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
    // setLocalStream(stream);
    stream.getTracks().forEach((track) => {
      pcRef.current?.addTrack(track, stream);
    });
    return stream;
  };

  // 📡 Setup peer connection
  const setupPeerConnection = async (
    remoteUserId: string,
    // skipTrackAdding = false,
  ) => {
    pcRef.current = new RTCPeerConnection(iceServers);
    remoteUserIdRef.current = remoteUserId;

    const remoteStream = new MediaStream();
    setRemoteStream(remoteStream);

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
      console.log(e);

      const vid: any = document.getElementById("remoteVideo");
      vid.srcObject = e.streams[0];

      // event.streams[0]
      //   .getTracks()
      //   .forEach((track) => remoteStream.addTrack(track));
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

  // ☎️ Call target user
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

  // 🔕 Stop call
  const stopCall = () => {
    localStreamRef.current.getTracks().forEach((track) => track.stop());
    pcRef.current?.close();
    pcRef.current = null;
    // setLocalStream(null);
    setRemoteStream(null);

    const remoteUserId = remoteUserIdRef.current;
    if (remoteUserId && connectionRef.current?.state === "Connected") {
      connectionRef.current.send("EndCall", remoteUserId);
    }
  };

  // 🔌 SignalR setup
  useEffect(() => {
    if (!userId || isRegistered.current) return;
    isRegistered.current = true;

    const connect = async () => {
      const connection = new HubConnectionBuilder()
        .withUrl(
          `${import.meta.env.VITE_ASPNETCORE_CHAT_URL}/ciaohub?userId=${userId}`,
        )
        .withAutomaticReconnect()
        .build();

      connection.on("ReceiveOffer", async (callerId: string, offer: string) => {
        console.log("🔔 Received offer");
        setNewCall(true);

        setTimeout(async () => {
          // await startLocalStream();
          await setupPeerConnection(callerId);

          const rtcOffer = new RTCSessionDescription(JSON.parse(offer));
          await pcRef.current?.setRemoteDescription(rtcOffer);

          const answer = await pcRef.current?.createAnswer();
          await pcRef.current?.setLocalDescription(answer!);
          connection.send("SendAnswer", callerId, JSON.stringify(answer));
        }, 1000);
      });

      connection.on("ReceiveAnswer", async (answer: string) => {
        console.log("🔔 Received answer");
        const rtcAnswer = new RTCSessionDescription(JSON.parse(answer));
        await pcRef.current?.setRemoteDescription(rtcAnswer);
      });

      connection.on("ReceiveIceCandidate", async (candidate: string) => {
        console.log("🔔 Received candidate");
        const rtcCandidate = new RTCIceCandidate(JSON.parse(candidate));
        await pcRef.current?.addIceCandidate(rtcCandidate);
      });

      connection.on("CallEnded", () => {
        stopCall();
      });

      await connection.start();
      connectionRef.current = connection;
      // setIsConnected(true);
      console.log("✅ SignalR connected");
    };

    connect();
  }, [userId]);

  return (
    <SignalContext.Provider
      value={{
        startCall,
        stopCall,
        startLocalStream,
        localStream: localStreamRef.current,
        remoteStream,
        newCall,
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
