import React from "react";
// import { notifyMessage, registerConnection } from "../../hook/NotificationAPIs";
import Signout from "../authentication/Signout";
import ChatIcon from "../chat/ChatIcon";
// import { requestPermission } from "../common/Notification";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { blurImage } from "../../common/Utility";
import { useConversation, useInfo } from "../../hook/CustomHooks";
import ImageWithLightBoxWithShadowAndNoLazy from "../common/ImageWithLightBoxWithShadowAndNoLazy";
import RelightBackground from "../common/RelightBackground";
import ProfileIcon from "../profile-new/ProfileIcon";
import Notification from "./Notification";

const SideBar = (props) => {
  console.log("SideBar calling");
  const { page, setPage } = props;

  const queryClient = useQueryClient();

  const { data: info } = useInfo();
  const { refetch } = useConversation(1);

  useEffect(() => {
    blurImage(".info-container");
  }, [info.data.avatar]);

  return (
    <section className="shrink-0 bg-[var(--bg-color)] laptop:w-[7rem]">
      {/* <section className="w-full max-w-[7%] shrink-0 bg-[var(--main-color-bold)]"> */}
      <div className="flex h-full flex-col items-center justify-between px-[1rem] py-[2rem]">
        <div className="info-container flex w-full flex-col items-center gap-[3rem]">
          <ImageWithLightBoxWithShadowAndNoLazy
            src={info.data.avatar ?? ""}
            className="aspect-square w-[80%] cursor-pointer rounded-[50%]"
            slides={[
              {
                src: info.data.avatar ?? "",
              },
            ]}
          />
          <RelightBackground className="w-[50%]" lighten={page === "chat"}>
            <ChatIcon
              show={() => {
                refetch();
                setPage("chat");
              }}
            />
          </RelightBackground>
          <RelightBackground className="w-[50%]" lighten={page === "profile"}>
            <ProfileIcon
              show={() => {
                queryClient.resetQueries({
                  queryKey: ["message"],
                  exact: true,
                });
                setPage("profile");
              }}
            />
          </RelightBackground>
        </div>
        <div className="flex w-full flex-col items-center justify-between gap-[3rem]">
          <RelightBackground className="relative w-[50%]">
            <Notification />
          </RelightBackground>
          <RelightBackground className="w-[50%]">
            <Signout />
          </RelightBackground>
        </div>
      </div>
    </section>
  );
};

export default SideBar;
