import React from "react";
// import { notifyMessage, registerConnection } from "../../hook/NotificationAPIs";
// import { requestPermission } from "../../../components/Notification";
import { useEffect } from "react";
import ImageWithLightBox from "../components/ImageWithLightBox";
import RelightBackground from "../components/RelightBackground";
import SignoutIcon from "../features/authentication/components/SignoutIcon";
import useInfo from "../features/authentication/hooks/useInfo";
import ProfileIcon from "../features/profile-new/ProfileIcon";
import ChatIcon from "../features/sidebar/components/ChatIcon";
import Notification from "../features/sidebar/components/Notification";
import blurImage from "../utils/blurImage";

const SideBar = (props) => {
  console.log("SideBar calling");
  const { page, setPage } = props;

  const { data: info } = useInfo();

  if (!info) return;

  useEffect(() => {
    blurImage(".sidebar-container");
  }, [info.avatar]);

  return (
    <section className="sidebar-container shrink-0 border-r-[.1rem] border-r-[var(--border-color)] laptop:w-[7rem] desktop:w-[10rem]">
      <div className="flex h-full flex-col items-center px-[1rem]">
        <div className="flex w-full items-center justify-center laptop:h-[6rem]">
          <ImageWithLightBox
            src={info.avatar}
            className="cursor-pointer !rounded-full laptop:!h-[4rem] laptop:!w-[4rem]"
            slides={[
              {
                src: info.avatar,
              },
            ]}
            imageClassName="bg-[size:160%]"
            roundedClassName="rounded-full"
          />
        </div>
        <div className="inline-flex grow flex-col justify-between py-[2.5rem]">
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
            <SignoutIcon />
          </div>
        </div>
      </div>
    </section>
  );
};

export default SideBar;
