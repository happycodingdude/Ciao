import React, { useState } from "react";
import { AttachmentProvider } from "../../context/AttachmentContext";
import { ConversationProvider } from "../../context/ConversationContext";
import { FriendProvider } from "../../context/FriendContext";
import { MessageProvider } from "../../context/MessageContext";
import { NotificationProvider } from "../../context/NotificationContext";
import { ParticipantProvider } from "../../context/ParticipantContext";
import { ProfileProvider } from "../../context/ProfileContext";
import ErrorBoundary from "../common/ErrorBoundary";
import ProfileSection from "../profile-new/ProfileSection";
import SideBar from "../sidebar/SideBar";
import { ChatSection } from "./ChatSection";

export const HomeContainer = () => {
  return (
    <ErrorBoundary>
      <NotificationProvider>
        <ProfileProvider>
          <FriendProvider>
            <ConversationProvider>
              <MessageProvider>
                <ParticipantProvider>
                  <AttachmentProvider>
                    <Home></Home>
                  </AttachmentProvider>
                </ParticipantProvider>
              </MessageProvider>
            </ConversationProvider>
          </FriendProvider>
        </ProfileProvider>
      </NotificationProvider>
    </ErrorBoundary>
  );
};

export const Home = () => {
  const [page, setPage] = useState("chat");
  const showProfile = () => {
    setPage("profile");
  };

  return (
    <div id="home" className="relative w-full">
      <div className="home-container absolute flex h-full w-full bg-gradient-to-r from-[var(--main-color-thin)] to-blue-100 text-[clamp(1.4rem,1vw,2rem)]">
        <SideBar />
        {
          {
            chat: <ChatSection />,
            profile: <ProfileSection />,
          }[page]
        }
      </div>
    </div>
  );
};
