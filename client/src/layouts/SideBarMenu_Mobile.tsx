import { useQueryClient } from "@tanstack/react-query";
import React, { useEffect } from "react";
import Signout from "../features/authentication/components/Signout";
import useInfo from "../features/authentication/hooks/useInfo";
import { ConversationCache } from "../features/listchat/types";
import ProfileIcon from "../features/profile-new/ProfileIcon";
import ChatIcon from "../features/sidebar/components/ChatIcon";
import Notification from "../features/sidebar/components/Notification";
import { SideBarProps } from "../types";
import blurImage from "../utils/blurImage";
import { isPhoneScreen } from "../utils/getScreenSize";

const SideBarMenu_Mobile = (props: SideBarProps) => {
  const { page, setPage } = props;

  const queryClient = useQueryClient();
  const { data: info } = useInfo();

  if (!info) return;

  useEffect(() => {
    blurImage(".sidebar-container");
  }, [info.avatar]);

  return (
    <div className="inline-flex grow flex-row items-center justify-evenly">
      <div className="sidebar-menu-item">
        <ChatIcon
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
            queryClient.setQueryData(["message"], (oldData) => {
              return null;
            });
            queryClient.setQueryData(["attachment"], (oldData) => {
              return null;
            });
          }}
        />
        <div className="sidebar-menu-item-text">Chats</div>
      </div>
      <div className="sidebar-menu-item">
        <ProfileIcon
          onClick={() => {
            setPage("profile");
          }}
        />
        <div className="sidebar-menu-item-text">Profile</div>
      </div>
      <div className="sidebar-menu-item">
        <Notification />
        <div className="sidebar-menu-item-text">Notifications</div>
      </div>
      <div className="sidebar-menu-item">
        <Signout />
        <div className="sidebar-menu-item-text">Signout</div>
      </div>
    </div>
  );
};

export default SideBarMenu_Mobile;
