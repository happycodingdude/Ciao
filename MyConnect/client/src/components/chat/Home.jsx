import React, { useEffect, useRef, useState } from "react";
import { HttpRequest } from "../../common/Utility";
import { useAuth } from "../../hook/CustomHooks";
import { requestPermission } from "../common/Notification";
import SideBar from "../sidebar/SideBar";
import Attachment from "./Attachment";
import Chatbox from "./Chatbox";
import Information from "./Information";
import ListChat from "./ListChat";

const Home = () => {
  const auth = useAuth();

  const [conversation, setConversation] = useState();
  const [contacts, setContacts] = useState();

  const refListChat = useRef();
  const refChatbox = useRef();
  const refInformationContainer = useRef();
  const refInformation = useRef();
  const refAttachment = useRef();

  const notifyMessage = (chats, message) => {
    console.log(message);
    const messageData = JSON.parse(message.data);
    switch (message.event) {
      case "NewMessage":
        var newChats = chats.map((item) => {
          if (item.Id !== messageData.ConversationId || !item.IsNotifying)
            return item;
          item.UnSeenMessages++;
          item.LastMessageId = messageData.Id;
          item.LastMessage = messageData.Content;
          item.LastMessageTime = messageData.CreatedTime;
          item.LastMessageContact = messageData.ContactId;
          return item;
        });
        refListChat.setChats(newChats);

        if (messageData.ContactId !== auth.id)
          refChatbox.newMessage(messageData);
        break;
      case "AddMember":
        const listChat = Array.from(document.querySelectorAll(".chat-item"));
        const isFocusChat = listChat.some(
          (item) =>
            item.dataset.key === messageData.Id &&
            item.classList.contains("item-active"),
        );
        if (isFocusChat) {
          refChatbox.setParticipants();
        } else {
          HttpRequest({
            method: "get",
            url: "api/conversations",
            token: auth.token,
          }).then((res) => {
            if (!res) return;
            refListChat.newChat(res, true);
          });
        }
        break;
      case "NewConversation":
        HttpRequest({
          method: "get",
          url: "api/conversations",
          token: auth.token,
        }).then((res) => {
          if (!res) return;
          refListChat.newChat(res, messageData);
        });
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    const controller = new AbortController();

    HttpRequest({
      method: "get",
      url: "api/conversations",
      token: auth.token,
      controller: controller,
    }).then((res) => {
      if (!res) return;
      const filterChats = res.filter((item) =>
        item.Participants.some(
          (participant) =>
            participant.ContactId === auth.id && !participant.IsDeleted,
        ),
      );
      refListChat.setChats(filterChats);
      registerNotification(res);
    });

    HttpRequest({
      method: "get",
      url: "api/contacts",
      token: auth.token,
      controller: controller,
    }).then((res) => {
      if (!res) return;
      setContacts(res);
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
  }, []);

  const registerNotification = (chats) => {
    requestPermission((message) => notifyMessage(chats, message)).then(
      (token) => {
        HttpRequest({
          method: "post",
          url: "api/notification/register",
          token: auth.token,
          data: {
            Id: auth.id,
            Token: token,
          },
        });
      },
    );
  };

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

  const checkExistChat = (id) => {
    return refListChat.checkExistChat(id);
  };

  return (
    <div id="home" className="relative w-full">
      <div className="absolute flex h-full w-full bg-gradient-to-r from-pink-100 to-blue-100 text-[clamp(1.4rem,1vw,2rem)]">
        <SideBar />
        <section className="relative flex grow overflow-hidden">
          <ListChat
            reference={{
              conversation,
              refListChat,
              contacts,
              setConversation,
              notifyMessage,
            }}
          />
          {conversation == undefined ? (
            ""
          ) : (
            <>
              <Chatbox
                reference={{
                  conversation,
                  refChatbox,
                  refInformation,
                  contacts,
                  toggleInformationContainer,
                  checkExistChat,
                }}
              />
              <div
                ref={refInformationContainer}
                className="relative flex-1 origin-right overflow-hidden"
              >
                <Information
                  reference={{
                    conversation,
                    refInformation,
                    refAttachment,
                    setConversation,
                    removeInListChat,
                  }}
                />
                <Attachment
                  reference={{ conversation, refInformation, refAttachment }}
                />
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
};

export default Home;
