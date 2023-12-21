import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import Attachment from "./components/Attachment";
import Chatbox from "./components/Chatbox";
import Information from "./components/Information";
import ListChat from "./components/ListChat";
import { requestPermission } from "./components/Notification";
import Signout from "./components/Signout";
import useAuth from "./hook/useAuth";

const Home = () => {
  const auth = useAuth();

  const [conversation, setConversation] = useState();
  const refListChat = useRef();
  const refInformationContainer = useRef();
  const refAttachment = useRef();

  const notifyMessage = (chats, message) => {
    const messageData = JSON.parse(message.data);
    switch (message.event) {
      case "NewMessage":
        var newChats = chats.map((item) => {
          if (item.Id !== messageData.ConversationId) return item;
          item.UnSeenMessages++;
          item.LastMessageId = messageData.Id;
          item.LastMessage = messageData.Content;
          item.LastMessageTime = messageData.CreatedTime;
          item.LastMessageContact = messageData.ContactId;
          return item;
        });
        refListChat.setChats(newChats);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    const cancelToken = axios.CancelToken.source();
    const headers = {
      "Content-Type": "application/json",
      Authorization: "Bearer " + auth.token,
    };
    axios
      .get("api/conversations", {
        cancelToken: cancelToken.token,
        headers: headers,
      })
      .then((res) => {
        if (res.status !== 200) throw new Error(res.status);
        refListChat.setChats(res.data.data);
        registerNotification(res.data.data);
      })
      .catch((err) => {
        console.log(err);
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
    <section className="relative flex grow overflow-hidden [&>*:not(:first-child)]:mx-[1rem] [&>*:not(:first-child)]:mb-[1rem] [&>*:not(:first-child)]:mt-[2rem]">
      <Signout />
      <ListChat reference={{ refListChat, setConversation, notifyMessage }} />
      {conversation == undefined ? (
        ""
      ) : (
        <>
          <Chatbox
            reference={{
              conversation,
              setConversation,
              toggleInformationContainer,
            }}
          />
          <div
            ref={refInformationContainer}
            className="relative w-[calc(100%/4)] shrink-0"
          >
            <Information
              reference={{ conversation, refAttachment, removeInListChat }}
            />
            <Attachment reference={{ conversation, refAttachment }} />
          </div>
        </>
      )}
    </section>
  );
};

export default Home;
