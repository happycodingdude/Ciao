import axios from "axios";
import React, { useEffect, useState } from "react";
import { requestPermission } from "../src/components/Notification";
import Chatbox from "./components/Chatbox";
import Information from "./components/Information";
import ListChat from "./components/ListChat";
import Signout from "./components/Signout";
import useAuth from "./hook/useAuth";

const Home = () => {
  const auth = useAuth();

  const [conversation, setConversation] = useState();
  const [chats, setChats] = useState([]);

  useEffect(() => {
    requestPermission().then((token) => {
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

      axios
        .get("api/conversations", {
          cancelToken: cancelToken.token,
          headers: headers,
        })
        .then((res) => {
          if (res.status === 200) {
            setChats(res.data.data);

            setTimeout(() => {
              setConversation(res.data.data[0]);
            }, 100);
          } else throw new Error(res.status);
        })
        .catch((err) => {
          console.log(err);
        });

      return () => {
        cancelToken.cancel();
      };
    });
  }, []);

  const removeInListChat = (id) => {
    const remainChats = chats.filter((item) => item.Id !== id);
    setChats(remainChats);
    setConversation(remainChats[0]);
    removeRefChatItem(id);
  };

  return (
    <section className="relative flex grow overflow-hidden">
      <Signout />
      <ListChat chats={chats} setConversation={setConversation} />
      <Chatbox conversation={conversation} />
      <Information
        conversation={conversation}
        removeInListChat={removeInListChat}
      />
    </section>
  );
};

export default Home;
