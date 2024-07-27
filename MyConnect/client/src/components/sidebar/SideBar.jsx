import React from "react";
// import { notifyMessage, registerConnection } from "../../hook/NotificationAPIs";
import Signout from "../authentication/Signout";
import ChatIcon from "../chat/ChatIcon";
import ImageWithLightBoxWithBorderAndShadow from "../common/ImageWithLightBoxWithBorderAndShadow";
// import { requestPermission } from "../common/Notification";
import { useQueryClient } from "@tanstack/react-query";
import { useConversation, useInfo } from "../../hook/CustomHooks";
import ProfileIcon from "../profile-new/ProfileIcon";
import Notification from "./Notification";

const SideBar = (props) => {
  console.log("SideBar calling");
  const { page, setPage } = props;

  const queryClient = useQueryClient();

  const { data: info } = useInfo();
  const { refetch } = useConversation();

  return (
    <section className="w-full max-w-[7%] shrink-0 bg-[var(--bg-color)]">
      <div className="flex h-full flex-col items-center justify-between px-[1rem] py-[2rem]">
        <div className="flex w-full flex-col items-center gap-[3rem]">
          <ImageWithLightBoxWithBorderAndShadow
            src={info.data.avatar ?? ""}
            className="aspect-square w-[80%] cursor-pointer rounded-[50%]"
            slides={[
              {
                src: info.data.avatar ?? "",
              },
            ]}
          />
          <ChatIcon
            show={() => {
              refetch();
              setPage("chat");
            }}
            focus={page === "chat"}
          />
          <ProfileIcon
            show={() => {
              queryClient.resetQueries({ queryKey: ["message"], exact: true });
              setPage("profile");
            }}
            focus={page === "profile"}
          />
        </div>
        <div className="flex flex-col gap-[3rem]">
          <Notification />
          <Signout className="text-xl font-thin" />
        </div>
      </div>
    </section>
  );
};

export default SideBar;
