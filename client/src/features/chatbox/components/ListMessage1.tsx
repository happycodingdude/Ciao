import { QueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { useVirtualizer } from "@tanstack/react-virtual";
import React, { useEffect, useRef, useState } from "react";
import getMessages from "../services/getMessages";

const queryClient = new QueryClient();

const ListMessage1 = (props) => {
  const { conversationId } = props;

  const [nextExist, setNextExist] = useState<boolean>(false);

  async function fetchServerPage(conversationId: string, offset: number = 0) {
    // const rows = new Array(limit)
    //   .fill(0)
    //   .map((_, i) => `Async loaded row #${i + offset * limit}`)

    const data = await getMessages(conversationId, offset);
    setNextExist(data.nextExist);

    await new Promise((r) => setTimeout(r, 500));

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
    queryKey: ["message", , conversationId],
    queryFn: (ctx) => fetchServerPage(conversationId, ctx.pageParam),
    getNextPageParam: (lastGroup) => lastGroup.nextOffset,
    initialPageParam: 1,
  });

  const allRows = data ? data.pages.flatMap((d) => d.rows) : [];

  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: hasNextPage ? allRows.length + 1 : allRows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100,
    // overscan: 5,
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
      fetchNextPage();
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

  return (
    <div>
      {status === "pending" ? (
        <p>Loading...</p>
      ) : status === "error" ? (
        <span>Error: {error.message}</span>
      ) : (
        <div
          ref={parentRef}
          className="List"
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
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const isLoaderRow = virtualRow.index > allRows.length - 1;
              const post = allRows[virtualRow.index];

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
                  {isLoaderRow
                    ? hasNextPage
                      ? "Loading more..."
                      : "Nothing more to load"
                    : post}
                </div>
              );
            })}
          </div>
        </div>
      )}
      <div>
        {isFetching && !isFetchingNextPage ? "Background Updating..." : null}
      </div>
    </div>
  );
};

export default ListMessage1;
