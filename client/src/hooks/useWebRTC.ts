import { HubConnection } from "@microsoft/signalr";
import { MutableRefObject, useRef, useState } from "react";
import { UserProfile } from "../types/base.types";

const ICE_SERVERS = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };

export const useWebRTC = (
  connectionRef: MutableRefObject<HubConnection | null>,
  selfId?: string,
) => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [targetUser, setTargetUser] = useState<UserProfile | null>(null);
  const [isCaller, setIsCaller] = useState(false);
  const [receiveOffer, setReceiveOffer] = useState(false);
  const [offer, setOffer] = useState<string | null>(null);

  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);

  const startLocalStream = async (target: UserProfile) => {
    try {
      setTargetUser(target);
      setIsCaller(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      setLocalStream(stream);
    } catch (error) {
      // Người dùng từ chối quyền camera/mic hoặc thiết bị không hỗ trợ
      console.error("Error accessing media devices.", error);
    }
  };

  const setupPeerConnection = async (remoteUserId: string) => {
    pcRef.current = new RTCPeerConnection(ICE_SERVERS);

    pcRef.current.onicecandidate = (e) => {
      // Chỉ gửi candidate khi có giá trị (null candidate = quá trình gathering kết thúc)
      if (e.candidate) {
        connectionRef.current?.send(
          "SendIceCandidate",
          remoteUserId,
          JSON.stringify(e.candidate),
        );
      }
    };

    pcRef.current.ontrack = (e) => {
      // Nhận được media stream từ remote peer → hiển thị video call
      remoteStreamRef.current = e.streams[0];
      setRemoteStream(e.streams[0]);
      // Sau khi nhận stream → không còn là caller nữa (bắt đầu call 2 chiều)
      setIsCaller(false);
    };

    // Thêm các track của local stream vào peer connection để gửi đi
    localStreamRef.current?.getTracks().forEach((track) => {
      pcRef.current?.addTrack(track, localStreamRef.current!);
    });
  };

  const startCall = async () => {
    // Không thể bắt đầu call nếu chưa chọn người nhận
    if (!targetUser?.id) return;

    await setupPeerConnection(targetUser.id);
    const sdpOffer = await pcRef.current?.createOffer();
    await pcRef.current?.setLocalDescription(sdpOffer!);
    connectionRef.current?.send("SendOffer", targetUser.id, selfId, JSON.stringify(sdpOffer));
    // Reset isCaller về false sau khi gửi offer (remote peer sẽ set lại khi nhận stream)
    setIsCaller(false);
  };

  const answerCall = async () => {
    // Cần có offer và targetUser mới trả lời được
    if (!offer || !targetUser) return;

    setReceiveOffer(false);
    // Parse và set remote description từ offer của caller
    const rtcOffer = new RTCSessionDescription(JSON.parse(offer));
    await pcRef.current?.setRemoteDescription(rtcOffer);
    const answer = await pcRef.current?.createAnswer();
    await pcRef.current?.setLocalDescription(answer!);
    connectionRef.current?.send("SendAnswer", targetUser.id, JSON.stringify(answer));
  };

  const stopCamera = () => {
    // Dừng tất cả media tracks để giải phóng camera/mic
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    remoteStreamRef.current?.getTracks().forEach((t) => t.stop());
    // Xóa tracks khỏi peer connection trước khi đóng
    pcRef.current?.getSenders().forEach((s) => pcRef.current?.removeTrack(s));
    pcRef.current?.close();
    pcRef.current = null;
    // Reset toàn bộ state về trạng thái ban đầu
    setLocalStream(null);
    setRemoteStream(null);
    setTargetUser(null);
    setReceiveOffer(false);
    setOffer(null);
    setIsCaller(false);
  };

  const stopCall = () => {
    stopCamera();
    // Chỉ gửi tín hiệu kết thúc nếu connection còn tồn tại và biết id người kia
    if (connectionRef.current && targetUser?.id) {
      connectionRef.current.send("EndCall", targetUser.id);
    }
  };

  return {
    localStream,
    remoteStream,
    targetUser,
    isCaller,
    receiveOffer,
    offer,
    setOffer,
    setReceiveOffer,
    setTargetUser,
    pcRef,
    startLocalStream,
    startCall,
    answerCall,
    stopCall,
  };
};
