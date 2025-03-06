import { useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useRef, useState } from "react";
import useInfo from "../features/authentication/hooks/useInfo";
// import ProfileSection from "../features/profile-new/ProfileSection";
// import ChatSection from "../layouts/ChatSection";
import { lazy } from "react";
import useFriend from "../features/friend/hooks/useFriend";
import registerConnection from "../features/notification/services/registerConnection";
import { startConnection } from "../features/notification/services/signalService";
import SideBar from "../layouts/SideBar";

const ChatSection = lazy(() => import("../layouts/ChatSection"));
const ProfileSection = lazy(
  () => import("../features/profile-new/ProfileSection"),
);

const Home = () => {
  // console.log("Home calling");

  const queryClient = useQueryClient();

  const { data: info } = useInfo();
  useFriend();

  const isRegistered = useRef<boolean>(false);

  const [page, setPage] = useState<string>("chat");

  const { mutate: registerConnectionMutation } = useMutation({
    mutationFn: (token: string) => registerConnection(token),
  });

  // Khi load được info -> đăng ký connection để nhận thông báo
  useEffect(() => {
    if (!info) return;
    // const isRegistered = localStorage.getItem("isRegistered");
    // if (!isRegistered || isRegistered === "false") {
    //   localStorage.setItem("isRegistered", "true");
    // if (!isRegistered.current) {
    //   isRegistered.current = true;
    //   const request: RequestPermission = {
    //     registerConnection: registerConnectionMutation,
    //     notifyMessage: notifyMessage,
    //     queryClient: queryClient,
    //     info: info,
    //   };
    //   requestPermission(request);
    // }
    // setupMessageListener(queryClient, info);

    if (!isRegistered.current) {
      isRegistered.current = true;
      startConnection(info.id, queryClient, info);
      // onMessageReceived((user: string, message: string) => {
      //   console.log(message);
      // });
    }
  }, [info]);

  //   {"arguments":["Test message", "target":"Notify"]}

  //   {
  //     "protocol": "json",
  //     "version": 1
  // }

  if (!info) return;

  return (
    <div
      id="home"
      // className="relative w-full text-[clamp(1.5rem,1.2vw,2.5rem)] text-[var(--text-main-color-light)]"
      className="relative w-full text-[var(--text-main-color-light)] phone:text-xs tablet:text-xs laptop:text-sm desktop:text-md"
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
