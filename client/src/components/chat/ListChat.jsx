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
import ImageWithLightBoxAndNoLazy from "../common/ImageWithLightBoxAndNoLazy";
import LocalLoading from "../common/LocalLoading";
import OnlineStatusDot from "../common/OnlineStatusDot";

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
  const { refetch: refetchMessage } = useMessage(selected, 1);
  const { refetch: refetchAttachments } = useAttachment(selected);

  // useEffect(() => {
  //   if (page) refetchConversation();
  // }, [page]);

  useEffect(() => {
    blurImageOLD(".list-chat");
  }, [data?.conversations]);

  const handleSetConversation = (id) => {
    setSelected(id);
  };

  useEffect(() => {
    if (!selected) return;

    queryClient.setQueryData(["conversation"], (oldData) => {
      // const cloned = oldData.map((item) => {
      //   return Object.assign({}, item);
      // });
      const cloned = Object.assign({}, oldData);
      var newConversations = cloned.conversations.map((conversation) => {
        if (conversation.id !== selected) return conversation;
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
  }, [selected]);

  useEffect(() => {
    if (!data?.selected || data?.selected === selected) return;

    //console.log("CLick chat button from list friend");
    handleSetConversation(data.selected);
  }, [data]);

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
            key={item.id}
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
            className={`chat-item group flex h-[6.5rem] shrink-0 cursor-pointer items-center gap-[1.5rem] overflow-hidden rounded-[1rem]
            py-[.8rem] pl-[.5rem] pr-[1rem] 
            ${
              selected === item.id
                ? `item-active bg-gradient-to-tr from-[var(--main-color)] to-[var(--main-color-extrathin)] text-[var(--text-sub-color)] [&_.chat-content]:text-[var(--text-sub-color-thin)]`
                : "bg-[var(--bg-color-light)] hover:bg-[var(--bg-color-thin)]"
            } `}
            onClick={() => {
              // handleSetConversation(65 * i, item.id);
              handleSetConversation(item.id);
            }}
          >
            <div className="relative">
              <ImageWithLightBoxAndNoLazy
                src={
                  item.isGroup
                    ? item.avatar
                    : item.participants.find(
                        (item) => item.contact.id !== info.data.id,
                      )?.contact.avatar
                }
                className={`pointer-events-none aspect-square rounded-[50%] bg-[size:170%] shadow-[0px_0px_10px_-7px_var(--shadow-color)] laptop:w-[5rem]`}
                // spinnerClassName="laptop:bg-[size:2rem]"
                // imageClassName="bg-[size:150%]"
              />
              {!item.isGroup ? (
                <OnlineStatusDot
                  online={
                    item.participants.find(
                      (item) => item.contact.id !== info.data.id,
                    )?.contact.isOnline
                  }
                />
              ) : (
                ""
              )}
            </div>
            <div className={`flex h-full w-1/2 grow flex-col`}>
              <CustomLabel
                // className={`text-base
                //   ${item.id === selected ? "text-[var(--text-sub-color)]" : ""}
                //   ${item.lastMessageContact !== info.data.id && item.unSeenMessages > 0 && item.id !== selected ? "text-[var(--main-color)]" : ""}
                //   `}
                className={`text-base ${item.id === selected ? "text-[var(--text-sub-color)]" : "text-[var(--text-main-color)]"} `}
                title={
                  item.isGroup
                    ? item.title
                    : item.participants.find(
                        (item) => item.contact.id !== info.data.id,
                      )?.contact.name
                }
              />
              <CustomLabel
                className={`chat-content text-base 
                  ${
                    item.id === selected
                      ? "text-[var(--text-sub-color-thin)]"
                      : item.lastMessageContact !== info.data.id &&
                          item.unSeenMessages > 0
                        ? "text-[var(--main-color)]"
                        : "text-[var(--text-main-color-blur)]"
                  }`}
                title={item.lastMessage}
              />
            </div>
            <div
              className={`flex h-full shrink-0 flex-col items-end text-base laptop:min-w-[4rem]`}
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
