import { useQueryClient } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { debounce } from "lodash";
import { useCallback, useEffect, useRef, useState } from "react";
import RelightBackground from "../../../components/RelightBackground";
import useEventListener from "../../../hooks/useEventListener";
import { formatDate, formatDisplayDate } from "../../../utils/datetime";
import useConversation from "../../listchat/hooks/useConversation";
import { MessageCache, PendingMessageModel } from "../../listchat/types";
import useMessage from "../hooks/useMessage";
import getMessages from "../services/getMessages";
import MessageContent from "./MessageContent";
const Chatbox = () => {
  console.log("Rendering Chatbox");

  const queryClient = useQueryClient();

  const { data: conversations } = useConversation();
  const { conversationId } = useParams({
    from: "/conversations/_layout/$conversationId",
  });
  const conversation = conversations.filterConversations.find(
    (c) => c.id === conversationId,
  );

  const refPage = useRef<number>(1);

  const { data: messages } = useMessage(conversationId, refPage.current);

  const refChatContent = useRef<HTMLDivElement>();
  const [autoScrollBottom, setAutoScrollBottom] = useState(true);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);

  // useEffect(() => {
  //   if (conversation?.id) {
  //     refPage.current = 1; // reset lại trang đầu khi chọn hội thoại mới
  //   }
  // }, [conversation?.id]);

  const scrollChatContentToBottom = () => {
    refChatContent.current.scrollTop = refChatContent.current.scrollHeight;
  };

  // useEffect(() => {
  //   scrollChatContentToBottom();
  // }, [messages]);

  useEffect(() => {
    refChatContent.current.style.scrollBehavior = "auto";
    if (autoScrollBottom) {
      scrollChatContentToBottom();
      setTimeout(() => {
        refChatContent.current.style.scrollBehavior = "smooth";
      }, 0);
    }
  }, [autoScrollBottom]);

  useEffect(() => {
    refPage.current = 1;
    setAutoScrollBottom(true);
  }, [conversationId]);

  const fetchMoreMessage = async (conversationId: string, hasMore: boolean) => {
    if (!hasMore) return;

    const currentScrollHeight = refChatContent.current.scrollHeight;
    // setFetching(true);

    const newMessages = await getMessages(conversationId, refPage.current);

    queryClient.setQueryData(["message"], (oldData: MessageCache) => {
      return {
        ...oldData,
        messages: [...newMessages.messages, ...oldData.messages],
        hasMore: newMessages.hasMore,
      };
    });

    requestAnimationFrame(() => {
      refChatContent.current.style.scrollBehavior = "auto";
      refChatContent.current.scrollTop =
        refChatContent.current.scrollHeight - currentScrollHeight;
      refChatContent.current.style.scrollBehavior = "smooth";
    });
  };

  const debounceFetch = useCallback(debounce(fetchMoreMessage, 100), []);

  const handleScroll = useCallback(() => {
    const contentEl = refChatContent.current;
    if (!contentEl) return;

    const distanceFromBottom =
      contentEl.scrollHeight - (contentEl.scrollTop + contentEl.clientHeight);

    setShowScrollToBottom(
      contentEl.clientHeight !== 0 &&
        distanceFromBottom >= contentEl.clientHeight / 2,
    );

    if (contentEl.scrollTop === 0) {
      setAutoScrollBottom(false);
      refPage.current += 1;

      debounceFetch(conversation?.id, messages?.hasMore);
    }
  }, [messages?.hasMore, debounceFetch, conversation?.id]);

  useEventListener("scroll", handleScroll, refChatContent.current);

  const groupMessagesByDate = (
    messages: PendingMessageModel[],
  ): Record<string, PendingMessageModel[]> => {
    return messages.reduce(
      (groups, msg) => {
        const date = formatDate(msg.createdTime);
        if (!groups[date]) groups[date] = [];
        groups[date].push(msg);
        return groups;
      },
      {} as Record<string, PendingMessageModel[]>,
    );
  };

  const grouped = groupMessagesByDate(messages?.messages ?? []);

  return (
    <div
      className="chatbox-content relative flex h-full w-full flex-col justify-end overflow-hidden 
       pb-[1rem]"
    >
      <RelightBackground
        data-show={showScrollToBottom}
        onClick={scrollChatContentToBottom}
        className={`absolute bottom-[5%] right-[50%] z-20 transition-all duration-200
            data-[show=false]:pointer-events-none data-[show=true]:pointer-events-auto 
            data-[show=false]:opacity-0 data-[show=true]:opacity-100`}
      >
        <div className="fa fa-arrow-down"></div>
      </RelightBackground>
      <div
        ref={refChatContent}
        // className="hide-scrollbar flex grow flex-col gap-[3rem] overflow-y-scroll scroll-smooth bg-[var(--bg-color-extrathin)] px-[1rem] pb-[2rem]"
        className="hide-scrollbar flex grow flex-col gap-[3.5rem] overflow-y-scroll scroll-smooth px-[1rem]"
      >
        {Object.entries(grouped).map(([date, messages]) => (
          <div key={date} className="flex flex-col gap-[3.5rem]">
            {/* Ngày hiển thị giữa */}
            <div
              className="pointer-events-none mx-auto w-fit rounded-[1rem] 
            bg-[var(--bg-color)] px-[1rem] py-[.5rem] text-center shadow-[0_2px_10px_rgba(0,0,0,0.1)]"
            >
              {formatDisplayDate(date)}
            </div>

            {[...messages].map((message, index) => (
              <MessageContent
                message={message}
                id={conversation.id}
                mt={index === 0}
                getContainerRect={() =>
                  refChatContent.current?.getBoundingClientRect()
                }
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Chatbox;
