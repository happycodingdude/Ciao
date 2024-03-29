import React, { useEffect, useRef, useState } from "react";
import { HttpRequest } from "../../common/Utility";
import { AttachmentProvider } from "../../context/AttachmentContext";
import { ConversationProvider } from "../../context/ConversationContext";
import { FriendProvider } from "../../context/FriendContext";
import { MessageProvider } from "../../context/MessageContext";
import { NotificationProvider } from "../../context/NotificationContext";
import { ParticipantProvider } from "../../context/ParticipantContext";
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
import SideBar from "../sidebar/SideBar";
import Attachment from "./Attachment";
import Chatbox from "./Chatbox";
import Information from "./Information";
import ListChat from "./ListChat";

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
  const auth = useAuth();
  const { selected, reFetch: reFetchConversations } = useFetchConversations();
  const { reFetch: reFetchParticipants } = useFetchParticipants();
  const { reFetchRequest, reFetchRequestById, reFetchFriends } =
    useFetchFriends();
  const { reFetchNotifications } = useFetchNotifications();

  const [contacts, setContacts] = useState();

  const refListChat = useRef();
  const refChatbox = useRef();
  const refInformationContainer = useRef();
  const refInformation = useRef();
  const refAttachment = useRef();

  const notifyMessage = (message) => {
    console.log(message);
    const messageData =
      message.data === undefined ? undefined : JSON.parse(message.data);
    switch (message.event) {
      case "NewMessage":
        refListChat.newMessage(messageData);
        refChatbox.newMessage(messageData);
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
        if (messageData.RequestId === null)
          reFetchRequest(messageData.ContactId);
        else reFetchRequestById(messageData.RequestId);
        break;
      case "NewNotification":
        // setNotifications((current) => {
        //   if (current !== undefined) return [...current, messageData];
        // });
        reFetchNotifications();
        break;
      default:
        break;
    }
  };

  const registerConnection = (token, controller) => {
    HttpRequest({
      method: "post",
      url: "api/notifications/register",
      token: auth.token,
      controller: controller,
      data: {
        Id: auth.id,
        Token: token,
      },
    });
  };

  useEffect(() => {
    const controller = new AbortController();

    reFetchFriends(controller);

    HttpRequest({
      method: "get",
      url: "api/contacts",
      token: auth.token,
      controller: controller,
    }).then((res) => {
      setContacts(res);
    });
    requestPermission(registerConnection, controller, notifyMessage);

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
    return () => {
      controller.abort();
    };
  }, []);

  const removeInListChat = (id) => {
    refListChat.removeChat(id);
  };

  const showInformationContainer = () => {
    refInformationContainer.current.classList.remove(
      "animate-information-hide",
    );
    refInformationContainer.current.classList.add("animate-information-show");
  };

  const hideInformationContainer = () => {
    refInformationContainer.current.classList.remove(
      "animate-information-show",
    );
    refInformationContainer.current.classList.add("animate-information-hide");
  };

  const toggleInformationContainer = () => {
    if (
      refInformationContainer.current.classList.contains(
        "animate-information-hide",
      )
    )
      showInformationContainer();
    else hideInformationContainer();
  };

  return (
    <div id="home" className="relative w-full">
      <div className="home-container absolute flex h-full w-full bg-gradient-to-r from-[var(--main-color-thin)] to-blue-100 text-[clamp(1.4rem,1vw,2rem)]">
        <SideBar />
        <section className="relative flex grow overflow-hidden">
          <ListChat
            refListChat={refListChat}
            contacts={contacts}
            notifyMessage={(chats, message) => notifyMessage(chats, message)}
          />
          {selected ? (
            <>
              <Chatbox
                contacts={contacts}
                refChatbox={refChatbox}
                toggleInformation={toggleInformationContainer}
              />
              <div
                ref={refInformationContainer}
                className="relative flex-1 origin-right overflow-hidden"
              >
                <Information
                  refAttachment={refAttachment}
                  refInformationExposed={refInformation}
                  removeInListChat={(val) => removeInListChat(val)}
                />
                <Attachment
                  refInformation={refInformation}
                  refAttachmentExposed={refAttachment}
                />
              </div>
            </>
          ) : (
            ""
          )}
        </section>
      </div>
    </div>
  );
};
