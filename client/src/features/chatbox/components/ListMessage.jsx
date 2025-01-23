import { useQueryClient } from "@tanstack/react-query";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { VariableSizeList as List } from "react-window";
import LocalLoading from "../../../components/LocalLoading";
import RelightBackground from "../../../components/RelightBackground";
import useLoading from "../../../hooks/useLoading";
import blurImage from "../../../utils/blurImage";
import useMessage from "../hooks/useMessage";
import getMessages from "../services/getMessages";
import MessageContent from "./MessageContent";

const itemSize = 80;
const attachmentSize = 300;

const ListMessage = (props) => {
  const { conversationId } = props;

  const queryClient = useQueryClient();

  const { loading, setLoading } = useLoading();

  const [hasMore, setHasMore] = useState(true);
  const [listHeight, setListHeight] = useState(0); // To store calculated height
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);

  const containerRef = useRef(null);
  const listRef = useRef(null);
  const scrollOffsetRef = useRef(0); // Track scroll offset
  const itemSizes = useRef(new Map()); // Tracks sizes of individual items for accurate offset calculations
  const isFetching = useRef(false); // Prevent multiple fetch triggers
  const scrollBot = useRef(false);
  // const heightCache = useRef([]);

  const page = useRef(1);

  const { data, isLoading, isRefetching } = useMessage(
    conversationId,
    setHasMore,
  );

  useEffect(() => {
    if (isLoading || isRefetching) setLoading(true);
    else setLoading(false);
  }, [isLoading, isRefetching]);

  useEffect(() => {
    if (!loading) scrollToBottomAtFirstRender();
  }, [loading]);

  // Fetch initial messages
  useEffect(() => {
    page.current = 1;
    scrollBot.current = false;
  }, [conversationId]);

  // Adjust list height dynamically
  useEffect(() => {
    if (containerRef.current) {
      setListHeight(containerRef.current.clientHeight);
    }
    const handleResize = () => {
      if (containerRef.current) {
        setListHeight(containerRef.current.clientHeight);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (!data) return;

    if (listRef.current) listRef.current.resetAfterIndex(0); // Reset cache for all items

    blurImage(".chatbox-content");

    // Scrolling to bottom after first messages fetching
    scrollToBottomAtFirstRender();

    // If new message is being sent
    if (data.newMessage) {
      scrollToBottom();
      return;
    }
  }, [data]);

  const scrollToBottomAtFirstRender = () => {
    if (scrollBot.current || !listRef.current) return;
    scrollBot.current = true;
    // Remove smooth scrolling during first scroll
    const totalItems = data?.messages.length || 0;
    listRef.current._outerRef.classList.remove("scroll-smooth");
    listRef.current.scrollToItem(totalItems - 1, "end");
    setTimeout(() => {
      listRef.current._outerRef.classList.add("scroll-smooth");
    }, 0);
  };

  const scrollToBottom = () => {
    if (!listRef.current) return;
    const totalItems = data?.messages.length || 0;
    listRef.current.scrollToItem(totalItems - 1, "end");
    setTimeout(() => {
      listRef.current._outerRef.classList.add("scroll-smooth");
    }, 0);
  };

  // Handle fetching more messages
  const fetchMoreMessages = useCallback(async () => {
    if (!hasMore || isFetching.current) return; // Prevent multiple fetch triggers

    isFetching.current = true; // Start fetching

    page.current = page.current + 1;
    const newMessages = await getMessages(conversationId, page.current);
    setHasMore(newMessages.hasMore);

    // Append new data to the top
    queryClient.setQueryData(["message", conversationId], (oldData) => {
      return {
        ...oldData,
        messages: [...newMessages.messages, ...(oldData.messages || [])],
      };
    });

    isFetching.current = false; // Stop fetching

    const newMessageSizes = [...newMessages.messages].map(
      (_, index) => itemSizes.current.get(index) || itemSize,
    );
    const totalNewHeight = newMessageSizes.reduce((acc, size) => acc + size, 0);

    // Save the current scroll position
    const currentOffset = scrollOffsetRef.current;

    // Reset the list cache and maintain scroll position
    if (listRef.current) {
      listRef.current._outerRef.classList.remove("scroll-smooth");
      listRef.current.resetAfterIndex(0); // Reset cache for all items
      listRef.current.scrollTo(currentOffset + totalNewHeight);
      setTimeout(() => {
        listRef.current._outerRef.classList.add("scroll-smooth");
      }, 0);
    }
  }, [hasMore, data?.messages.length]);

  // Render a single message item
  const MessageRow = ({ index, style }) => {
    return (
      <div
        id={`message-${data?.messages[index].id}`}
        style={{
          ...style,
          height: getItemSize(index),
        }}
      >
        <MessageContent message={data?.messages[index]} id={conversationId} />
      </div>
    );
  };

  // Function to get the height of each message (all are fixed size here)
  const getItemSize = (index) => {
    const message = data?.messages[index];

    // Calculate dynamic height based on message content
    if (message) {
      if (message.attachments.length > 0) {
        return attachmentSize; // Height for messages with attachments
      }

      // If text, calculate height dynamically based on content
      const element = document.getElementById(`message-${message.id}`);
      if (element) {
        return element.scrollHeight >= 150
          ? element.scrollHeight + 10
          : element.scrollHeight;
      }
    }

    return itemSize; // Default height for messages without attachments
  };

  const handleScroll = (scrollOffset) => {
    if (!listRef.current) return;

    // Access the DOM node of the scrolling container
    const scrollingContainer =
      listRef.current._outerRef || listRef.current.innerRef;

    if (!scrollingContainer) return;

    const containerHeight = containerRef.current.clientHeight;
    const totalHeight = scrollingContainer.scrollHeight; // Access scrollHeight

    const distanceFromBottom = totalHeight - (scrollOffset + containerHeight);

    // Show the button if scrolled more than halfway from the bottom
    if (distanceFromBottom > containerHeight / 2) {
      setShowScrollToBottom(true);
    } else {
      setShowScrollToBottom(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className="chatbox-content relative h-full w-full px-[1rem]"
    >
      <RelightBackground
        data-show={showScrollToBottom}
        onClick={scrollToBottom}
        className={`absolute bottom-[5%] right-[50%] z-20
            data-[show=false]:pointer-events-none data-[show=true]:pointer-events-auto 
            data-[show=false]:opacity-0 data-[show=true]:opacity-100`}
      >
        <div className="fa fa-chevron-down base-icon"></div>
      </RelightBackground>
      {loading ? (
        <LocalLoading />
      ) : (
        listHeight > 0 && (
          <List
            ref={listRef}
            height={listHeight} // Dynamically calculated height
            itemCount={data?.messages.length}
            itemSize={getItemSize}
            width="100%"
            className="hide-scrollbar"
            onScroll={({ scrollOffset, scrollDirection }) => {
              scrollOffsetRef.current = scrollOffset;

              // Trigger the scroll handler
              handleScroll(scrollOffset);

              // Only fetch more messages when we're near the top and list has more than a minimum number of items
              if (
                scrollDirection === "backward" &&
                scrollOffset === 0 &&
                data.messages.length >= 10
              ) {
                fetchMoreMessages();
              }
            }}
            onItemsRendered={({ visibleStopIndex }) => {
              // Scroll to the bottom after the first render when the list height is calculated
              scrollToBottomAtFirstRender();
            }}
          >
            {MessageRow}
          </List>
        )
      )}
    </div>
  );
};

export default ListMessage;
