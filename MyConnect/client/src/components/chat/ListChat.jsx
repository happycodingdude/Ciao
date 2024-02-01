import moment from "moment";
import React, { memo, useEffect, useRef, useState } from "react";
import useAuth from "../../hook/useAuth";
import CustomLabel from "../common/CustomLabel";
import ImageWithLightBox from "../common/ImageWithLightBox";
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

  const imageOnError = (e) => {
    e.target.onerror = null;
    e.target.src = "../src/assets/imagenotfound.jpg";
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
    <div className="flex w-[calc(100%/4)] min-w-[calc(100%/4)] flex-col bg-white">
      {/* <div className="flex h-full w-full flex-col rounded-2xl bg-white"> */}
      <div className="flex h-[7rem] shrink-0 items-center gap-[1rem] border-b-[.1rem] border-b-gray-300 px-[2rem]">
        <div className="flex h-[50%] grow">
          <i className="fa fa-search flex w-[3rem] shrink-0 items-center justify-center rounded-l-lg bg-[#e7e7e7] pl-[1rem] font-normal text-gray-500"></i>
          <input
            type="text"
            placeholder="Search"
            className="w-full rounded-r-[.5rem] bg-[#e7e7e7] p-[1rem] focus:outline-none"
          ></input>
        </div>
        <div className="flex h-[50%] gap-[.5rem] [&>*]:px-[.5rem]">
          <div className="fa fa-user-plus flex flex-1 cursor-pointer items-center justify-center rounded-lg text-sm font-normal transition-all duration-200 hover:bg-[#e7e7e7]"></div>
          <CreateGroupChat></CreateGroupChat>
        </div>
      </div>
      <div className="flex h-full flex-col overflow-hidden">
        {/* <div className="flex h-[clamp(5rem,10vh,7rem)] items-center justify-between">
          <label className="text-gray-400">Friends</label>
          <div className="fa fa-arrow-up cursor-pointer text-lg font-normal text-gray-500"></div>
        </div> */}
        <div
          ref={refChats}
          // className="hide-scrollbar flex h-[clamp(50%,50vh,60%)] flex-col gap-[2rem] overflow-y-scroll scroll-smooth"
          className="hide-scrollbar flex flex-col gap-[.5rem] overflow-y-scroll scroll-smooth pt-[1rem] laptop:h-[30rem] desktop:h-[50rem] [&>*]:mx-[1rem]"
        >
          {chats?.map((item, i) => (
            <div
              data-key={item.Id}
              ref={(element) => {
                refChatItem.current[i] = element;
              }}
              // className="chat-item group flex cursor-pointer items-center gap-[1rem] overflow-hidden rounded-2xl p-[1rem] hover:bg-white
              //                   hover:text-white laptop:h-[8rem]"
              className={`${activeItem === item.Id ? "item-active" : ""} chat-item group flex shrink-0 cursor-pointer items-center gap-[1rem] overflow-hidden rounded-2xl px-[1rem] py-[1.2rem] hover:bg-[#f8f8f8]`}
              onClick={() => {
                handleSetConversation(item);
              }}
            >
              {/* <img
                src={item.Avatar ?? ""}
                onError={imageOnError}
                className="aspect-square rounded-full laptop:max-w-[5rem] desktop:max-w-[6rem]"
              ></img> */}
              <ImageWithLightBox
                src={item.Avatar ?? ""}
                // className="pointer-events-none aspect-square rounded-full laptop:max-w-[5rem] desktop:max-w-[6rem]"
                className="pointer-events-none aspect-square w-[4rem] rounded-full"
                slides={[
                  {
                    src: item.Avatar ?? "",
                  },
                ]}
              ></ImageWithLightBox>
              <div className="w-[50%] grow self-start">
                <CustomLabel
                  className="mr-auto font-bold"
                  title={item.Title}
                ></CustomLabel>
                {item.LastMessageContact == auth.id ? (
                  // <p className="overflow-hidden text-ellipsis">
                  //   {item.LastMessage === null
                  //     ? ""
                  //     : generateContent(item.LastMessage)}
                  // </p>
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
                      item.UnSeenMessages > 0 ? "font-bold text-red-400" : ""
                    } `}
                  >
                    {item.LastMessage === null
                      ? ""
                      : generateContent(item.LastMessage)}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 flex-col items-end gap-[.5rem] self-start laptop:min-w-[5rem]">
                {/* <p className="font-thin text-gray-950 group-hover:text-white group-[.item-active]:text-white"> */}
                <p className="font-thin text-gray-950">
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
                    // className="flex aspect-square w-[3rem] items-center justify-center rounded-full bg-gray-100 text-center text-[clamp(1.2rem,1.3vw,1.4rem)]
                    //                             font-bold text-slate-50
                    //                             group-hover:bg-white group-hover:text-gray-100
                    //                             group-[.item-active]:bg-white group-[.item-active]:text-gray-100"
                    className="flex aspect-square w-[3rem] items-center justify-center rounded-full bg-blue-100 text-center text-[clamp(1.2rem,1.3vw,1.4rem)] font-medium text-gray-500"
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
                        rounded-full bg-gray-300 font-normal text-gray-500"
            onClick={scrollListChatToBottom}
          ></div>
        </div>
      </div>
    </div>
    // </div>
  );
};

export default memo(ListChat);
