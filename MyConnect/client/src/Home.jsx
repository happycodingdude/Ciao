import axios from "axios";
import React, { useEffect, useState } from "react";
import { requestPermission } from "../src/components/Notification";
import Chatbox from "./components/Chatbox";
import Information from "./components/Information";
import ListChat from "./components/ListChat";
import useAuth from "./hook/useAuth";

const Home = () => {
  const auth = useAuth();

  const [conversation, setConversation] = useState();

  useEffect(() => {
    requestPermission().then((token) => {
      console.log(token);
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
    });
  }, []);

  return (
    <section className="flex grow overflow-hidden">
      <ListChat setConversation={setConversation} />
      <Chatbox conversation={conversation} />
      <Information conversation={conversation} />
    </section>
  );
};

export default Home;
