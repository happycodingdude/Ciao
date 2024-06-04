import React, { useState } from "react";
import { NotificationProvider } from "../../context/NotificationContext";
import { useAuth } from "../../hook/CustomHooks";
import Signout from "../authentication/Signout";
import ChatIcon from "../chat/ChatIcon";
import ImageWithLightBoxWithBorderAndShadow from "../common/ImageWithLightBoxWithBorderAndShadow";
import ProfileIcon from "../profile-new/ProfileIcon";
import Notification from "./Notification";

const SideBar = (props) => {
  const { showChat, showProfile } = props;
  const { user } = useAuth();
  const [tabFocus, setTabFocus] = useState("chat");

  return (
    <section className="w-full max-w-[7%] shrink-0 bg-[var(--bg-color)]">
      {user ? (
        <div className="flex h-full flex-col items-center justify-between px-[1rem] py-[2rem]">
          <div className="flex w-full flex-col items-center gap-[3rem]">
            <ImageWithLightBoxWithBorderAndShadow
              src={user?.avatar ?? ""}
              className="aspect-square w-[80%] cursor-pointer rounded-[50%]"
              // onClick={openProfile}
              slides={[
                {
                  src: user?.avatar ?? "",
                },
              ]}
            />
            <ChatIcon
              show={() => {
                setTabFocus("chat");
                showChat();
              }}
              focus={tabFocus === "chat"}
            />
            <ProfileIcon
              show={() => {
                setTabFocus("profile");
                showProfile();
              }}
              focus={tabFocus === "profile"}
            />
          </div>
          <div className="flex flex-col gap-[3rem]">
            <NotificationProvider>
              <Notification />
            </NotificationProvider>
            <Signout className="text-xl font-thin" />
          </div>
        </div>
      ) : (
        ""
      )}
    </section>
  );
};

export default SideBar;
