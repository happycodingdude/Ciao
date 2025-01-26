import { useQueryClient } from "@tanstack/react-query";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { VariableSizeList as List } from "react-window";
import LocalLoading from "../../../components/LocalLoading";
import useLoading from "../../../hooks/useLoading";
import blurImage from "../../../utils/blurImage";
import useConversation from "../../listchat/hooks/useConversation";
import useMessage from "../hooks/useMessage";
import getMessages from "../services/getMessages";
import ChatInput from "./ChatInput_RW";
import MessageContent from "./MessageContent";

const itemSize = 80;
const attachmentSize = 320;
const moreAttachmentSize = 400;

const ListMessage_v2 = (props) => {
  const { send } = props;

  const queryClient = useQueryClient();

  const [hasMore, setHasMore] = useState(true);

  const { data: conversations } = useConversation();
  const { data, isLoading, isRefetching, refetch } = useMessage(
    conversations.selected.id,
    setHasMore,
  );

  if (!conversations?.selected) return;

  const { loading, setLoading } = useLoading();

  const [listHeight, setListHeight] = useState(0); // To store calculated height
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [isFewMessages, setIsFewMessages] = useState(false);
  const [inputHeight, setInputHeight] = useState(50); // Default input height

  const containerRef = useRef(null);
  const listRef = useRef(null);
  const scrollOffsetRef = useRef(0); // Track scroll offset
  const itemSizes = useRef(new Map()); // Tracks sizes of individual items for accurate offset calculations
  const isFetching = useRef(false); // Prevent multiple fetch triggers
  const scrollBot = useRef(false);
  // const heightCache = useRef([]);
  const refChatInputContainer = useRef();
  const containerHeight = useRef(0);

  const page = useRef(1);

  const refInput = useRef(null);

  const handleInputChange = useCallback(() => {
    if (!data) return;
    // const content = refInput.current.textContent || "";
    // setMessageText(content);

    // Adjust the height dynamically
    const scrollHeight = refChatInputContainer.current.scrollHeight;
    const newHeight = Math.min(scrollHeight, 350); // Set a max height of 150px
    // setInputHeight(image === 0 ? newHeight + 200 : newHeight - 20);
    setInputHeight(newHeight - 20);

    const totalHeight = data.messages.reduce(
      (acc, _, index) => acc + getItemSize(index),
      0,
    );
    setIsFewMessages(totalHeight + newHeight < listHeight);
  }, [data]);

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
    if (!conversations.quickChat) refetch();
  }, [conversations.selected.id]);

  // Adjust list height dynamically
  useEffect(() => {
    if (containerRef.current) {
      setListHeight(containerRef.current.clientHeight);
    }
    const handleResize = () => {
      if (containerRef.current) {
        setListHeight(containerRef.current.clientHeight);
      }
      if (listRef.current) {
        itemSizes.current.clear(); // Clear cached sizes
        listRef.current.resetAfterIndex(0, true); // Reset all cached heights
      }
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // useEffect(() => {
  //   if (containerRef.current) {
  //     setListHeight(750);
  //   }
  //   const handleResize = () => {
  //     if (containerRef.current) {
  //       setListHeight(750);
  //     }
  //   };

  //   window.addEventListener("resize", handleResize);
  //   return () => {
  //     window.removeEventListener("resize", handleResize);
  //   };
  // }, []);

  // useEffect(() => {
  //   setListHeight(containerRef.current.clientHeight - inputHeight - 20);
  // }, [inputHeight]);

  // useEffect(() => {
  //   if (containerHeight.current === 0) containerHeight.current = listHeight;
  // }, [listHeight]);

  // useEffect(() => {
  //   if (containerRef.current && listRef.current && data) {
  //     // setListHeight(containerRef.current.clientHeight - inputHeight - 20);
  //     const totalItems = data.messages.length || 0;
  //     listRef.current._outerRef.classList.remove("scroll-smooth");
  //     listRef.current.scrollToItem(totalItems - 1, "end");
  //     setTimeout(() => {
  //       listRef.current._outerRef.classList.add("scroll-smooth");
  //     }, 0);
  //   }
  // }, [inputHeight, data]);

  useEffect(() => {
    if (!data) return;

    if (listRef.current) listRef.current.resetAfterIndex(0); // Reset cache for all items

    blurImage(".chatbox-content");

    // Check if the total height of all items is smaller than the container

    // setIsFewMessages(data.messages === 1);

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
    // listRef.current._outerRef.scrollTop = containerRef.current.clientHeight;
    setTimeout(() => {
      if (listRef.current)
        listRef.current._outerRef.classList.add("scroll-smooth");
    }, 500);
  };

  const scrollToBottom = () => {
    if (!listRef.current) return;
    const totalItems = data?.messages.length || 0;
    listRef.current.scrollToItem(totalItems - 1, "end");
    // listRef.current._outerRef.scrollTop = containerRef.current.clientHeight;
    setTimeout(() => {
      listRef.current._outerRef.classList.add("scroll-smooth");
    }, 0);
  };

  // Handle fetching more messages
  const fetchMoreMessages = useCallback(async () => {
    if (!hasMore || isFetching.current) return; // Prevent multiple fetch triggers

    isFetching.current = true; // Start fetching

    page.current = page.current + 1;
    const newMessages = await getMessages(
      conversations.selected.id,
      page.current,
    );
    setHasMore(newMessages.hasMore);

    // Append new data to the top
    queryClient.setQueryData(
      ["message", conversations.selected.id],
      (oldData) => {
        return {
          ...oldData,
          messages: [...newMessages.messages, ...(oldData.messages || [])],
        };
      },
    );

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
      listRef.current.scrollTo(currentOffset + totalNewHeight - itemSize * 1.5);
      // listRef.current.scrollTo(currentOffset + totalNewHeight);
      setTimeout(() => {
        listRef.current._outerRef.classList.add("scroll-smooth");
      }, 0);
    }
  }, [hasMore, data?.messages.length]);

  // Render a single message item
  const MessageRow = ({ index, style }) => {
    const message = data?.messages[index];
    const height = getItemSize(index);
    return (
      <div
        id={`message-${message.id}`}
        style={{
          ...style,
          height: height,
        }}
      >
        <MessageContent message={message} id={conversations.selected.id} />
      </div>
    );
  };

  // Function to get the height of each message (all are fixed size here)
  const getItemSize = (index) => {
    const message = data?.messages[index];

    // Calculate dynamic height based on message content
    if (message) {
      if (message.attachments.length > 0) {
        if (message.content !== null && message.content !== "") {
          const element = document.getElementById(`${message.id}`);
          if (element) {
            return element.scrollHeight >= 150
              ? element.scrollHeight + 20
              : element.scrollHeight + 10;
          }
          // return attachmentAndTextSize;
        } else if (message.attachments.length > 2) return moreAttachmentSize;
        else return attachmentSize; // Height for messages with attachments
      }

      // If text, calculate height dynamically based on content
      const element = document.getElementById(`${message.id}`);
      if (element) {
        return element.scrollHeight >= 150
          ? element.scrollHeight + 20
          : element.scrollHeight + 10;
      }
    }

    return itemSize; // Default height for messages without attachments
  };
  // const getItemSize = (index) => {
  //   const message = data?.messages[index];
  //   if (!message) return itemSize; // Default height if no message

  //   // Check if we have a cached size
  //   if (itemSizes.current.has(index)) {
  //     return itemSizes.current.get(index);
  //   }

  //   // Estimate height based on content type
  //   if (message.attachments.length > 0) {
  //     if (message.content !== null && message.content !== "") {
  //       return attachmentAndTextSize; // Estimate for attachments with text
  //     }
  //     return attachmentSize; // Estimate for attachments only
  //   }

  //   return itemSize; // Default height for plain messages
  // };

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
      className="chatbox-content relative flex h-full w-full flex-col justify-end px-[1rem]"
    >
      {/* <RelightBackground
        data-show={showScrollToBottom}
        onClick={scrollToBottom}
        className={`absolute bottom-[15%] right-[50%] z-20
            data-[show=false]:pointer-events-none data-[show=true]:pointer-events-auto 
            data-[show=false]:opacity-0 data-[show=true]:opacity-100`}
      >
        <div className="fa fa-chevron-down base-icon"></div>
      </RelightBackground> */}
      {loading ? (
        <LocalLoading />
      ) : (
        listHeight > 0 && (
          <List
            ref={listRef}
            height={listHeight - inputHeight - 20} // Dynamically calculated height
            itemCount={data?.messages.length}
            itemSize={getItemSize}
            width="100%"
            className={`hide-scrollbar scroll-smooth ${isFewMessages ? "!h-auto" : ""}`}
            // className={`hide-scrollbar scroll-smooth`}
            onScroll={({ scrollOffset, scrollDirection }) => {
              scrollOffsetRef.current = scrollOffset;

              // Trigger the scroll handler
              handleScroll(scrollOffset);

              // Only fetch more messages when we're near the top and list has more than a minimum number of items
              if (
                scrollDirection === "backward" &&
                scrollOffset <= 100 &&
                data.messages.length >= 10
              ) {
                fetchMoreMessages();
              }
            }}
            // onItemsRendered={({ visibleStopIndex }) => {

            //   // Scroll to the bottom after the first render when the list height is calculated
            //   scrollToBottomAtFirstRender();
            // }}
            onItemsRendered={({ visibleStartIndex, visibleStopIndex }) => {
              setTimeout(() => {
                if (!listRef.current) return; // Safeguard
                // listRef.current.resetAfterIndex(0);

                const totalHeight = data.messages.reduce(
                  (acc, _, index) => acc + getItemSize(index),
                  0,
                );
                setIsFewMessages(totalHeight < listHeight);

                for (let i = visibleStartIndex; i <= visibleStopIndex; i++) {
                  const message = data?.messages[i];
                  if (message) {
                    const element = document.getElementById(
                      `message-${message.id}`,
                    );
                    if (element) {
                      // const height = element.scrollHeight;
                      // const isMultiLine = height > itemSize;

                      // if (itemSizes.current.get(i) !== height) {
                      //   itemSizes.current.set(
                      //     i,
                      //     isMultiLine ? height + 10 : itemSize,
                      //   );
                      //   listRef.current.resetAfterIndex(i); // Reset height cache
                      // }
                      listRef.current.resetAfterIndex(i); // Reset height cache
                    }
                  }
                }
              }, 0); // Slight delay to ensure mounting
            }}
          >
            {MessageRow}
          </List>
        )
      )}

      {/* Chat input */}
      {/* <div
        className="chat-input mt-2 flex w-full items-center border-t border-gray-300 p-2"
        style={{ height: `${inputHeight}px` }}
      >
        <div
          ref={inputRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInputChange}
          className="flex-grow overflow-hidden px-3 py-2 focus:outline-none"
          style={{
            minHeight: "50px", // Minimum height for the input
            maxHeight: "150px", // Maximum height for the input
            overflowY: "auto", // Allow scrolling for overflowing content
            maxWidth: "500px",
          }}
          placeholder="Type a message..."
        />
        <button
          // onClick={handleSendMessage}
          className="ml-2 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          Send
        </button>
      </div> */}

      <div ref={refChatInputContainer} className="py-[1rem]">
        <ChatInput
          className="chatbox"
          onInput={handleInputChange}
          send={(text, files) => {
            if (text.trim() === "" && files.length === 0) return;

            const lazyImages = files.map((item) => {
              return {
                type: "image",
                mediaUrl: URL.createObjectURL(item),
              };
            });
            // setFiles([]);
            send({
              type: text.trim() === "" ? "media" : "text",
              content: text,
              attachments: lazyImages,
              files: files,
            });
          }}
          ref={refInput}
        />
      </div>
    </div>
  );
};

export default ListMessage_v2;
