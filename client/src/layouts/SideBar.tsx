import React from "react";
// import { notifyMessage, registerConnection } from "../../hook/NotificationAPIs";
// import { requestPermission } from "../../../components/Notification";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import ImageWithLightBoxAndNoLazy from "../components/ImageWithLightBoxAndNoLazy";
import RelightBackground from "../components/RelightBackground";
import Signout from "../features/authentication/components/Signout";
import useInfo from "../features/authentication/hooks/useInfo";
import { ConversationCache } from "../features/listchat/types";
import ProfileIcon from "../features/profile-new/ProfileIcon";
import ChatIcon from "../features/sidebar/components/ChatIcon";
import Notification from "../features/sidebar/components/Notification";
import { SideBarProps } from "../types";
import blurImage from "../utils/blurImage";
import { isPhoneScreen } from "../utils/getScreenSize";

const SideBar = (props: SideBarProps) => {
  // console.log("SideBar calling");
  const { page, setPage } = props;

  const queryClient = useQueryClient();
  const { data: info } = useInfo();

  if (!info) return;

  useEffect(() => {
    blurImage(".sidebar-container");
  }, [info.avatar]);

  return (
    <section className="sidebar-container shrink-0 border-r-[.1rem] border-r-[var(--border-color)] phone:w-[7rem] desktop:w-[10rem]">
      <div className="flex h-full flex-col items-center px-[1rem] pt-[1rem]">
        {/* <div className="flex w-full items-center justify-center laptop:h-[6rem]"> */}
        <ImageWithLightBoxAndNoLazy
          src={info.avatar}
          className="h-[4rem] w-[4rem] cursor-pointer"
          // className="h-[3.5rem] w-[3.5rem] cursor-pointer"
          slides={[
            {
              src: info.avatar,
            },
          ]}
        />
        {/* </div> */}
        <div className="inline-flex grow flex-col justify-between py-[3rem]">
          <div className="flex w-full flex-col items-center gap-[2rem]">
            <RelightBackground
              lighten={page === "chat"}
              onClick={() => {
                setPage("chat");
                if (isPhoneScreen())
                  queryClient.setQueryData(
                    ["conversation"],
                    (oldData: ConversationCache) => {
                      return {
                        ...oldData,
                        selected: null,
                      } as ConversationCache;
                    },
                  );
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
      </div>
    </section>
  );
};

export default SideBar;
