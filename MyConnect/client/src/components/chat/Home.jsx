import React, { useEffect, useRef, useState } from "react";
import { HttpRequest } from "../../common/Utility";
import { FriendProvider } from "../../context/FriendContext";
import { ProfileProvider } from "../../context/ProfileContext";
import {
  useAuth,
  useFetchConversations,
  useFetchFriends,
  useFetchNotifications,
  useFetchParticipants,
} from "../../hook/CustomHooks";
import ErrorBoundary from "../common/ErrorBoundary";
import { requestPermission } from "../common/Notification";
import ProfileSection from "../profile-new/ProfileSection";
import SideBar from "../sidebar/SideBar";
import { ChatSection } from "./ChatSection";

export const HomeContainer = () => {
  return (
    <ErrorBoundary>
      <FriendProvider>
        <Home></Home>
      </FriendProvider>
    </ErrorBoundary>
  );
};

export const Home = () => {
  const [page, setPage] = useState("chat");

  const auth = useAuth();
  const { reFetch: reFetchConversations } = useFetchConversations();
  const { reFetch: reFetchParticipants } = useFetchParticipants();
  const { reFetchRequest, reFetchRequestById, reFetchFriends } =
    useFetchFriends();
  const { reFetchNotifications } = useFetchNotifications();

  const refListChat = useRef();
  const refChatbox = useRef();

  const notifyMessage = (message) => {
    console.log(message);
    const messageData =
      message.data === undefined ? undefined : JSON.parse(message.data);
    switch (message.event) {
      case "NewMessage":
        refListChat.newMessage(messageData);
        if (refChatbox.newMessage) refChatbox.newMessage(messageData);
        break;
      case "AddMember":
        const listChat = Array.from(document.querySelectorAll(".chat-item"));
        const oldChat = listChat.find(
          (item) => item.dataset.key === messageData.Id,
        );
        // Old chat and is focused
        if (oldChat && oldChat.classList.contains("item-active"))
          reFetchParticipants(messageData.Id);
        else reFetchConversations();
        break;
      case "NewConversation":
        reFetchConversations();
        break;
      case "NewFriendRequest":
        reFetchRequestById(messageData.RequestId);
        break;
      case "AcceptFriendRequest":
        reFetchRequestById(messageData.RequestId);
        reFetchFriends();
        break;
      case "CancelFriendRequest":
        reFetchRequest(messageData.ContactId);
        break;
      case "NewNotification":
        reFetchNotifications();
        break;
      default:
        break;
    }
  };

  const registerConnection = (token) => {
    HttpRequest({
      method: "post",
      url: import.meta.env.VITE_ENDPOINT_NOTIFICATION_REGISTER,
      token: auth.token,
      // controller: controller,
      data: {
        Id: auth.id,
        Token: token,
      },
    });
  };

  useEffect(() => {
    if (!auth.valid) return;

    reFetchFriends();
    requestPermission(registerConnection, notifyMessage);

    // listenNotification((message) => {
    //   console.log("Home receive message from worker");
    //   const messageData = JSON.parse(message.data);
    //   switch (message.event) {
    //     case "AddMember":
    //       console.log(messageData);
    //       break;
    //     default:
    //       break;
    //   }
    // });
    // return () => {
    //   controller.abort();
    // };
  }, [auth.valid]);

  return (
    <div
      id="home"
      className="relative w-full text-[clamp(1.5rem,1.2vw,2.5rem)]"
    >
      <div className="home-container absolute flex h-full w-full bg-gradient-to-r from-[var(--main-color-thin)] to-blue-100">
        <SideBar
          showChat={() => setPage("chat")}
          showProfile={() => setPage("profile")}
        />
        {
          {
            chat: (
              <ChatSection refListChat={refListChat} refChatbox={refChatbox} />
            ),
            profile: (
              <ProfileProvider>
                <ProfileSection />
              </ProfileProvider>
            ),
          }[page]
        }
      </div>
    </div>
  );
};
