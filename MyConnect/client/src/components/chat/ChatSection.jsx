import React, { useEffect, useRef } from "react";
import { HttpRequest } from "../../common/Utility";
import {
  useAuth,
  useFetchConversations,
  useFetchFriends,
  useFetchNotifications,
  useFetchParticipants,
} from "../../hook/CustomHooks";
import { requestPermission } from "../common/Notification";
import Attachment from "./Attachment";
import Chatbox from "./Chatbox";
import Information from "./Information";
import ListChat from "./ListChat";

export const ChatSection = (props) => {
  const { show } = props;
  const auth = useAuth();
  const { selected, reFetch: reFetchConversations } = useFetchConversations();
  const { reFetch: reFetchParticipants } = useFetchParticipants();
  const { reFetchRequest, reFetchRequestById, reFetchFriends } =
    useFetchFriends();
  const { reFetchNotifications } = useFetchNotifications();

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
    <section className={`relative flex grow overflow-hidden`}>
      <ListChat
        refListChat={refListChat}
        // contacts={contacts}
        notifyMessage={(chats, message) => notifyMessage(chats, message)}
      />
      {selected ? (
        <>
          <Chatbox
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
  );
};
