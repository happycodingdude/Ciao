import { useQueryClient } from "@tanstack/react-query";
import React, { useEffect } from "react";
import ImageWithLightBoxAndNoLazy from "../components/ImageWithLightBoxAndNoLazy";
import RelightBackground from "../components/RelightBackground";
import Signout from "../features/authentication/components/Signout";
import useInfo from "../features/authentication/hooks/useInfo";
import ProfileIcon from "../features/profile-new/ProfileIcon";
import ChatIcon from "../features/sidebar/components/ChatIcon";
import Notification from "../features/sidebar/components/Notification";
import { SideBarProps } from "../types";
import blurImage from "../utils/blurImage";

const SideBarMenu = (props: SideBarProps) => {
  // console.log("SideBar calling");
  const { page, setPage } = props;

  const queryClient = useQueryClient();
  const { data: info } = useInfo();

  if (!info) return;

  useEffect(() => {
    blurImage(".sidebar-container");
  }, [info.avatar]);

  return (
    <>
      <ImageWithLightBoxAndNoLazy
        src={info.avatar}
        className="h-[4rem] w-[4rem] cursor-pointer"
        slides={[
          {
            src: info.avatar,
          },
        ]}
      />

      <div className="inline-flex grow flex-col justify-between py-[3rem]">
        <div className="flex w-full flex-col items-center gap-[2rem]">
          <RelightBackground
            lighten={page === "chat"}
            onClick={() => {
              setPage("chat");
              // if (isPhoneScreen())
              //   queryClient.setQueryData(
              //     ["conversation"],
              //     (oldData: ConversationCache) => {
              //       return {
              //         ...oldData,
              //         selected: null,
              //       } as ConversationCache;
              //     },
              //   );
              // queryClient.setQueryData(["message"], (oldData) => {
              //   return null;
              // });
              // queryClient.setQueryData(["attachment"], (oldData) => {
              //   return null;
              // });
            }}
          >
            <ChatIcon />
          </RelightBackground>
          <RelightBackground
            lighten={page === "profile"}
            onClick={() => {
              setPage("profile");
            }}
          >
            <ProfileIcon />
          </RelightBackground>
        </div>
        <div className="flex w-full flex-col items-center gap-[2rem]">
          <Notification />
          <Signout />
        </div>
      </div>
    </>
  );
};

export default SideBarMenu;
