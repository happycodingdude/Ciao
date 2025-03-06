import React from "react";
// import { notifyMessage, registerConnection } from "../../hook/NotificationAPIs";
// import { requestPermission } from "../../../components/Notification";
import { useEffect } from "react";
import ImageWithLightBoxAndNoLazy from "../components/ImageWithLightBoxAndNoLazy";
import RelightBackground from "../components/RelightBackground";
import Signout from "../features/authentication/components/Signout";
import useInfo from "../features/authentication/hooks/useInfo";
import ProfileIcon from "../features/profile-new/ProfileIcon";
import ChatIcon from "../features/sidebar/components/ChatIcon";
import Notification from "../features/sidebar/components/Notification";
import { SideBarProps } from "../types";
import blurImage from "../utils/blurImage";

const SideBar = (props: SideBarProps) => {
  // console.log("SideBar calling");
  const { page, setPage } = props;

  const { data: info } = useInfo();

  if (!info) return;

  useEffect(() => {
    blurImage(".sidebar-container");
  }, [info.avatar]);

  return (
    <section className="sidebar-container shrink-0 border-r-[.1rem] border-r-[var(--border-color)] phone:w-[4rem] tablet:w-[5rem] laptop:w-[7rem] desktop:w-[10rem]">
      <div className="flex h-full flex-col items-center px-[1rem] phone:py-[.5rem] tablet:py-[.7rem]">
        {/* <div className="flex w-full items-center justify-center laptop:h-[6rem]"> */}
        <ImageWithLightBoxAndNoLazy
          src={info.avatar}
          // className="cursor-pointer tablet:h-[3rem] tablet:w-[3rem] laptop:h-[4rem] laptop:w-[4rem]"
          className="h-[3.5rem] w-[3.5rem] cursor-pointer"
          slides={[
            {
              src: info.avatar,
            },
          ]}
        />
        {/* </div> */}
        <div className="inline-flex grow flex-col justify-between phone:py-[1rem] tablet:py-[1.5rem] laptop:py-[2.5rem]">
          <div className="flex w-full flex-col items-center gap-[3rem]">
            <RelightBackground
              lighten={page === "chat"}
              onClick={() => {
                setPage("chat");
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
          <div className="flex w-full flex-col items-center justify-between gap-[3rem]">
            <Notification />
            <Signout />
          </div>
        </div>
      </div>
    </section>
  );
};

export default SideBar;
