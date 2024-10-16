import { useQueryClient } from "@tanstack/react-query";
import moment from "moment";
import React, { useEffect, useRef, useState } from "react";
import { blurImageOLD } from "../../common/Utility";
import {
  useAttachment,
  useConversation,
  useInfo,
  useMessage,
} from "../../hook/CustomHooks";
import CustomLabel from "../common/CustomLabel";
import ImageWithLightBox from "../common/ImageWithLightBox";
import LocalLoading from "../common/LocalLoading";

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

const ListChat = () => {
  console.log("ListChat calling");

  const queryClient = useQueryClient();

  const refChatItem = useRef([]);
  const refChats = useRef();
  const refChatsScroll = useRef();

  const [selected, setSelected] = useState();
  const [page, setPage] = useState(1);

  const { data: info } = useInfo();
  const {
    data,
    isLoading,
    isRefetching,
    refetch: refetchConversation,
  } = useConversation(page);
  const { refetch: refetchMessage } = useMessage(selected?.id, 1);
  const { refetch: refetchAttachments } = useAttachment(selected?.id);

  useEffect(() => {
    if (page) refetchConversation();
  }, [page]);

  useEffect(() => {
    blurImageOLD(".list-chat");
  }, [data?.conversations]);

  const handleSetConversation = (position, item) => {
    setSelected(item);

    // const container = document.querySelector(".chatbox-content");
    // const blurredDivs = container.querySelectorAll(".blurred-div");
    // blurredDivs.forEach((div) => {
    //   div.classList.remove("loaded");
    // });
  };

  useEffect(() => {
    if (selected) {
      queryClient.setQueryData(["conversation"], (oldData) => {
        // const cloned = oldData.map((item) => {
        //   return Object.assign({}, item);
        // });
        const cloned = Object.assign({}, oldData);
        var newConversations = cloned.conversations.map((conversation) => {
          if (conversation.id !== selected.id) return conversation;
          conversation.unSeenMessages = 0;
          return conversation;
        });
        return {
          selected: selected.id,
          conversations: newConversations,
        };
      });
      refetchMessage();
      refetchAttachments();
    }
  }, [selected?.id]);

  // Get all chats when first time render
  // useEffect(() => {
  //   if (!auth.valid) return;

  //   // const controller = new AbortController();
  //   reFetchConversations();

  //   // listenNotification((message) => {
  //   //   console.log("Home receive message from worker");
  //   //   const messageData = JSON.parse(message.data);
  //   //   switch (message.event) {
  //   //     case "AddMember":
  //   //       console.log(messageData);
  //   //       break;
  //   //     default:
  //   //       break;
  //   //   }
  //   // });
  //   // return () => {
  //   //   controller.abort();
  //   // };
  // }, [auth.valid]);

  // if (isLoading || isRefetching) return <LocalLoading loading />;

  // useEffect(() => {
  //   // refChatItem.current = refChatItem.current.filter((item) => item !== null);

  //   // if (refChats.current.scrollHeight <= refChats.current.clientHeight)
  //   //   refChatsScroll.current.classList.add("hidden");
  //   // else refChatsScroll.current.classList.remove("hidden");

  //   // refListChat.newMessage = newMessage;

  //   // listenNotification((message) => {
  //   //   console.log("ListChat receive message from worker");
  //   //   const messageData = JSON.parse(message.data);
  //   //   switch (message.event) {
  //   //     case "NewMessage":
  //   //       if (!chats.some((item) => item.LastMessageId === messageData.Id))
  //   //         notifyMessage(chats, messageData);
  //   //       break;
  //   //     default:
  //   //       break;
  //   //   }
  //   // });

  //   moment.locale("en", {
  //     relativeTime: {
  //       future: "in %s",
  //       past: "%s",
  //       s: "1m",
  //       ss: "1m",
  //       m: "%dm",
  //       mm: "%dm",
  //       h: "%dh",
  //       hh: "%dh",
  //       d: "a day",
  //       dd: "%dd",
  //       M: "a month",
  //       MM: "%dM",
  //       y: "a year",
  //       yy: "%dY",
  //     },
  //   });
  // }, [conversations]);

  const scrollListChatToBottom = () => {
    refChats.current.scrollTop = refChats.current.scrollHeight;
  };

  return (
    <>
      <div
        ref={refChats}
        className="list-chat hide-scrollbar relative flex grow flex-col gap-[1rem] overflow-y-scroll scroll-smooth p-[1rem] desktop:h-[50rem]"
      >
        {isLoading || isRefetching ? <LocalLoading loading /> : ""}
        {data?.conversations.map((item, i) => (
          <div
            data-key={item.id}
            data-user={
              !item.isGroup
                ? item.participants.find(
                    (item) => item.contact.id !== info.data.id,
                  )?.contact.id
                : ""
            }
            ref={(element) => {
              refChatItem.current[i] = element;
            }}
            className={`chat-item group flex h-[6.5rem] shrink-0 cursor-pointer items-center gap-[1rem] overflow-hidden rounded-[1rem]
            py-[.8rem] pl-[.5rem] pr-[1rem] 
            ${
              selected?.id === item.id
                ? `item-active bg-gradient-to-br from-[#00AFB9] to-[#FED9B7] text-[var(--text-sub-color)] [&_.chat-content]:text-[var(--text-sub-color-thin)]`
                : "bg-[var(--bg-color-light)] hover:bg-[var(--bg-color-extrathin)]"
            } `}
            onClick={() => {
              handleSetConversation(65 * i, item);
            }}
          >
            {item.isGroup ? (
              <ImageWithLightBox
                src={item.avatar}
                className={`pointer-events-none aspect-square rounded-2xl bg-[size:150%] shadow-[0px_0px_10px_-7px_var(--shadow-color)] laptop:w-[5rem]`}
                spinnerClassName="laptop:bg-[size:2rem]"
                imageClassName="bg-[size:150%]"
              />
            ) : (
              <ImageWithLightBox
                src={
                  item.participants.find(
                    (item) => item.contact.id !== info.data.id,
                  )?.contact.avatar
                }
                className={`pointer-events-none aspect-square rounded-2xl bg-[size:150%] shadow-[0px_0px_10px_-7px_var(--shadow-color)] laptop:w-[5rem]`}
                spinnerClassName="laptop:bg-[size:2rem]"
                imageClassName="bg-[size:150%]"
              />
            )}
            <div className={`flex h-full w-1/2 grow flex-col gap-[.3rem]`}>
              <CustomLabel
                className={`text-base text-[var(--text-main-color)] ${item.lastMessageContact !== info.data.id && item.unSeenMessages > 0 && item.id != selected?.id ? "font-bold" : ""} `}
                title={
                  item.isGroup
                    ? item.title
                    : item.participants.find(
                        (item) => item.contact.id !== info.data.id,
                      )?.contact.name
                }
              />
              <CustomLabel
                className={`chat-content text-[var(--text-main-color-thin)] ${
                  item.lastMessageContact !== info.data.id &&
                  item.unSeenMessages > 0 &&
                  item.id != selected?.id
                    ? "font-medium"
                    : ""
                }`}
                title={item.lastMessage}
              />
            </div>
            <div
              className={`flex h-full shrink-0 flex-col items-end laptop:min-w-[4rem]`}
            >
              <p>
                {item.lastMessageTime === null
                  ? ""
                  : moment(item.lastMessageTime).fromNow()}
              </p>
            </div>
          </div>
        ))}
      </div>
      <div
        ref={refChatsScroll}
        className="mx-auto my-[.5rem] hidden items-center text-center"
      >
        <div
          className="fa fa-arrow-down flex aspect-square w-[3rem] cursor-pointer items-center justify-center rounded-full 
          bg-[var(--main-color)] font-normal text-[var(--text-sub-color)] hover:bg-[var(--main-color-light)]"
          onClick={scrollListChatToBottom}
        ></div>
      </div>
    </>
  );
};

export default ListChat;
