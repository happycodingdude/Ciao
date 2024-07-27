import { useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useRef, useState } from "react";
import { useInfo, useLoading } from "../../hook/CustomHooks";
import { notifyMessage, registerConnection } from "../../hook/NotificationAPIs";
import Authentication from "../authentication/Authentication";
import { requestPermission } from "../common/Notification";
import ProfileSection from "../profile-new/ProfileSection";
import SideBar from "../sidebar/SideBar";
import { ChatSection } from "./ChatSection";

export const Home = () => {
  console.log("Home calling");

  const queryClient = useQueryClient();

  const refListChat = useRef();
  const refChatbox = useRef();

  const [page, setPage] = useState("chat");
  // const [backToLogin, setBackToLogin] = useState(false);

  const { data: info, isLoading } = useInfo();
  const { setLoading } = useLoading();

  const { mutate: registerConnectionMutation } = useMutation({
    mutationFn: ({ token }) => registerConnection(token),
  });
  // Khi load được info -> đăng ký connection để nhận noti
  useEffect(() => {
    if (info?.data)
      requestPermission(registerConnectionMutation, notifyMessage, queryClient);
  }, [info?.data?.id]);

  if (isLoading) {
    setLoading(true);
    return;
  }

  // When clear cache
  if (
    info.response?.status === 401 &&
    !localStorage.getItem("token") &&
    !localStorage.getItem("refresh")
  ) {
    setLoading(false);
    return <Authentication />;
  }

  // if (isFetching) {
  //   console.log("isFetching");
  // }

  // if (isRefetching) {
  //   console.log("isRefetching");
  // }

  // if (backToLogin) {
  //   setLoading(false);
  //   return <Authentication />;
  // }

  // if (info.data) {
  //   console.log("info ready");
  //   //requestPermission(registerConnectionMutation, notifyMessage);
  // }
  setLoading(false);

  // useEffect(() => {
  //   if (!auth.valid) return;

  //   reFetchFriends();
  //   requestPermission(registerConnection, notifyMessage);

  //   // listenNotification((message) => {
  //   //   console.log("Home receive message from worker");
  //   //   const messageData = JSON.parse(message.data);
  //   //   switch (message.event) {
  //   //     case "AddMember":
  //   //       console.log(messageData);
  //   //       break;
  //   //     default:
  //   //       break;
  //   //   }
  //   // });
  //   // return () => {
  //   //   controller.abort();
  //   // };
  // }, [auth.valid]);

  return (
    <div
      id="home"
      className="relative w-full text-[clamp(1.5rem,1.2vw,2.5rem)]"
    >
      <div className="home-container absolute flex h-full w-full bg-gradient-to-r from-[var(--main-color-thin)] to-blue-100">
        <SideBar page={page} setPage={setPage} />
        {
          {
            chat: (
              <ChatSection refListChat={refListChat} refChatbox={refChatbox} />
            ),
            profile: <ProfileSection />,
          }[page]
        }
      </div>
      <div id="portal"></div>
    </div>
  );
};
