import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { requestPermission } from "../src/components/Notification";
import Chatbox from "./components/Chatbox";
import Information from "./components/Information";
import ListChat from "./components/ListChat";
import Signout from "./components/Signout";
import useAuth from "./hook/useAuth";

const Home = () => {
  const auth = useAuth();

  const [conversation, setConversation] = useState();
  const refListChat = useRef();

  const notifyMessage = (chats, message) => {
    var newChats = chats.map((item) => {
      if (item.Id !== message.ConversationId) return item;
      item.UnSeenMessages++;
      item.LastMessage = message.Content;
      item.LastMessageTime = message.CreatedTime;
      item.LastMessageContact = message.ContactId;
      return item;
    });
    refListChat.current?.setChats(newChats);
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
        if (res.status === 200) {
          refListChat.current?.setChats(res.data.data);
          registerNotification(res.data.data);
          // setTimeout(() => {
          //   setConversation(res.data.data[0]);
          // }, 100);
        } else throw new Error(res.status);
      })
      .catch((err) => {
        console.log(err);
      });

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
    refListChat.current?.removeChat(id);
  };

  return (
    <section className="relative flex grow overflow-hidden [&>*:not(:first-child)]:mx-[1rem] [&>*:not(:first-child)]:mb-[1rem] [&>*:not(:first-child)]:mt-[2rem]">
      <Signout />
      <ListChat ref={refListChat} setConversation={setConversation} />
      {conversation == undefined ? (
        ""
      ) : (
        <>
          <Chatbox conversation={conversation} />
          <Information
            conversation={conversation}
            removeInListChat={removeInListChat}
          />
        </>
      )}
    </section>
  );
};

export default Home;
