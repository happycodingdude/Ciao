import { HubConnection } from "@microsoft/signalr";
import { useQueryClient } from "@tanstack/react-query";
import React, { createContext, useContext, useEffect, useRef } from "react";
import useInfo from "../hooks/useInfo";
import { useWebRTC } from "../hooks/useWebRTC";
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
  // Ném lỗi rõ ràng nếu hook được dùng ngoài provider để debug dễ hơn
  if (!ctx) throw new Error("useSignal must be used inside SignalProvider");
  return ctx;
};

export const SignalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: info } = useInfo();
  const queryClient = useQueryClient();
  const connectionRef = useRef<HubConnection | null>(null);

  const {
    localStream,
    remoteStream,
    targetUser,
    isCaller,
    receiveOffer,
    startLocalStream,
    startCall,
    answerCall,
    stopCall,
  } = useWebRTC(connectionRef, info?.id);

  const stopConnection = async () => {
    // Chỉ stop nếu connection đang thực sự Connected (tránh lỗi khi gọi stop trên connection đã đóng)
    if (connectionRef.current?.state === "Connected") {
      await connectionRef.current.stop();
    }
  };

  useEffect(() => {
    // Chờ đến khi có info.id mới đăng ký notification (user chưa login → không đăng ký)
    if (!info?.id) return;

    let isMounted = true;

    requestPermission({
      registerConnection: async (token: string) => {
        // Kiểm tra isMounted để tránh update state sau khi component unmount
        if (!isMounted) return;
        await registerConnection(token);
      },
      onNotification: (notificationData: any) => {
        // Bỏ qua notification đến sau khi component đã unmount
        if (!isMounted) return;
        classifyNotification(notificationData, queryClient, info);
      },
    });

    return () => { isMounted = false; };
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
