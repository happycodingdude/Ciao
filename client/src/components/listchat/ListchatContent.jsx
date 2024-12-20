import { useQueryClient } from "@tanstack/react-query";
import moment from "moment";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { blurImage } from "../../common/Utility";
import { useLoading } from "../../context/LoadingContext";
import {
  useAttachment,
  useConversation,
  useInfo,
  useMessage,
} from "../../hook/CustomHooks";
import CustomLabel from "../common/CustomLabel";
import ImageWithLightBox from "../common/ImageWithLightBox";
import ImageWithLightBoxAndNoLazy from "../common/ImageWithLightBoxAndNoLazy";

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

const ListchatContent = () => {
  console.log("ListChat calling");
  // const { listChat } = useListchatFilter();

  const queryClient = useQueryClient();

  const refChatItems = useRef({});
  const refChats = useRef([]);

  const [selected, setSelected] = useState();
  const [page, setPage] = useState(1);

  const { data: info } = useInfo();
  const { setLoading } = useLoading();
  const { data, isLoading, isRefetching } = useConversation(page);
  const { refetch: refetchMessage } = useMessage(selected, 1);
  const { refetch: refetchAttachments } = useAttachment(selected);

  useEffect(() => {
    if (!data?.filterConversations) return;
    blurImage(".list-chat");

    // Kiểm tra để khi tìm kiếm sẽ không thay đổi danh sách ban đầu
    // setListChat((current) => {
    //   if (current.length === 0) return data.conversations;
    //   return current;
    // });
    // if (listChat.current.length === 0) listChat.current = data.conversations;
  }, [data?.filterConversations]);

  const clickConversation = (id) => {
    setSelected(id);
  };

  const scrollToCenterOfSelected = useCallback(() => {
    const chatElement = refChatItems.current[selected];
    const chatList = refChats.current;

    // Calculate the offset to center the chat
    const chatTop = chatElement.offsetTop;
    const chatHeight = chatElement.offsetHeight;
    const listHeight = chatList.offsetHeight;
    const scrollTop = chatTop - listHeight / 2 + chatHeight / 2;
    chatList.scrollTop = scrollTop;
  }, [selected]);

  useEffect(() => {
    if (!selected) return;
    if (
      !selected ||
      (data?.selected?.id === selected &&
        !data?.clickAndAddMessage &&
        !data?.fromListFriend)
    ) {
      scrollToCenterOfSelected();
      return;
    }

    setLoading(true);
    scrollToCenterOfSelected();
    queryClient.setQueryData(["conversation"], (oldData) => {
      var newConversations = oldData.conversations.map((conversation) => {
        if (conversation.id !== selected) return conversation;
        return {
          ...conversation,
          unSeenMessages: 0,
        };
      });
      return {
        ...oldData,
        selected: oldData.conversations.find((item) => item.id === selected),
        conversations: newConversations,
      };
    });

    refetchMessage();
    refetchAttachments();
  }, [selected]);

  useEffect(() => {
    if (!data) return;

    refChatItems.current = data.filterConversations;

    if (!data || !data?.selected || data?.selected.id === selected) return;

    if (data.quickChatAdd) {
      setSelected(undefined);
      return;
    }

    if (data.clickAndAddMessage) {
      clickAndAddMessage();
      return;
    }

    clickConversation(data.selected.id);

    // listChat.current = data.conversations;
    // setListChat(data.conversations);
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

  return (
    <div
      ref={refChats}
      className="list-chat hide-scrollbar relative flex flex-col gap-[1rem] overflow-y-scroll scroll-smooth p-[1rem] laptop:h-[55rem]"
    >
      {data?.filterConversations?.map((item) => (
        <div
          key={item.id}
          data-key={item.id}
          ref={(el) => (refChatItems.current[item.id] = el)}
          data-user={
            !item.isGroup
              ? item.participants.find((item) => item.contact.id !== info.id)
                  ?.contact.id
              : ""
          }
          className={`chat-item group flex h-[6.5rem] shrink-0 cursor-pointer items-center gap-[1.5rem] overflow-hidden rounded-[1rem]
        py-[.8rem] pl-[.5rem] pr-[1rem] 
        ${
          selected === item.id
            ? `item-active bg-[var(--main-color)]`
            : "hover:bg-[var(--bg-color-extrathin)]"
        } `}
          onClick={() => {
            clickConversation(item.id);
          }}
        >
          <div className="relative">
            {data?.noLazy ? (
              <ImageWithLightBoxAndNoLazy
                src={
                  item.isGroup
                    ? item.avatar
                    : item.participants.find(
                        (item) => item.contact.id !== info.id,
                      )?.contact.avatar
                }
                className={`pointer-events-none aspect-square laptop:w-[5rem]`}
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
                imageClassName="bg-[size:160%]"
              />
            )}
          </div>
          {/* Title & last message */}
          <div className={`flex h-full w-1/2 grow flex-col`}>
            <CustomLabel
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
                : item.lastMessageContact !== info.id && item.unSeenMessages > 0
                  ? "font-[600] text-[var(--main-color-light)]"
                  : "text-[var(--text-main-color-blur)]"
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
  );
};

export default ListchatContent;
