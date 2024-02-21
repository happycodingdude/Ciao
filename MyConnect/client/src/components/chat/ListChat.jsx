import moment from "moment";
import React, { useEffect, useRef, useState } from "react";
import { GenerateContent } from "../../common/Utility";
import { useAuth } from "../../hook/CustomHooks";
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
    setActiveItem("");
  };

  const focusChat = (item) => {
    setActiveItem(item.Id);
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
    reference.refListChat.newChat = (chats, focus, chat) => {
      setChats(chats);
      if (focus) handleSetConversation(chat);
    };
    reference.refListChat.checkExistChat = (id) => {
      return chats.find(
        (chat) =>
          chat.IsGroup === false &&
          chat.Participants.some((item) => item.ContactId === id),
      );
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

  return (
    <div className="flex w-[calc(100%/4)] min-w-[calc(100%/4)] flex-col bg-white shadow-[7px_0px_10px_-5px_#dbdbdb_inset]">
      <div className="h-[7rem]] flex shrink-0 items-center gap-[1rem] border-b-[.1rem] border-b-gray-300 px-[2rem]">
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
        className="hide-scrollbar flex grow flex-col gap-[1rem] overflow-y-scroll scroll-smooth p-[1rem] desktop:h-[50rem]"
      >
        {chats?.map((item, i) => (
          <div
            data-key={item.Id}
            data-user={
              !item.IsGroup
                ? item.Participants.find(
                    (item) => item.ContactId !== auth.user.Id,
                  )?.ContactId
                : ""
            }
            ref={(element) => {
              refChatItem.current[i] = element;
            }}
            className={`${activeItem === item.Id ? "bg-gradient-to-r from-pink-400 to-pink-200 text-white [&_.chat-content]:text-[#ffffffcb]" : ""} 
            chat-item group flex shrink-0 cursor-pointer items-center gap-[1rem] overflow-hidden rounded-[1rem] bg-pink-100 py-[.8rem] pl-[.5rem] pr-[1rem] hover:bg-pink-200`}
            onClick={() => {
              handleSetConversation(item);
            }}
          >
            <ImageWithLightBox
              src={item.Avatar ?? ""}
              className={`pointer-events-none aspect-square w-[5rem] rounded-2xl shadow-[0px_0px_10px_-5px_#f472b6]`}
            />
            <div className={`flex h-full w-1/2 grow flex-col justify-evenly`}>
              <CustomLabel
                className={`${item.UnSeenMessages > 0 ? "font-bold" : "font-medium"} `}
                title={
                  item.IsGroup
                    ? item.Title
                    : item.Participants.find(
                        (item) => item.ContactId !== auth.user.Id,
                      )?.Contact.Name
                }
              />
              <CustomLabel
                className={`chat-content ${
                  item.LastMessageContact !== auth.id && item.UnSeenMessages > 0
                    ? "font-bold text-pink-400"
                    : "font-medium text-[#0000007c]"
                }`}
                title={
                  item.LastMessage === null
                    ? ""
                    : GenerateContent(reference.contacts, item.LastMessage)
                }
              />
            </div>
            <div
              className={`flex h-full shrink-0 flex-col items-end ${item.UnSeenMessages > 0 ? "justify-evenly" : ""} laptop:min-w-[4rem]`}
            >
              <p>
                {item.LastMessageTime === null
                  ? ""
                  : moment(item.LastMessageTime).fromNow()}
              </p>
              {item.LastMessageContact == auth.id ||
              item.UnSeenMessages == 0 ? (
                ""
              ) : (
                <div className="flex aspect-square w-[2rem] items-center justify-center rounded-full bg-pink-300 text-center leading-8">
                  {item.UnSeenMessages > 5 ? "5+" : item.UnSeenMessages}
                </div>
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
  );
};

export default ListChat;
