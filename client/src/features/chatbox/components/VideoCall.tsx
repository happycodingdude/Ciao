import { HubConnection, HubConnectionBuilder } from "@microsoft/signalr";
import React, { useEffect, useRef, useState } from "react";

const servers = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" }, // STUN for NAT traversal
  ],
};

type Props = {
  userId: string; // Your own ID
  targetUserId: string; // The user you want to call
};

const VideoCall: React.FC<Props> = ({ userId, targetUserId }) => {
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const connectionRef = useRef<HubConnection | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const isRegistered = useRef<boolean>(false);

  // 🔌 SignalR + WebRTC setup
  useEffect(() => {
    if (!isRegistered.current) {
      isRegistered.current = true;

      const connect = async () => {
        const connection = new HubConnectionBuilder()
          .withUrl(
            `${import.meta.env.VITE_ASPNETCORE_CHAT_URL}/ciaohub?userId=${userId}`,
          )
          .withAutomaticReconnect()
          .build();

        connection.on("ReceiveOffer", async (fromId: string, offer: string) => {
          console.log("Received offer");
          await setupPeerConnection(fromId);

          const rtcOffer = new RTCSessionDescription(JSON.parse(offer));
          await pcRef.current?.setRemoteDescription(rtcOffer);

          const answer = await pcRef.current?.createAnswer();
          await pcRef.current?.setLocalDescription(answer!);

          connection.send("SendAnswer", fromId, JSON.stringify(answer));
        });

        connection.on(
          "ReceiveAnswer",
          async (_fromId: string, answer: string) => {
            console.log("Received answer");
            const rtcAnswer = new RTCSessionDescription(JSON.parse(answer));
            await pcRef.current?.setRemoteDescription(rtcAnswer);
          },
        );

        connection.on(
          "ReceiveIceCandidate",
          async (_fromId: string, candidate: string) => {
            console.log("Received ICE candidate");
            const rtcCandidate = new RTCIceCandidate(JSON.parse(candidate));
            await pcRef.current?.addIceCandidate(rtcCandidate);
          },
        );

        await connection.start();
        connectionRef.current = connection;
        console.log("SignalR connected");
      };

      connect();
    }
  }, [userId]);

  // 🎥 Get local stream
  const startLocalVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      const remoteStream = new MediaStream();

      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      //   localStream.getTracks().forEach((track) => {
      //     pcRef.current?.addTrack(track, localStream);
      //   });

      pcRef.current.ontrack = (event) => {
        event.streams[0].getTracks().forEach((track) => {
          remoteStream.addTrack(track);
        });
      };
      remoteVideoRef.current.srcObject = remoteStream;
    } catch (err) {
      console.error("Failed to access camera/mic:", err);
      alert(
        "Unable to start video. Make sure camera is available and permissions are allowed.",
      );
    }
  };

  // 📞 Start call
  const callUser = async () => {
    await setupPeerConnection(targetUserId, true);

    localStream?.getTracks().forEach((track) => {
      console.log("add track");

      pcRef.current?.addTrack(track, localStream);
    });

    const offer = await pcRef.current?.createOffer();
    await pcRef.current?.setLocalDescription(offer!);

    connectionRef.current?.send(
      "SendOffer",
      targetUserId,
      JSON.stringify(offer),
    );
  };

  // 🧠 Setup PeerConnection + handlers
  const setupPeerConnection = async (
    targetId: string,
    skipTrackAdding = false,
  ) => {
    pcRef.current = new RTCPeerConnection(servers);

    pcRef.current.onicecandidate = (e) => {
      if (e.candidate) {
        connectionRef.current?.send(
          "SendIceCandidate",
          targetId,
          JSON.stringify(e.candidate),
        );
      }
    };

    pcRef.current.ontrack = (e) => {
      if (remoteVideoRef.current) {
        console.log("ontrack calling");

        remoteVideoRef.current.srcObject = e.streams[0];
      }
    };

    // if (localStream) {
    //   localStream.getTracks().forEach((track) => {
    //     pcRef.current?.addTrack(track, localStream);
    //   });
    // }
  };

  return (
    <div style={{ textAlign: "center", padding: "1rem" }}>
      <h2>React Video Call</h2>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "20px",
          marginBottom: "20px",
        }}
      >
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          width={300}
          height={200}
        />
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          width={300}
          height={200}
        />
      </div>

      <button onClick={startLocalVideo}>Start Camera</button>
      <button onClick={callUser} style={{ marginLeft: "1rem" }}>
        Call {targetUserId}
      </button>
    </div>
  );
};

export default VideoCall;
