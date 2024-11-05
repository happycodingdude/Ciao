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

  const { data: info, isLoading, error, refetch } = useInfo();
  const { setLoading } = useLoading();

  useEffect(() => {
    // refetch();
  }, []);

  const { mutate: registerConnectionMutation } = useMutation({
    mutationFn: ({ token }) => registerConnection(token),
  });
  // Khi load được info -> đăng ký connection để nhận thông báo
  useEffect(() => {
    if (info?.data)
      requestPermission(
        registerConnectionMutation,
        notifyMessage,
        queryClient,
        info,
      );
  }, [info?.data]);

  if (isLoading) {
    // setLoading(true);
    return;
  }

  if (error?.response.status === 401) {
    // setLoading(false);
    return (
      <Authentication
        onSuccess={() => {
          setPage("chat");
        }}
      />
    );
  }

  // if (!info) return;
  // setLoading(false);

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
