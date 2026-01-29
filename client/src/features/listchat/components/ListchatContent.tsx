import { useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useEffect, useRef } from "react";
import { flushSync } from "react-dom";
import CustomLabel from "../../../components/CustomLabel";
import ImageWithLightBoxAndNoLazy from "../../../components/ImageWithLightBoxAndNoLazy";
import OnlineStatusDot from "../../../components/OnlineStatusDot";
import useChatDetailToggles from "../../../hooks/useChatDetailToggles";
import useConversation from "../../../hooks/useConversation";
import useInfo from "../../../hooks/useInfo";
import useListchatFilter from "../../../hooks/useListchatFilter";
import useLoading from "../../../hooks/useLoading";
import useLocalStorage from "../../../hooks/useLocalStorage";
import blurImage from "../../../utils/blurImage";
import { isPhoneScreen } from "../../../utils/getScreenSize";
import getMessages from "../../chatbox/services/getMessages";
import getAttachments from "../../chatdetail/services/getAttachments";
import { ConversationCache } from "../types";

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

// moment.updateLocale("en", {
//   relativeTime: {
//     future: "in %s",
//     past: "%s",
//     s: "1m",
//     ss: "1m",
//     m: "1m",
//     mm: "%dm",
//     h: "1h",
//     hh: "%dh",
//     d: "1d",
//     dd: "%dd",
//     M: "1M",
//     MM: "%dM",
//     y: "1Y",
//     yy: "%dY",
//   },
// });

const ListchatContent = () => {
  const queryClient = useQueryClient();
  const { setToggle } = useChatDetailToggles();
  const { setFilter } = useListchatFilter();
  const [conversationId] = useLocalStorage<string>("conversationId");

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

  /* MARK: Click conversation */
  const clickConversation = async (id: string) => {
    if (conversationId === id) return;

    flushSync(() => {
      setLoading(true);
    });
    if (isPhoneScreen()) {
      setToggle(null);
      setFilter("all");
    }
    queryClient.setQueryData(["conversation"], (oldData: ConversationCache) => {
      const data: ConversationCache = {
        ...oldData,
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

  // const scrollToCenterOfSelected = useCallback(() => {
  //   if (!data || !data.selected) return;

  //   const chatElement = refChatItems.current[data?.selected.id];
  //   if (!chatElement) return;

  //   const chatList = refChats.current;

  //   // Calculate the offset to center the chat
  //   const chatTop = chatElement.offsetTop;
  //   const chatHeight = chatElement.offsetHeight;
  //   const listHeight = chatList.offsetHeight;
  //   const scrollTop = chatTop - listHeight / 2 + chatHeight / 2;
  //   chatList.scrollTop = scrollTop;
  // }, [conversationId]);

  if (!data) return;

  return (
    <div
      ref={refChats}
      className="list-chat hide-scrollbar relative flex h-[85vh] flex-col gap-4 overflow-y-scroll scroll-smooth p-4"
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
            className={`chat-item phone:h-26 tablet:h-22 laptop:h-26 group flex shrink-0 cursor-pointer items-center gap-6 
              overflow-hidden rounded-2xl py-2 pl-2 pr-4
        ${
          conversationId === item.id && !isPhoneScreen()
            ? `item-active bg-(--main-color)`
            : "hover:bg-(--bg-color-extrathin)"
        } `}
            onClick={() => {
              clickConversation(item.id);
            }}
          >
            <div className="relative">
              {/* MARK: CONVERSATION AVATAR */}
              <ImageWithLightBoxAndNoLazy
                src={
                  item.isGroup
                    ? item.avatar
                    : item.members.find((item) => item.contact.id !== info.id)
                        ?.contact.avatar
                }
                className={`loaded phone:w-20 tablet:w-16 laptop:w-20 pointer-events-none aspect-square`}
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
            <div className={`flex h-full w-1/2 grow flex-col gap-2`}>
              {/* MARK: CONVERSATION TITLE */}
              <CustomLabel
                className={`${item.id === conversationId ? "text-(--text-sub-color)" : "text-(--text-main-color)"} 
                font-['Be_Vietnam_Pro'] font-semibold`}
                title={
                  item.isGroup
                    ? item.title
                    : item.members.find((item) => item.contact.id !== info.id)
                        ?.contact.name
                }
              />
              {/* MARK: LAST MESSAGE */}
              <CustomLabel
                className={`
              ${
                item.id === conversationId
                  ? "text-(--text-sub-color-thin)"
                  : item.unSeen
                    ? "text-(--danger-text-color)"
                    : "text-(--text-main-color-blur)"
              }`}
                title={item.lastMessage}
              />
            </div>
            <div className={`flex h-full flex-col items-end`}>
              <p>
                {item.lastMessageTime === null
                  ? ""
                  : dayjs(item.lastMessageTime).fromNow()}
              </p>
            </div>
          </div>
        ))}
    </div>
  );
};

export default ListchatContent;
