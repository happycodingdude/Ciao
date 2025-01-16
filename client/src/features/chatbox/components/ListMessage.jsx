import { QueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { useVirtualizer } from "@tanstack/react-virtual";
import React, { useCallback, useEffect, useRef, useState } from "react";
import useEventListener from "../../../hooks/useEventListener";
import getMessages from "../services/getMessages";
import MessageContent from "./MessageContent";

const queryClient = new QueryClient();

const ListMessage = (props) => {
  const { conversationId } = props;

  const [nextExist, setNextExist] = useState(false);

  async function fetchServerPage(conversationId, offset = 0) {
    // const rows = new Array(limit)
    //   .fill(0)
    //   .map((_, i) => `Async loaded row #${i + offset * limit}`)

    const data = await getMessages(conversationId, offset);
    setNextExist(data.nextExist);

    await new Promise((r) => setTimeout(r, 500));

    console.log(JSON.stringify(data.messages));

    return {
      rows: data.messages,
      nextOffset: offset + 1,
    };
  }

  const {
    status,
    data,
    error,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    // refetch,
    isRefetching,
  } = useInfiniteQuery({
    queryKey: ["message", conversationId],
    // queryKey: ["message"],
    queryFn: (ctx) => fetchServerPage(conversationId, ctx.pageParam),
    getNextPageParam: (lastGroup) => lastGroup.nextOffset,
    initialPageParam: 1,
  });

  const allRows = data ? data.pages.flatMap((d) => d.rows) : [];

  const parentRef = useRef(null);

  const rowVirtualizer = useVirtualizer({
    count: hasNextPage ? allRows.length + 1 : allRows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100,
  });

  useEffect(() => {
    const [lastItem] = [...rowVirtualizer.getVirtualItems()].reverse();

    if (!lastItem) {
      return;
    }

    if (
      lastItem.index >= allRows.length - 1 &&
      hasNextPage &&
      !isFetchingNextPage &&
      !isRefetching &&
      nextExist
    ) {
      // fetchNextPage();
    }
  }, [
    hasNextPage,
    fetchNextPage,
    allRows.length,
    isFetchingNextPage,
    rowVirtualizer.getVirtualItems(),
    nextExist,
  ]);

  // useEffect(() => {
  //   // refetch();
  //   // queryClient.removeQueries({ queryKey: ["message"], exact: true });
  //   queryClient.setQueryData(["message"], null);
  // }, [conversationId]);

  const scrollBot = useRef(false);

  useEffect(() => {
    if (
      data &&
      !scrollBot.current &&
      data.pageParams.length === 1 &&
      parentRef.current
    ) {
      scrollBot.current = true;
      parentRef.current.scrollTop = parentRef.current.offsetHeight;
    }
  }, [data]);

  const handleScroll = useCallback(async () => {
    console.log(parentRef.current.scrollTop);
    if (parentRef.current.scrollTop === 0) fetchNextPage();
  }, []);
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
          className="hide-scrollbar"
          style={{
            height: `500px`,
            width: `100%`,
            overflow: "auto",
          }}
        >
          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: "100%",
              position: "relative",
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow, index) => {
              const isLoaderRow = virtualRow.index > allRows.length - 1;
              const message = allRows[virtualRow.index];
              // if (!message) return null;

              return (
                <div
                  key={virtualRow.index}
                  className={
                    virtualRow.index % 2 ? "ListItemOdd" : "ListItemEven"
                  }
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  {isLoaderRow ? (
                    hasNextPage && nextExist ? (
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
      <div>
        {isFetching && !isFetchingNextPage ? "Background Updating..." : null}
      </div>
    </>
  );
};

export default ListMessage;
