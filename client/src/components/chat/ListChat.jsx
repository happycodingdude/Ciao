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
import ImageWithLightBoxAndNoLazy from "../common/ImageWithLightBoxAndNoLazy";
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

const ListChat = (props) => {
  console.log("ListChat calling");
  const { search } = props;

  const queryClient = useQueryClient();

  const refChatItem = useRef([]);
  const refChats = useRef();
  const refChatsScroll = useRef();

  const [selected, setSelected] = useState();
  const [page, setPage] = useState(1);

  const { data: info } = useInfo();
  const { data, isLoading, isRefetching } = useConversation(page);
  const { refetch: refetchMessage } = useMessage(selected, 1);
  const { refetch: refetchAttachments } = useAttachment(selected);

  const refAllConversation = useRef();

  useEffect(() => {
    if (!refAllConversation.current) return;

    queryClient.setQueryData(["conversation"], (oldData) => {
      return {
        ...oldData,
        conversations:
          search === ""
            ? refAllConversation.current
            : refAllConversation.current.filter((conv) =>
                conv.isGroup
                  ? conv.title.toLowerCase().includes(search.toLowerCase())
                  : conv.participants
                      .find((item) => item.contact.id !== info.id)
                      ?.contact.name.toLowerCase()
                      .includes(search.toLowerCase()),
              ),
      };
    });
  }, [search]);

  useEffect(() => {
    blurImageOLD(".list-chat");
    if (!refAllConversation.current)
      refAllConversation.current = data?.conversations;
  }, [data?.conversations]);

  const clickConversation = (id) => {
    setSelected(id);
  };

  useEffect(() => {
    if (
      !selected ||
      (data?.selected?.id === selected &&
        !data?.clickAndAddMessage &&
        !data?.fromListFriend)
    )
      return;

    queryClient.setQueryData(["conversation"], (oldData) => {
      var newConversations = oldData.conversations.map((conversation) => {
        if (conversation.id !== selected) return conversation;
        return {
          ...conversation,
          unSeenMessages: 0,
        };
      });
      return {
        selected: oldData.conversations.find((item) => item.id === selected),
        conversations: newConversations,
      };
    });
    refetchMessage();
    refetchAttachments();
  }, [selected]);

  useEffect(() => {
    if (!data?.selected || data?.selected.id === selected) return;

    if (data?.quickChatAdd) {
      // setSelected(undefined);
      return;
    }

    if (data?.clickAndAddMessage) {
      clickAndAddMessage();
      return;
    }

    clickConversation(data.selected.id);
  }, [data]);

  const clickAndAddMessage = () => {
    clickConversation(data.selected.id);
    setTimeout(() => {
      queryClient.setQueryData(["message"], (oldData) => {
        return {
          ...oldData,
          messages: [data.message, ...oldData.messages],
        };
      });
    }, 700);
  };

  // moment.locale("en", {
  //   relativeTime: {
  //     future: "in %s",
  //     past: "%s",
  //     s: "1m",
  //     ss: "1m",
  //     m: "%dm",
  //     mm: "%dm",
  //     h: "%dh",
  //     hh: "%dh",
  //     d: "a day",
  //     dd: "%dd",
  //     M: "a month",
  //     MM: "%dM",
  //     y: "a year",
  //     yy: "%dY",
  //   },
  // });

  const scrollListChatToBottom = () => {
    refChats.current.scrollTop = refChats.current.scrollHeight;
  };

  return (
    <>
      <div
        ref={refChats}
        className="list-chat hide-scrollbar relative flex grow flex-col gap-[1rem] overflow-y-scroll scroll-smooth p-[1rem] desktop:h-[50rem]"
      >
        {isLoading || isRefetching ? <LocalLoading /> : ""}
        {data?.conversations.map((item, i) => (
          <div
            key={item.id}
            data-key={item.id}
            data-user={
              !item.isGroup
                ? item.participants.find((item) => item.contact.id !== info.id)
                    ?.contact.id
                : ""
            }
            ref={(element) => {
              refChatItem.current[i] = element;
            }}
            // className={`chat-item group flex h-[6.5rem] shrink-0 cursor-pointer items-center gap-[1.5rem] overflow-hidden rounded-[1rem]
            // py-[.8rem] pl-[.5rem] pr-[1rem]
            // ${
            //   selected === item.id
            //     ? `item-active bg-gradient-to-tr from-[var(--main-color)] to-[var(--main-color-extrathin)]`
            //     : "bg-[var(--bg-color)] hover:bg-[var(--bg-color-extrathin)]"
            // } `}
            className={`chat-item group flex h-[6.5rem] shrink-0 cursor-pointer items-center gap-[1.5rem] overflow-hidden rounded-[1rem]
              py-[.8rem] pl-[.5rem] pr-[1rem] 
              ${
                selected === item.id
                  ? `item-active bg-[var(--main-color)]`
                  : "bg-[var(--bg-color)] hover:bg-[var(--bg-color-extrathin)]"
              } `}
            onClick={() => {
              // clickConversation(65 * i, item.id);
              clickConversation(item.id);
            }}
          >
            <div className="relative">
              {item.noLazy ? (
                <ImageWithLightBoxAndNoLazy
                  src={
                    item.isGroup
                      ? item.avatar
                      : item.participants.find(
                          (item) => item.contact.id !== info.id,
                        )?.contact.avatar
                  }
                  className={`pointer-events-none aspect-square laptop:w-[5rem]`}
                  spinnerClassName="laptop:bg-[size:2rem]"
                  imageClassName="bg-[size:160%]"
                />
              ) : (
                <ImageWithLightBox
                  src={
                    item.isGroup
                      ? item.avatar
                      : item.participants.find(
                          (item) => item.contact.id !== info.id,
                        )?.contact.avatar
                  }
                  className={`pointer-events-none aspect-square laptop:w-[5rem]`}
                  spinnerClassName="laptop:bg-[size:2rem]"
                  imageClassName="bg-[size:160%]"
                />
              )}
              {/* <ImageWithLightBox
                src={
                  item.isGroup
                    ? item.avatar
                    : item.participants.find(
                        (item) => item.contact.id !== info.id,
                      )?.contact.avatar
                }
                className={`pointer-events-none aspect-square laptop:w-[5rem]`}
                spinnerClassName="laptop:bg-[size:2rem]"
                imageClassName="bg-[size:160%]"
              /> */}
              {/* {!item.isGroup ? (
                <OnlineStatusDot
                  online={
                    item.participants.find(
                      (item) => item.contact.id !== info.id,
                    )?.contact.isOnline
                  }
                />
              ) : (
                ""
              )} */}
            </div>
            {/* Title & last message */}
            <div className={`flex h-full w-1/2 grow flex-col`}>
              <CustomLabel
                // className={`text-base
                //   ${item.id === selected ? "text-[var(--text-sub-color)]" : ""}
                //   ${item.lastMessageContact !== info.id && item.unSeenMessages > 0 && item.id !== selected ? "text-[var(--main-color)]" : ""}
                //   `}
                className={`${item.id === selected ? "text-[var(--text-sub-color)]" : "text-[var(--text-main-color)]"} `}
                title={
                  item.isGroup
                    ? item.title
                    : item.participants.find(
                        (item) => item.contact.id !== info.id,
                      )?.contact.name
                }
              />
              <CustomLabel
                className={`
                  ${
                    item.id === selected
                      ? "text-[var(--text-sub-color-thin)]"
                      : item.lastMessageContact !== info.id &&
                          item.unSeenMessages > 0
                        ? "font-[600] text-[var(--main-color-light)]"
                        : "text-[var(--text-main-color-blur)]"
                  }`}
                // className={`chat-content`}
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
