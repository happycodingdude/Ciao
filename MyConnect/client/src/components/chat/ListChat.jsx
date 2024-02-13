import moment from "moment";
import React, { memo, useEffect, useRef, useState } from "react";
import useAuth from "../../hook/useAuth";
import CustomLabel from "../common/CustomLabel";
import ImageWithLightBox from "../common/ImageWithLightBox";
import AddFriend from "../friend/AddFriend";
import CreateGroupChat from "./CreateGroupChat";

const ListChat = ({ reference }) => {
  console.log("ListChat calling");
  const auth = useAuth();

  const refChatItem = useRef([]);
  const refChats = useRef();
  const refChatsScroll = useRef();

  const [chats, setChats] = useState();
  const [activeItem, setActiveItem] = useState();

  const unfocusChat = () => {
    // refChatItem.current.map((ref) => {
    //   ref.classList.remove("item-active");
    // });
    setActiveItem("");
  };

  const focusChat = (item) => {
    setActiveItem(item.Id);
    // refChatItem.current.map((ref) => {
    //   if (ref.dataset.key === item.Id) {
    //     ref.classList.add("item-active");
    //   } else {
    //     ref.classList.remove("item-active");
    //   }
    // });
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
      // var focus = refChatItem.current.find((ref) =>
      //   ref.classList.contains("item-active"),
      // );
      if (activeItem === undefined || activeItem === "") setChats(chats);
      else {
        setChats((current) => {
          return current.map((item) => {
            if (item.Id !== activeItem) return item;
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
    reference.refListChat.newChat = (chats) => {
      setChats(chats);
    };

    // listenNotification((message) => {
    //   console.log("ListChat receive message from worker");
    //   const messageData = JSON.parse(message.data);
    //   switch (message.event) {
    //     case "NewMessage":
    //       if (!chats.some((item) => item.LastMessageId === messageData.Id))
    //         reference.notifyMessage(chats, messageData);
    //       break;
    //     default:
    //       break;
    //   }
    // });
    moment.locale("en", {
      relativeTime: {
        future: "in %s",
        past: "%s",
        s: "1m",
        ss: "1m",
        m: "%dm",
        mm: "%dm",
        h: "%dh",
        hh: "%dh",
        d: "a day",
        dd: "%dd",
        M: "a month",
        MM: "%dM",
        y: "a year",
        yy: "%dY",
      },
    });
  }, [chats]);

  useEffect(() => {
    if (reference.conversation === undefined) return;
    setChats((current) => {
      return current.map((item) => {
        if (item.Id !== reference.conversation.Id) return item;
        item.Title = reference.conversation.Title;
        item.Avatar = reference.conversation.Avatar;
        return item;
      });
    });
  }, [reference.conversation]);

  const scrollListChatToBottom = () => {
    refChats.current.scrollTop = refChats.current.scrollHeight;
  };

  const generateContent = (text) => {
    if (reference.contacts.some((item) => text.includes(`@${item.Id}`))) {
      reference.contacts.map((item) => {
        text = text.replace(`@${item.Id}`, `${item.Name}`);
      });
      return text;
    }
    return text;
  };

  return (
    <div className="flex w-[calc(100%/4)] min-w-[calc(100%/4)] flex-col bg-white shadow-[7px_0px_10px_-5px_#dbdbdb_inset]">
      <div className="flex h-[7rem] shrink-0 items-center gap-[1rem] border-b-[.1rem] border-b-gray-300 px-[2rem]">
        <div className="flex h-[50%] grow">
          <i className="fa fa-search flex w-[3rem] shrink-0 items-center justify-center rounded-l-lg bg-[#f0f0f0] pl-[1rem] font-normal text-gray-500"></i>
          <input
            type="text"
            placeholder="Search"
            className="w-full rounded-r-[.5rem] bg-[#f0f0f0] p-[1rem] focus:outline-none"
          ></input>
        </div>
        <div className="flex h-[50%] gap-[.5rem] [&>*]:px-[.5rem]">
          <AddFriend />
          <CreateGroupChat />
        </div>
      </div>
      <div
        ref={refChats}
        className="hide-scrollbar flex grow flex-col gap-4 overflow-y-scroll scroll-smooth p-[1rem] desktop:h-[50rem]"
      >
        {chats?.map((item, i) => (
          <div
            data-key={item.Id}
            ref={(element) => {
              refChatItem.current[i] = element;
            }}
            className={`${activeItem === item.Id ? "item-active" : ""} 
            chat-item group relative flex h-[5.5rem] shrink-0 cursor-pointer
            items-center rounded-l-[3rem] rounded-r-[2rem]
            bg-pink-100 pl-28 pr-4 hover:bg-pink-200`}
            onClick={() => {
              handleSetConversation(item);
            }}
          >
            <ImageWithLightBox
              src={item.Avatar ?? ""}
              className={`pointer-events-none absolute left-0
              aspect-square w-[6rem] rounded-full
              border-[.2rem] ${activeItem === item.Id ? "border-pink-400" : "border-pink-200"} `}
              slides={[
                {
                  src: item.Avatar ?? "",
                },
              ]}
            />
            <div className="h-full w-[50%] grow pt-2">
              <CustomLabel
                className="mr-auto font-bold"
                title={item.Title}
              ></CustomLabel>
              {item.LastMessageContact == auth.id ? (
                <CustomLabel
                  title={
                    item.LastMessage === null
                      ? ""
                      : generateContent(item.LastMessage)
                  }
                ></CustomLabel>
              ) : (
                <p
                  className={`overflow-hidden text-ellipsis ${
                    item.UnSeenMessages > 0 ? "font-bold text-pink-400" : ""
                  } `}
                >
                  {item.LastMessage === null
                    ? ""
                    : generateContent(item.LastMessage)}
                </p>
              )}
            </div>
            <div
              className="flex h-full shrink-0 flex-col 
            items-end gap-[.5rem] self-start
            pt-2 laptop:min-w-[5rem]"
            >
              <p className="">
                {item.LastMessageTime === null
                  ? ""
                  : moment(item.LastMessageTime).format("DD/MM/YYYY") ===
                      moment().format("DD/MM/YYYY")
                    ? moment(item.LastMessageTime).fromNow()
                    : moment(item.LastMessageTime).format("DD/MM HH:mm")}
              </p>
              {item.LastMessageContact == auth.id ||
              item.UnSeenMessages == 0 ? (
                ""
              ) : (
                <p
                  className="flex aspect-square w-[2rem] items-center 
                justify-center rounded-full bg-pink-300 text-center"
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
        className="mx-auto my-[.5rem] flex hidden items-center text-center text-gray-400"
      >
        <div
          className="fa fa-arrow-down flex aspect-square w-[3rem] cursor-pointer items-center justify-center
                        rounded-full bg-[#f0f0f0] font-normal text-gray-500 hover:bg-[#dadada]"
          onClick={scrollListChatToBottom}
        ></div>
      </div>
    </div>
    // </div>
  );
};

export default memo(ListChat);
