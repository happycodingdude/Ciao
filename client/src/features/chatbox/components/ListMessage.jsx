import React, { useCallback, useEffect, useRef, useState } from "react";
import { VariableSizeList as List } from "react-window";
import getMessages from "../services/getMessages";

const itemSize = 80;

const ListMessage = (props) => {
  const { conversationId } = props;

  const [messages, setMessages] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [listHeight, setListHeight] = useState(0); // To store calculated height
  const containerRef = useRef(null);
  const listRef = useRef(null);
  const scrollOffsetRef = useRef(0); // Track scroll offset
  const itemSizes = useRef(new Map()); // Tracks sizes of individual items for accurate offset calculations
  const isFetching = useRef(false); // Prevent multiple fetch triggers

  const page = useRef(1);

  // Mock API to fetch messages
  const fetchMessages = useCallback(async () => {
    const newMessages = await getMessages(conversationId, page.current);
    return newMessages.messages;
  }, [conversationId]);

  // Fetch initial messages
  useEffect(() => {
    page.current = 1;
    const loadInitialMessages = async () => {
      const initialMessages = await fetchMessages();
      setMessages(initialMessages);

      // Scroll to the last message after messages are set
      setTimeout(() => {
        if (listRef.current) {
          listRef.current.scrollToItem(initialMessages.length - 1, "end");
        }
      }, 0);
    };
    loadInitialMessages();
  }, [conversationId]);

  // Handle fetching more messages
  const fetchMoreMessages = useCallback(async () => {
    if (!hasMore || isFetching.current) return; // Prevent multiple fetch triggers

    isFetching.current = true; // Start fetching

    page.current = page.current + 1;
    const newMessages = await fetchMessages();
    if (newMessages.length === 0) {
      setHasMore(false); // Stop fetching if no more messages
      // isFetching.current = false;
      return;
    }

    isFetching.current = false; // Stop fetching

    const newMessageSizes = [...newMessages.reverse()].map(
      (_, index) => itemSizes.current.get(index) || 50,
    );
    const totalNewHeight = newMessageSizes.reduce((acc, size) => acc + size, 0);

    // Save the current scroll position
    const currentOffset = scrollOffsetRef.current;

    // Update the messages and reset the list cache
    setMessages((prevMessages) => [...newMessages, ...prevMessages]);

    // Reset the list cache and maintain scroll position
    if (listRef.current) {
      listRef.current.resetAfterIndex(0); // Reset cache for all items
      setTimeout(() => {
        listRef.current.scrollTo(currentOffset + totalNewHeight);
      }, 0);
    }
  }, [hasMore, messages.length]);

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

  // Render a single message item
  const MessageRow = ({ index, style }) => {
    const message = messages[index];

    // Save the height of each item dynamically for precise offset calculations
    const ref = useCallback(
      (node) => {
        if (node) {
          const size = node.getBoundingClientRect().height;
          itemSizes.current.set(index, size);
        }
      },
      [index],
    );

    return (
      // <MessageContent height={itemSize} message={message} id={conversationId} />
      <div ref={ref} style={style} className="message-item">
        {message.content}
      </div>
    );
  };

  // Function to get the height of each message (all are fixed size here)
  // const getItemSize = () => itemSize; // Fixed height for each item
  const getItemSize = (index) => itemSizes.current.get(index) || itemSize;

  return (
    <div ref={containerRef} className="h-full w-full">
      {listHeight > 0 && (
        <List
          ref={listRef}
          height={listHeight} // Dynamically calculated height
          itemCount={messages.length}
          itemSize={getItemSize}
          width="100%"
          onScroll={({ scrollOffset, scrollDirection }) => {
            scrollOffsetRef.current = scrollOffset;
            // Only fetch more messages when we're near the top and list has more than a minimum number of items
            if (
              scrollDirection === "backward" &&
              scrollOffset === 0 &&
              messages.length >= 10
            ) {
              fetchMoreMessages();
            }
          }}
        >
          {MessageRow}
        </List>
      )}
    </div>
  );
};

export default ListMessage;
