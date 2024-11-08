import { useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useRef, useState } from "react";
import { useFriend, useInfo } from "../../hook/CustomHooks";
import { notifyMessage, registerConnection } from "../../hook/NotificationAPIs";
import { requestPermission } from "../common/Notification";
import ProfileSection from "../profile-new/ProfileSection";
import SideBar from "../sidebar/SideBar";
import { ChatSection } from "./ChatSection";

export const Home = () => {
  console.log("Home calling");

  const queryClient = useQueryClient();

  const { data: info } = useInfo();
  const { refetch: refetchFriend } = useFriend();

  const isRegistered = useRef(false);

  const [page, setPage] = useState("chat");

  const { mutate: registerConnectionMutation } = useMutation({
    mutationFn: ({ token }) => registerConnection(token),
  });

  // Khi load được info -> đăng ký connection để nhận thông báo
  useEffect(() => {
    if (info && !isRegistered.current) {
      isRegistered.current = true;
      requestPermission(
        registerConnectionMutation,
        notifyMessage,
        queryClient,
        info,
      );
      refetchFriend();
    }
  }, [info]);

  return (
    <div
      id="home"
      // className="relative w-full text-[clamp(1.5rem,1.2vw,2.5rem)] text-[var(--text-main-color-light)]"
      className="relative w-full text-[var(--text-main-color-light)] laptop:text-sm desktop:text-md"
    >
      <div className="home-container absolute flex h-full w-full bg-[var(--bg-color-thin)]">
        <SideBar page={page} setPage={setPage} />
        {
          {
            chat: <ChatSection />,
            profile: <ProfileSection />,
          }[page]
        }
      </div>
      <div id="portal"></div>
    </div>
  );
};
