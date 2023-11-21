import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import useAuth from "../hook/useAuth";

const ListChat = ({ setConversation }) => {
  const auth = useAuth();

  // States
  const [chats, setChats] = useState([]);
  const refChatItem = useRef([]);

  // Get all data first render
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
          setChats(res.data.data);

          setTimeout(() => {
            handleSetConversation(res.data.data[0]);
          }, 100);
        } else throw new Error(res.status);
      })
      .catch((err) => {
        console.log(err);
      });

    return () => {
      cancelToken.cancel();
    };
  }, []);

  const handleSetConversation = (item) => {
    setConversation(item);
    refChatItem.current.forEach((ref) => {
      if (ref.dataset.key === item.Id) {
        ref.classList.add("item-active");
      } else {
        ref.classList.remove("item-active");
      }
    });
  };

  return (
    <div
      div
      className="m-[1rem] flex w-[clamp(30rem,20vw,40rem)] shrink-0 flex-col [&>*]:m-[1rem]"
    >
      <input
        type="text"
        placeholder="Search here"
        className="rounded-[.5rem] focus:outline-none"
      ></input>
      <div className="flex flex-col overflow-hidden">
        <div className="flex h-[clamp(5rem,10vh,7rem)] items-center justify-between">
          <label>Friends</label>
          <a href="#" className="fa fa-arrow-up text-gray-500"></a>
        </div>
        <div className="hide-scrollbar flex h-[clamp(30rem,50vh,50rem)] flex-col gap-[2rem] overflow-y-scroll">
          {chats.map((item, i) => (
            <div
              data-key={item.Id}
              ref={(element) => {
                refChatItem.current[i] = element;
              }}
              className="group flex cursor-pointer rounded-[1rem] p-[1rem] 
                                hover:bg-blue-500 hover:text-white"
              onClick={() => {
                handleSetConversation(item);
              }}
            >
              <div className="flex grow items-start gap-[1rem]">
                <div className="aspect-square w-[4rem] rounded-[50%] bg-orange-400"></div>
                <div className="grow">
                  <p className="font-bold">{item.Title}</p>
                  <p className="">message</p>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <p>yesterday</p>
                <div
                  className="flex aspect-square w-[3rem] items-center justify-center rounded-[50%]
                                        bg-blue-500 text-white
                                        group-hover:bg-white group-hover:text-blue-500
                                        group-[.item-active]:bg-white group-[.item-active]:text-blue-500"
                >
                  5+
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ListChat;
