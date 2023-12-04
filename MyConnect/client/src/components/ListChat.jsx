import moment from "moment";
import React, { memo, useEffect, useRef, useState } from "react";
import useAuth from "../hook/useAuth";

const ListChat = ({ reference }) => {
  const auth = useAuth();

  const refChatItem = useRef([]);
  const refChats = useRef();
  const refChatsScroll = useRef();

  const [chats, setChats] = useState();

  const unfocusChat = () => {
    refChatItem.current.map((ref) => {
      ref.classList.remove("item-active");
    });
  };

  const focusChat = (item) => {
    refChatItem.current.map((ref) => {
      if (ref.dataset.key === item.Id) {
        ref.classList.add("item-active");
      } else {
        ref.classList.remove("item-active");
      }
    });
  };

  const handleSetConversation = (item) => {
    reference.setConversation(item);
    focusChat(item);
    setChats((current) => {
      return current.map((chat) => {
        if (chat.Id !== item.Id) return chat;
        chat.UnSeenMessages = 0;
        return chat;
      });
    });
  };

  useEffect(() => {
    refChatItem.current = refChatItem.current.filter((item) => item !== null);

    if (refChats.current.scrollHeight <= refChats.current.clientHeight)
      refChatsScroll.current.classList.add("hidden");
    else refChatsScroll.current.classList.remove("hidden");

    reference.refListChat.setChats = (chats) => {
      var focus = refChatItem.current.find((ref) =>
        ref.classList.contains("item-active"),
      );
      if (focus == undefined) setChats(chats);
      else {
        setChats((current) => {
          return chats.map((item) => {
            if (item.Id !== focus.dataset.key) return item;
            item.UnSeenMessages = 0;
            return item;
          });
        });
      }
    };
    reference.refListChat.removeChat = (id) => {
      const remainChats = chats.filter((item) => item.Id !== id);
      setChats(remainChats);
      reference.setConversation(undefined);
      unfocusChat();
    };

    // setTimeout(() => {
    //   handleSetConversation(chats?.[0]);
    // }, 500);
  }, [chats]);

  const scrollListChatToBottom = () => {
    refChats.current.scrollTop = refChats.current.scrollHeight;
  };

  return (
    <div
      div
      className="flex w-[clamp(30rem,20vw,40rem)] shrink-0 flex-col [&>*:not(:first-child)]:mt-[1rem] [&>*]:mx-[1rem]"
    >
      <div className="relative">
        <input
          type="text"
          placeholder="Search"
          className="w-full rounded-[.5rem] p-[1rem] focus:outline-none"
        ></input>
        <i className="fa fa-search absolute bottom-0 right-[0] top-0 flex w-[15%] items-center justify-center rounded-r-[.5rem] bg-gray-200 font-normal text-gray-400"></i>
      </div>
      <div className="flex h-full flex-col overflow-hidden">
        <div className="flex h-[clamp(5rem,10vh,7rem)] items-center justify-between">
          <label className="text-gray-400">Friends</label>
          <a href="#" className="fa fa-arrow-up text-gray-500"></a>
        </div>
        <div
          ref={refChats}
          className="hide-scrollbar flex h-[clamp(50%,50vh,60%)] flex-col gap-[2rem] overflow-y-scroll scroll-smooth"
        >
          {chats?.map((item, i) => (
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
                  {item.LastMessageContact == auth.id ? (
                    <p>{item.LastMessage}</p>
                  ) : (
                    <p
                      className={
                        item.UnSeenMessages > 0 ? "font-bold text-red-400" : ""
                      }
                    >
                      {item.LastMessage}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end gap-[.5rem]">
                <p className="font-thin text-gray-950 group-hover:text-white group-[.item-active]:text-white">
                  {moment(item.LastMessageTime).format("DD/MM/YYYY") ===
                  moment().format("DD/MM/YYYY")
                    ? moment(item.LastMessageTime).format("HH:mm")
                    : moment(item.LastMessageTime).format("DD/MM HH:mm")}
                </p>
                {item.LastMessageContact == auth.id ||
                item.UnSeenMessages == 0 ? (
                  ""
                ) : (
                  <p
                    className="flex aspect-square w-[3rem] items-center justify-center rounded-[50%] bg-blue-500 text-center text-[clamp(1.2rem,1.3vw,1.4rem)]
                                                font-bold text-white
                                                group-hover:bg-white group-hover:text-blue-500
                                                group-[.item-active]:bg-white group-[.item-active]:text-blue-500"
                  >
                    {item.UnSeenMessages > 5 ? "5+" : item.UnSeenMessages}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
        <div
          ref={refChatsScroll}
          className="mt-[.5rem] flex hidden items-center text-center text-gray-400
                                    before:mr-[2rem] before:h-[.1rem] before:grow before:bg-gray-400
                                    after:ml-[2rem] after:h-[.1rem]  after:grow after:bg-gray-400"
        >
          <div
            className="fa fa-arrow-down flex aspect-square w-[3rem] cursor-pointer items-center justify-center
                        rounded-[50%] bg-gray-300 font-normal text-gray-500"
            onClick={scrollListChatToBottom}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default memo(ListChat);
