import React from "react";
// import { notifyMessage, registerConnection } from "../../hook/NotificationAPIs";
import Signout from "../authentication/Signout";
import ChatIcon from "../chat/ChatIcon";
// import { requestPermission } from "../common/Notification";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { blurImage } from "../../common/Utility";
import { useInfo } from "../../hook/CustomHooks";
import ImageWithLightBox from "../common/ImageWithLightBox";
import RelightBackground from "../common/RelightBackground";
import ProfileIcon from "../profile-new/ProfileIcon";
import Notification from "./Notification";

const SideBar = (props) => {
  console.log("SideBar calling");
  const { page, setPage } = props;

  const queryClient = useQueryClient();

  const { data: info } = useInfo();

  if (!info) return null;

  useEffect(() => {
    blurImage(".sidebar-container");
  }, [info.avatar]);

  return (
    <section className="sidebar-container shrink-0 border-r-[.1rem] border-r-[var(--border-color)] laptop:w-[7rem] desktop:w-[10rem]">
      <div className="flex h-full flex-col items-center px-[1rem]">
        <div className="flex w-full items-center justify-center laptop:h-[6rem]">
          {/* <ImageWithLightBoxWithShadowAndNoLazy
            src={info.avatar}
            className="aspect-square w-[80%] cursor-pointer rounded-[50%]"
            slides={[
              {
                src: info.avatar,
              },
            ]}
          /> */}
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
                // refetch();
                setPage("chat");
                queryClient.setQueryData(["conversation"], (oldData) => {
                  return {
                    ...oldData,
                    fromEditProfile: true,
                  };
                });
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
      </div>
    </section>
  );
};

export default SideBar;
