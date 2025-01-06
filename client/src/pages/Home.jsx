import { useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { requestPermission } from "../components/Notification";
import useInfo from "../features/authentication/hooks/useInfo";
import useFriend from "../features/friend/hooks/useFriend";
import notifyMessage from "../features/notification/services/notifyMessage";
import registerConnection from "../features/notification/services/registerConnection";
import ProfileSection from "../features/profile-new/ProfileSection";
import ChatSection from "../layouts/ChatSection";
import SideBar from "../layouts/SideBar";

const Home = () => {
  console.log("Home calling");

  const queryClient = useQueryClient();

  const { data: info } = useInfo();
  const { data: friends } = useFriend();

  // const isRegistered = useRef(false);

  const [page, setPage] = useState("chat");

  const { mutate: registerConnectionMutation } = useMutation({
    mutationFn: ({ token }) => registerConnection(token),
    onSuccess: () => {
      setIsRegistered(true);
    },
  });

  // Khi load được info -> đăng ký connection để nhận thông báo
  useEffect(() => {
    if (!info) return;
    // setUserId(info.id);
    // refetchFriend();
    const isRegistered = localStorage.getItem("isRegistered");
    if (!isRegistered) {
      localStorage.setItem("isRegistered", true);
      requestPermission(
        registerConnectionMutation,
        notifyMessage,
        queryClient,
        info,
      );
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
