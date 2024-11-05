import React from "react";
// import { notifyMessage, registerConnection } from "../../hook/NotificationAPIs";
import Signout from "../authentication/Signout";
import ChatIcon from "../chat/ChatIcon";
// import { requestPermission } from "../common/Notification";
import { useEffect } from "react";
import { blurImage } from "../../common/Utility";
import { useInfo } from "../../hook/CustomHooks";
import ImageWithLightBoxWithShadowAndNoLazy from "../common/ImageWithLightBoxWithShadowAndNoLazy";
import RelightBackground from "../common/RelightBackground";
import ProfileIcon from "../profile-new/ProfileIcon";
import Notification from "./Notification";

const SideBar = (props) => {
  console.log("SideBar calling");
  const { page, setPage } = props;

  const { data: info } = useInfo();

  useEffect(() => {
    blurImage(".info-container");
  }, [info?.avatar]);

  return (
    <section className="lg shrink-0 bg-[var(--bg-color)] laptop:w-[7rem] desktop:w-[10rem]">
      <div className="flex h-full flex-col items-center justify-between px-[1rem] py-[2rem]">
        <div className="info-container flex w-full flex-col items-center gap-[3rem]">
          <ImageWithLightBoxWithShadowAndNoLazy
            src={info?.avatar}
            className="aspect-square w-[80%] cursor-pointer rounded-[50%]"
            slides={[
              {
                src: info?.avatar,
              },
            ]}
          />
          <RelightBackground
            lighten={page === "chat"}
            onClick={() => {
              // refetch();
              setPage("chat");
            }}
          >
            <ChatIcon />
          </RelightBackground>
          <RelightBackground
            lighten={page === "profile"}
            onClick={() => {
              // queryClient.resetQueries({
              //   queryKey: ["conversation"],
              //   exact: true,
              // });
              // queryClient.resetQueries({
              //   queryKey: ["message"],
              //   exact: true,
              // });
              setPage("profile");
            }}
          >
            <ProfileIcon />
          </RelightBackground>
        </div>
        <div className="flex w-full flex-col items-center justify-between gap-[3rem]">
          {/* <RelightBackground className="relative w-[50%]"> */}
          <Notification />
          {/* </RelightBackground> */}
          {/* <RelightBackground className="w-[50%]"> */}
          <Signout />
          {/* </RelightBackground> */}
        </div>
      </div>
    </section>
  );
};

export default SideBar;
