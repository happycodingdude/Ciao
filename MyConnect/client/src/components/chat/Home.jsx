import React, { useCallback, useEffect, useRef, useState } from "react";
import { HttpRequest } from "../../common/Utility";
import { AttachmentProvider } from "../../context/AttachmentContext";
import { ConversationProvider } from "../../context/ConversationContext";
import { FriendProvider } from "../../context/FriendContext";
import { MessageProvider } from "../../context/MessageContext";
import { ParticipantProvider } from "../../context/ParticipantContext";
import { ProfileProvider } from "../../context/ProfileContext";
import {
  useAuth,
  useFetchConversations,
  useFetchFriends,
  useFetchParticipants,
} from "../../hook/CustomHooks";
import { requestPermission } from "../common/Notification";
import SideBar from "../sidebar/SideBar";
import Attachment from "./Attachment";
import Chatbox from "./Chatbox";
import Information from "./Information";
import ListChat from "./ListChat";

export const HomeContainer = () => {
  return (
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
  );
};

export const Home = () => {
  const auth = useAuth();
  const { selected, reFetch: reFetchConversations } = useFetchConversations();
  const { reFetch: reFetchParticipants } = useFetchParticipants();
  const { reFetchFriends } = useFetchFriends();

  const [contacts, setContacts] = useState();

  const refListChat = useRef();
  const refChatbox = useRef();
  const refInformationContainer = useRef();
  const refInformation = useRef();
  const refAttachment = useRef();

  const notifyMessage = useCallback(
    (message) => {
      console.log(message);
      const messageData = JSON.parse(message.data);
      switch (message.event) {
        case "NewMessage":
          refListChat.newMessage(messageData);
          if (
            messageData.ContactId !== auth.id &&
            messageData.ConversationId === selected?.Id
          )
            refChatbox.newMessage(messageData);
          break;
        case "AddMember":
          const listChat = Array.from(document.querySelectorAll(".chat-item"));
          const oldChat = listChat.find(
            (item) => item.dataset.key === messageData.Id,
          );
          // Old chat
          if (oldChat) {
            // And focused
            if (oldChat.classList.contains("item-active"))
              reFetchParticipants(messageData.Id);
          } else reFetchConversations();
          break;
        case "NewConversation":
          reFetchConversations();
          break;
        default:
          break;
      }
    },
    [selected],
  );

  const registerConnection = (token) => {
    HttpRequest({
      method: "post",
      url: "api/notification/register",
      token: auth.token,
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
      if (!res) return;
      setContacts(res);
      requestPermission(registerConnection, notifyMessage);
    });

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
  }, [notifyMessage]);

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
      <div className="absolute flex h-full w-full bg-gradient-to-r from-[var(--main-color-thin)] to-blue-100 text-[clamp(1.4rem,1vw,2rem)]">
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
