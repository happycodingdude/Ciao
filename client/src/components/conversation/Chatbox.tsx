import { useQueryClient } from "@tanstack/react-query";
import { debounce } from "lodash-es";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useConversation from "../../hooks/useConversation";
import useEventListener from "../../hooks/useEventListener";
import useMessage from "../../hooks/useMessage";
import { Route } from "../../routes/_layout.conversations.$conversationId";
import { getMessages } from "../../services/message.service";
import {
  GroupedMessage,
  MessageCache,
  PendingMessageModel,
} from "../../types/message.types";
import { formatDate, formatDisplayDate } from "../../utils/datetime";
import RelightBackground from "../common/RelightBackground";
import MessageContent from "../message/MessageContent";

const Chatbox = () => {
  const queryClient = useQueryClient();

  const { data: conversations } = useConversation();
  if (!conversations) return null;

  const { conversationId } = Route.useParams();
  const conversation = conversations?.conversations?.find(
    (c) => c.id === conversationId,
  );

  const refPage = useRef<number>(1);
  const { data: messages } = useMessage(conversationId, refPage.current);

  const refChatContent = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const oldLastMsgRef = useRef<PendingMessageModel | null>(null);
  const isInitialLoad = useRef(true);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);

  const scrollChatContentToBottom = (behavior: ScrollBehavior) => {
    bottomRef.current?.scrollIntoView({
      behavior: behavior as ScrollBehavior,
      block: "end",
    });
  };

  useEffect(() => {
    refPage.current = 1;
    isInitialLoad.current = true;
    oldLastMsgRef.current = null;

    if (refChatContent.current) {
      refChatContent.current.style.scrollBehavior = "auto";
    }
  }, [conversationId]);

  useEffect(() => {
    if (!messages || messages.messages.length === 0) return;

    const container = refChatContent.current;
    const currentLastMsg = messages.messages[messages.messages.length - 1];

    if (isInitialLoad.current) {
      if (container) {
        container.style.scrollBehavior = "auto";
        container.scrollTop = container.scrollHeight;
      }

      isInitialLoad.current = false;

      requestAnimationFrame(() => {
        if (container) {
          container.style.scrollBehavior = "smooth";
        }
      });
    } else if (currentLastMsg?.id !== oldLastMsgRef.current?.id) {
      scrollChatContentToBottom("smooth");
    }

    oldLastMsgRef.current = currentLastMsg;
  }, [messages]);

  const lockScroll = (el: HTMLElement) => {
    const lockedTop = el.scrollTop;

    const preventScroll = (e: Event) => {
      e.preventDefault();
      el.scrollTop = lockedTop;
    };

    el.addEventListener("wheel", preventScroll, { passive: false });
    el.addEventListener("touchmove", preventScroll, { passive: false });

    return () => {
      el.removeEventListener("wheel", preventScroll);
      el.removeEventListener("touchmove", preventScroll);
    };
  };

  const fetchMoreMessage = async (conversationId: string) => {
    const el = refChatContent.current;

    const currentData: MessageCache | undefined = queryClient.getQueryData([
      "message",
      conversationId,
    ]);
    if (!currentData?.hasMore || !el) return;

    const unlockScroll = lockScroll(el);

    const prevScrollHeight = el.scrollHeight;

    const newMessages = await getMessages(conversationId, refPage.current);

    queryClient.setQueryData(
      ["message", conversationId],
      (oldData: MessageCache) => {
        return {
          ...oldData,
          messages: [...newMessages.messages, ...(oldData.messages ?? [])],
          hasMore: newMessages.hasMore,
        };
      },
    );

    isFetching.current = false;

    requestAnimationFrame(() => {
      const heightDiff = el.scrollHeight - prevScrollHeight;

      el.style.scrollBehavior = "auto";
      el.scrollTop += heightDiff;
      el.style.scrollBehavior = "smooth";

      unlockScroll();
    });
  };

  const debounceFetch = useMemo(
    () => debounce(fetchMoreMessage, 100),
    [fetchMoreMessage],
  );

  const isFetching = useRef(false);

  const handleScroll = useCallback(() => {
    const contentEl = refChatContent.current;
    if (!contentEl || isFetching.current || !messages || !conversation) return;

    const distanceFromBottom =
      contentEl.scrollHeight - (contentEl.scrollTop + contentEl.clientHeight);
    setShowScrollToBottom(
      contentEl.clientHeight !== 0 &&
        distanceFromBottom >= contentEl.clientHeight / 2,
    );

    const isNearTop = contentEl.scrollTop === 0;

    if (isNearTop && messages.hasMore) {
      isFetching.current = true;
      refPage.current += 1;

      debounceFetch(conversation.id ?? "");
    }
  }, [debounceFetch, conversation?.id]);

  useEventListener("scroll", handleScroll, refChatContent.current);

  const groupMessagesByDate = (
    messages: PendingMessageModel[],
  ): Record<string, GroupedMessage[]> => {
    return messages.reduce(
      (groups, msg) => {
        const date = formatDate(msg.createdTime ?? "");

        if (!groups[date]) groups[date] = [];

        const dateGroups = groups[date];
        const lastGroup = dateGroups[dateGroups.length - 1];

        if (lastGroup && lastGroup.contactId === msg.contactId) {
          lastGroup.messages.push(msg);
        } else {
          dateGroups.push({
            contactId: msg.contactId ?? "",
            messages: [msg],
          });
        }

        return groups;
      },
      {} as Record<string, GroupedMessage[]>,
    );
  };

  const grouped = groupMessagesByDate(messages?.messages ?? []);
  const groupedEntries = Object.entries(grouped);

  return (
    <div className="chatbox-content relative flex h-full w-full flex-col justify-end overflow-hidden pb-4">
      <RelightBackground
        data-show={showScrollToBottom}
        onClick={() => scrollChatContentToBottom("smooth")}
        className={`absolute bottom-[5%] right-[50%] z-20 transition-all duration-200
            data-[show=false]:pointer-events-none data-[show=true]:pointer-events-auto
            data-[show=false]:opacity-0 data-[show=true]:opacity-100`}
      >
        <div className="fa fa-arrow-down"></div>
      </RelightBackground>
      <div
        ref={refChatContent}
        className="flex grow flex-col overflow-x-hidden overflow-y-scroll scroll-smooth p-4"
      >
        {groupedEntries.map(([date, blocks], groupIndex) => (
          <div
            key={date}
            className={`flex flex-col
              ${groupIndex === 0 ? "mt-auto" : ""} `}
          >
            <div className="text-3xs rounded-4xl laptop:mb-8 pointer-events-none mx-auto w-fit bg-white px-8 py-1 text-center shadow-[0_2px_10px_rgba(0,0,0,0.1)]">
              {formatDisplayDate(date)}
            </div>

            {blocks.map((block, blockIndex) => {
              const firstMessage = block.messages[0];
              if (firstMessage.type === "system") {
                return (
                  <div
                    key={blockIndex}
                    className="rounded-4xl pointer-events-none mx-auto mb-8 w-fit bg-white px-8 py-1 text-center shadow-[0_2px_10px_rgba(0,0,0,0.1)]"
                  >
                    {firstMessage.content}
                  </div>
                );
              }
              return (
                <div key={blockIndex} className="mb-6 flex flex-col gap-3">
                  {block.messages.map((message) => (
                    <MessageContent
                      key={message.id}
                      message={message}
                      id={conversation?.id ?? ""}
                      showName={message === firstMessage}
                      showAvatar={message === firstMessage}
                      getContainerRect={() =>
                        refChatContent.current?.getBoundingClientRect() ?? new DOMRect()
                      }
                    />
                  ))}
                </div>
              );
            })}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};

export default Chatbox;
