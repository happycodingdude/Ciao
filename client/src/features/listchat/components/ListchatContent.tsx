import { useQueryClient } from "@tanstack/react-query";
import moment from "moment";
import React, { useCallback, useEffect, useRef } from "react";
import { flushSync } from "react-dom";
import CustomLabel from "../../../components/CustomLabel";
import ImageWithLightBoxAndNoLazy from "../../../components/ImageWithLightBoxAndNoLazy";
import OnlineStatusDot from "../../../components/OnlineStatusDot";
import useLoading from "../../../hooks/useLoading";
import blurImage from "../../../utils/blurImage";
import { isPhoneScreen } from "../../../utils/getScreenSize";
import useInfo from "../../authentication/hooks/useInfo";
import useChatDetailToggles from "../../chatbox/hooks/useChatDetailToggles";
import getMessages from "../../chatbox/services/getMessages";
import getAttachments from "../../chatdetail/services/getAttachments";
import useConversation from "../hooks/useConversation";
import { ConversationCache, ConversationModel } from "../types";

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

moment.updateLocale("en", {
  relativeTime: {
    future: "in %s",
    past: "%s",
    s: "1m",
    ss: "1m",
    m: "1m",
    mm: "%dm",
    h: "1h",
    hh: "%dh",
    d: "1d",
    dd: "%dd",
    M: "1M",
    MM: "%dM",
    y: "1Y",
    yy: "%dY",
  },
});

const ListchatContent = () => {
  const queryClient = useQueryClient();
  const { toggle, setToggle } = useChatDetailToggles();

  const refPage = useRef<number>(1);
  // const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: info } = useInfo();
  const { setLoading } = useLoading();
  const { data } = useConversation(refPage.current);

  // const { refetch: refetchMessage } = useMessage(data?.selected?.id, 1);
  // const { refetch: refetchAttachments } = useAttachment(data?.selected?.id);

  const refChatItems = useRef<{ [key: string]: HTMLDivElement }>({});
  const refChats = useRef<HTMLDivElement>();

  useEffect(() => {
    if (!data) return;
    blurImage(".list-chat");
  }, [data?.filterConversations]);

  const clickConversation = async (id: string) => {
    if (data.selected?.id === id) return;

    if (isPhoneScreen()) {
      setToggle(null);
    } else {
      flushSync(() => {
        setLoading(true);
      });
    }

    queryClient.setQueryData(["conversation"], (oldData: ConversationCache) => {
      const updatedConversations = oldData.conversations.map((conversation) => {
        if (conversation.id !== id) return conversation;
        return {
          ...conversation,
          members: conversation.members.map((mem) =>
            mem.contact.id === info.id ? { ...mem, unSeenMessages: 0 } : mem,
          ),
        } as ConversationModel;
      });
      const data: ConversationCache = {
        ...oldData,
        selected: updatedConversations.find((item) => item.id === id),
        conversations: updatedConversations,
        filterConversations: updatedConversations,
        reload: true,
        quickChat: false,
        message: null,
      };
      return data;
    });

    const [messages, attachments] = await Promise.all([
      getMessages(id, 1),
      getAttachments(id),
    ]);

    queryClient.setQueryData(["message"], messages);
    queryClient.setQueryData(["attachment"], attachments);

    setLoading(false);
  };

  const scrollToCenterOfSelected = useCallback(() => {
    if (!data || !data.selected) return;

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

  if (!data) return;

  return (
    <div
      ref={refChats}
      className="list-chat hide-scrollbar relative flex h-[85vh] flex-col gap-[1rem] overflow-y-scroll scroll-smooth p-[1rem]"
    >
      {data.filterConversations
        .filter((conv) =>
          conv.members.some(
            (mem) => mem.contact.id === info.id && !mem.isDeleted,
          ),
        )
        .map((item) => (
          <div
            key={item.id}
            data-key={item.id}
            ref={(el) => (refChatItems.current[item.id] = el)}
            data-user={
              !item.isGroup
                ? item.members.find((item) => item.contact.id !== info.id)
                    ?.contact.id
                : ""
            }
            className={`chat-item group flex shrink-0 cursor-pointer items-center gap-[1.5rem] overflow-hidden rounded-[1rem] py-[.8rem] pl-[.5rem] pr-[1rem] 
              phone:h-[6.5rem] tablet:h-[5.5rem] laptop:h-[6.5rem] 
        ${
          data.selected?.id === item.id
            ? `item-active bg-[var(--main-color)]`
            : "hover:bg-[var(--bg-color-extrathin)]"
        } `}
            onClick={() => {
              clickConversation(item.id);
            }}
          >
            <div className="relative">
              <ImageWithLightBoxAndNoLazy
                src={
                  item.isGroup
                    ? item.avatar
                    : item.members.find((item) => item.contact.id !== info.id)
                        ?.contact.avatar
                }
                className={`loaded pointer-events-none aspect-square phone:w-[5rem] tablet:w-[4rem] laptop:w-[5rem]`}
                circle
              />
              {!item.isGroup ? (
                <OnlineStatusDot
                  className="right-0 top-[-5%]"
                  online={
                    item.members.find((item) => item.contact.id !== info.id)
                      ?.contact.isOnline
                  }
                />
              ) : (
                ""
              )}
            </div>
            {/* Title & last message */}
            <div className={`flex h-full w-1/2 grow flex-col gap-[.5rem]`}>
              <CustomLabel
                className={`${item.id === data.selected?.id ? "text-[var(--text-sub-color)]" : "text-[var(--text-main-color)]"} `}
                title={
                  item.isGroup
                    ? item.title
                    : item.members.find((item) => item.contact.id !== info.id)
                        ?.contact.name
                }
              />
              <CustomLabel
                className={`
              ${
                // item.id === data.selected?.id
                //   ? "text-[var(--text-sub-color-thin)]"
                //   : item.members.find((mem) => mem.contact.id === info.id)
                //         .unSeenMessages > 0
                //     ? "text-[var(--danger-text-color)]"
                //     : "text-[var(--text-main-color-blur)]"
                item.id === data.selected?.id
                  ? "text-[var(--text-sub-color-thin)]"
                  : item.unSeen
                    ? "text-[var(--danger-text-color)]"
                    : "text-[var(--text-main-color-blur)]"
              }`}
                title={item.lastMessage}
              />
            </div>
            <div
              // className={`flex h-full shrink-0 flex-col items-end phone:min-w-[3rem] laptop:min-w-[4rem]`}
              className={`flex h-full flex-col items-end`}
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
