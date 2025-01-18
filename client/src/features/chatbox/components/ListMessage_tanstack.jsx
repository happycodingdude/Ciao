import { useQueryClient } from "@tanstack/react-query";
import { useVirtualizer } from "@tanstack/react-virtual";
import { debounce } from "lodash";
import React, { useCallback, useEffect, useRef, useState } from "react";
import useEventListener from "../../../hooks/useEventListener";
import useMessage from "../hooks/useMessage";
import getMessages from "../services/getMessages";
import MessageContent from "./MessageContent";

const ListMessage_tanstack = (props) => {
  const { conversationId } = props;

  if (!conversationId) return null;

  const queryClient = useQueryClient();

  const [nextExist, setNextExist] = useState(false);

  const parentRef = useRef(null);
  const page = useRef(1);
  const scrollBot = useRef(false);

  const { status, data, error } = useMessage(conversationId, setNextExist);

  const allRows = data ? data.pages.flatMap((d) => d.rows) : [];

  const rowVirtualizer = useVirtualizer({
    count: nextExist ? allRows.length + 1 : allRows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80,
    overscan: 2,
  });

  useEffect(() => {
    page.current = 1;
    scrollBot.current = false;
  }, [conversationId]);

  useEffect(() => {
    if (
      data &&
      !scrollBot.current &&
      data.pages.length === 1 &&
      parentRef.current
    ) {
      scrollBot.current = true;
      parentRef.current.scrollTop = parentRef.current.offsetHeight;
    }
  }, [data]);

  const fetchMoreMessage = async (conversationId, currentScrollHeight) => {
    const data = await getMessages(conversationId, page.current);
    setNextExist(data.nextExist);
    queryClient.setQueryData(["message", conversationId], (oldData) => {
      return {
        ...oldData,
        pages: [
          {
            rows: [...data.messages, ...oldData.pages[0].rows],
            nextOffset: page,
          },
        ],
      };
    });

    // requestAnimationFrame(() => {
    //   parentRef.current.style.scrollBehavior = "auto";
    //   parentRef.current.scrollTop =
    //     parentRef.current.scrollHeight - currentScrollHeight;
    //   parentRef.current.style.scrollBehavior = "smooth";
    // });

    setTimeout(() => {
      parentRef.current.style.scrollBehavior = "auto";
      parentRef.current.scrollTop =
        parentRef.current.scrollHeight - currentScrollHeight;
      parentRef.current.style.scrollBehavior = "smooth";
    }, 10);
  };

  const debounceFetch = useCallback(debounce(fetchMoreMessage, 100), []);

  const handleScroll = useCallback(async () => {
    console.log(parentRef.current.scrollTop);

    if (parentRef.current.scrollTop === 0 && nextExist) {
      page.current = page.current + 1;
      const currentScrollHeight = parentRef.current.scrollHeight;
      debounceFetch(conversationId, currentScrollHeight);
    }
  }, [nextExist, conversationId]);
  useEventListener("scroll", handleScroll);

  return (
    <>
      {status === "pending" ? (
        <p>Loading...</p>
      ) : status === "error" ? (
        <span>Error: {error.message}</span>
      ) : (
        <div
          ref={parentRef}
          className="w-full overflow-y-auto"
          // style={{
          //   height: `500px`,
          //   width: `100%`,
          //   overflow: "auto",
          // }}
        >
          <div
            style={{
              height: `${rowVirtualizer.getTotalSize() - 100}px`,
              width: "100%",
              position: "relative",
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow, index) => {
              const isLoaderRow = virtualRow.index > allRows.length - 1;
              const message = allRows[virtualRow.index];
              const previousMessage = allRows[virtualRow.index - 1];
              if (!message) return null;

              return (
                <div
                  key={virtualRow.index}
                  className={
                    virtualRow.index % 2 ? "ListItemOdd" : "ListItemEven"
                  }
                  style={{
                    position: "absolute",
                    right: "5px",
                    width: "100%",
                    height:
                      message.attachments.length === 0
                        ? `${virtualRow.size}px`
                        : "300px",
                    transform:
                      !previousMessage ||
                      previousMessage?.attachments.length === 0
                        ? `translateY(${virtualRow.start}px)`
                        : `translateY(${virtualRow.start + 250}px)`,
                  }}
                >
                  {isLoaderRow ? (
                    nextExist ? (
                      "Loading more..."
                    ) : (
                      "Nothing more to load"
                    )
                  ) : (
                    <MessageContent
                      message={message}
                      id={conversationId}
                      mt={index === 0}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
      {/* <div>
        {isFetching && !isFetchingNextPage ? "Background Updating..." : null}
      </div> */}
    </>
  );
};

export default ListMessage_tanstack;
