import { useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useRef, useState } from "react";
import { requestPermission } from "../components/Notification";
import useInfo from "../features/authentication/hooks/useInfo";
import useFriend from "../features/friend/hooks/useFriend";
import notifyMessage from "../features/notification/services/notifyMessage";
import registerConnection from "../features/notification/services/registerConnection";
import ProfileSection from "../features/profile-new/ProfileSection";
import useLocalStorage from "../hooks/useLocalStorage";
import ChatSection from "../layouts/ChatSection";
import SideBar from "../layouts/SideBar";

const Home = () => {
  console.log("Home calling");

  const queryClient = useQueryClient();

  const [userId, setUserId] = useLocalStorage("userId");
  const { data: info } = useInfo();
  const { refetch: refetchFriend } = useFriend();

  const isRegistered = useRef(false);

  const [page, setPage] = useState("chat");

  const { mutate: registerConnectionMutation } = useMutation({
    mutationFn: ({ token }) => registerConnection(token),
  });

  // Khi load được info -> đăng ký connection để nhận thông báo
  useEffect(() => {
    if (info) {
      setUserId(info.id);
      refetchFriend();
      if (!isRegistered.current) {
        isRegistered.current = true;
        requestPermission(
          registerConnectionMutation,
          notifyMessage,
          queryClient,
          info,
        );
      }
    }
  }, [info]);

  return (
    <div
      id="home"
      // className="relative w-full text-[clamp(1.5rem,1.2vw,2.5rem)] text-[var(--text-main-color-light)]"
      className="relative w-full text-[var(--text-main-color-light)] laptop:text-sm desktop:text-md"
    >
      <div className="home-container absolute flex h-full w-full bg-[var(--bg-color)]">
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

export default Home;
