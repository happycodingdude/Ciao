import { useQueryClient } from "@tanstack/react-query";
import moment from "moment";
import React, { useCallback, useEffect, useRef, useState } from "react";
import CustomLabel from "../../../components/CustomLabel";
import ImageWithLightBox from "../../../components/ImageWithLightBox";
import ImageWithLightBoxAndNoLazy from "../../../components/ImageWithLightBoxAndNoLazy";
import useLoading from "../../../hooks/useLoading";
import blurImage from "../../../utils/blurImage";
import useInfo from "../../authentication/hooks/useInfo";
import useAttachment from "../../chatdetail/hooks/useAttachment";
import useConversation from "../hooks/useConversation";

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
  console.log("ListchatContent calling");
  // const { listChat } = useListchatFilter();

  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);

  const { data: info } = useInfo();
  const { setLoading } = useLoading();
  const { data } = useConversation(page);
  // const { refetch: refetchMessage } = useMessage(data?.selected?.id, 1);
  const { refetch: refetchAttachments } = useAttachment(data?.selected?.id);

  const refChatItems = useRef({});
  const refChats = useRef([]);

  useEffect(() => {
    if (!data?.filterConversations) return;
    blurImage(".list-chat");
  }, [data?.filterConversations]);

  const clickConversation = (id) => {
    if (data?.selected?.id === id) return;
    setLoading(true);
    queryClient.setQueryData(["conversation"], (oldData) => {
      var newConversations = oldData.conversations.map((conversation) => {
        if (conversation.id !== id) return conversation;
        return {
          ...conversation,
          unSeenMessages: 0,
        };
      });
      return {
        ...oldData,
        selected: oldData.conversations.find((item) => item.id === id),
        conversations: newConversations,
        // filterConversations: newConversations,
        quickChatAdd: false,
        clickAndAddMessage: false,
      };
    });
  };

  const scrollToCenterOfSelected = useCallback(() => {
    if (!data?.selected) return;

    const chatElement = refChatItems.current[data?.selected.id];
    if (!chatElement) return;

    const chatList = refChats.current;

    // Calculate the offset to center the chat
    const chatTop = chatElement.offsetTop;
    const chatHeight = chatElement.offsetHeight;
    const listHeight = chatList.offsetHeight;
    const scrollTop = chatTop - listHeight / 2 + chatHeight / 2;
    chatList.scrollTop = scrollTop;
  }, [data?.selected?.id]);

  useEffect(() => {
    if (!data?.selected || (data?.quickChatAdd && !data?.fromListFriend)) {
      scrollToCenterOfSelected();
      return;
    }

    // setLoading(true);
    scrollToCenterOfSelected();
    // refetchMessage();
    refetchAttachments();
  }, [data?.selected?.id]);

  useEffect(() => {
    if (!data || !data?.selected) return;

    if (data.quickChatAdd) {
      // setSelected(undefined);
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

  useEffect(() => {
    if (!data?.filterConversations) return;
    data.filterConversations.forEach((item) => {
      refChatItems.current[item.id] = item;
    });
  }, [data?.filterConversations]);

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
      className="list-chat hide-scrollbar relative flex h-[85vh] flex-col gap-[1rem] overflow-y-scroll scroll-smooth p-[1rem]"
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
          data?.selected?.id === item.id
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
                className={`loaded pointer-events-none aspect-square laptop:w-[5rem]`}
                imageClassName="bg-[size:170%]"
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
              className={`${item.id === data?.selected?.id ? "text-[var(--text-sub-color)]" : "text-[var(--text-main-color)]"} `}
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
              item.id === data?.selected?.id
                ? "text-[var(--text-sub-color-thin)]"
                : item.lastMessageContact !== info.id && item.unSeenMessages > 0
                  ? "text-[var(--main-color-bold)]"
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
