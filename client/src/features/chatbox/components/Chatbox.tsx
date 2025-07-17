import { useQueryClient } from "@tanstack/react-query";
import { debounce } from "lodash";
import React, { useCallback, useEffect, useRef, useState } from "react";
import RelightBackground from "../../../components/RelightBackground";
import useEventListener from "../../../hooks/useEventListener";
import useConversation from "../../listchat/hooks/useConversation";
import { MessageCache } from "../../listchat/types";
import useMessage from "../hooks/useMessage";
import getMessages from "../services/getMessages";
import MessageContent from "./MessageContent";
const Chatbox = () => {
  const queryClient = useQueryClient();

  const refPage = useRef<number>(1);

  const { data: conversations } = useConversation();
  // const { data: messages } = useMessage(
  //   conversations?.selected?.id,
  //   refPage.current,
  // );

  const { data: messages } = useMessage();

  const refChatContent = useRef<HTMLDivElement>();
  const [autoScrollBottom, setAutoScrollBottom] = useState(true);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);

  // useEffect(() => {
  //   if (conversations?.selected?.id) {
  //     refPage.current = 1; // reset lại trang đầu khi chọn hội thoại mới
  //   }
  // }, [conversations?.selected?.id]);

  const scrollChatContentToBottom = () => {
    refChatContent.current.scrollTop = refChatContent.current.scrollHeight;
  };

  useEffect(() => {
    scrollChatContentToBottom();
  }, [messages]);

  // useEffect(() => {
  //   refChatContent.current.style.scrollBehavior = "auto";
  //   if (autoScrollBottom) {
  //     scrollChatContentToBottom();
  //     setTimeout(() => {
  //       refChatContent.current.style.scrollBehavior = "smooth";
  //     }, 0);
  //   }
  // }, [autoScrollBottom]);

  useEffect(() => {
    refPage.current = 1;
    // setAutoScrollBottom(true);
  }, [conversations?.selected]);

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

  // const handleScroll = useCallback(() => {
  //   // Nếu cuộn lên 1 khoảng lớn hơn kích thước ô chat thì hiện nút scroll to bottom
  //   const distanceFromBottom =
  //     refChatContent.current.scrollHeight -
  //     (refChatContent.current.scrollTop + refChatContent.current.clientHeight);
  //   if (
  //     refChatContent.current.clientHeight !== 0 &&
  //     distanceFromBottom >= refChatContent.current.clientHeight / 2
  //   )
  //     setShowScrollToBottom(true);
  //   else setShowScrollToBottom(false);

  //   // Nếu cuộn lên top và còn dữ liệu cũ -> lấy thêm dữ liệu
  //   if (refChatContent.current.scrollTop === 0) {
  //     setAutoScrollBottom(false);
  //     refPage.current = refPage.current + 1;
  //     debounceFetch(conversations?.selected.id, messages.hasMore);
  //   }
  // }, [conversations?.selected, messages]);
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

      debounceFetch(conversations?.selected?.id, messages?.hasMore);
    }
  }, [messages?.hasMore, debounceFetch, conversations?.selected?.id]);

  useEventListener("scroll", handleScroll, refChatContent.current);

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
        {messages?.messages
          ? [...messages?.messages].map((message, index) => (
              <MessageContent
                message={message}
                id={conversations.selected.id}
                mt={index === 0}
                getContainerRect={() =>
                  refChatContent.current?.getBoundingClientRect()
                }
              />
            ))
          : ""}
      </div>
    </div>
  );
};

export default Chatbox;
