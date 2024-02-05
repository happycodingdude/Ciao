import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import useAuth from "../../hook/useAuth";
import { requestPermission } from "../common/Notification";
import Profile from "../sidebar/Profile";
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
      case "RemoveChat":
        const listChat = Array.from(document.querySelectorAll(".chat-item"));
        const isFocusChat = listChat.some((item) =>
          item.classList.contains("item-active"),
        );
        if (isFocusChat) {
          refChatbox.setParticipants();
        } else {
          const cancelToken = axios.CancelToken.source();
          getAllChats(cancelToken)
            .then((res) => {
              if (res.status !== 200) throw new Error(res.status);
              refListChat.setChats(res.data.data);
            })
            .catch((err) => {
              console.log(err);
            });
        }
        break;
      case "NewConversation":
        const cancelToken = axios.CancelToken.source();
        getAllChats(cancelToken)
          .then((res) => {
            if (res.status !== 200) throw new Error(res.status);
            refListChat.newChat(res.data.data);
          })
          .catch((err) => {
            console.log(err);
          });
        break;
      default:
        break;
    }
  };

  const getAllChats = async (cancelToken) => {
    const headers = {
      "Content-Type": "application/json",
      Authorization: "Bearer " + auth.token,
    };
    return axios.get("api/conversations", {
      cancelToken: cancelToken.token,
      headers: headers,
    });
  };

  const getAllContact = async (cancelToken) => {
    const headers = {
      "Content-Type": "application/json",
      Authorization: "Bearer " + auth.token,
    };
    return axios.get("api/contacts", {
      cancelToken: cancelToken.token,
      headers: headers,
    });
  };

  useEffect(() => {
    const cancelToken = axios.CancelToken.source();
    getAllChats(cancelToken)
      .then((res) => {
        if (res.status !== 200) throw new Error(res.status);
        refListChat.setChats(res.data.data);
        registerNotification(res.data.data);
      })
      .catch((err) => {
        console.log(err);
      });

    getAllContact(cancelToken).then((res) => {
      if (res.status !== 200) throw new Error(res.status);
      setContacts(res.data.data);
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
      cancelToken.cancel();
    };
  }, []);

  const registerNotification = (chats) => {
    requestPermission((message) => notifyMessage(chats, message)).then(
      (token) => {
        const cancelToken = axios.CancelToken.source();
        const headers = {
          "Content-Type": "application/json",
          Authorization: "Bearer " + auth.token,
        };
        const body = {
          Id: auth.id,
          Token: token,
        };
        axios
          .post(`api/notification/register`, body, {
            cancelToken: cancelToken.token,
            headers: headers,
          })
          .then((res) => {
            if (res.status !== 200) throw new Error(res.status);
          })
          .catch((err) => {
            console.log(err);
          });

        return () => {
          cancelToken.cancel();
        };
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

  return (
    <div className="flex w-full bg-gradient-to-r from-purple-100 to-blue-100 text-[clamp(1.4rem,1vw,2rem)]">
      <Profile />
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
                setConversation,
                toggleInformationContainer,
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
  );
};

export default Home;
