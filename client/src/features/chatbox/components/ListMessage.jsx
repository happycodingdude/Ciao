import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { AutoSizer, List } from "react-virtualized";
import useMessage from "../hooks/useMessage";
import getMessages from "../services/getMessages";

const itemHeight = 80; // Adjustable global variable
const windowHeight = window.innerHeight - 110; // Adjustable global variable
const overscan = 2; // Number of extra items to render before the visible range

const ListMessage = (props) => {
  const { conversationId } = props;

  const queryClient = useQueryClient();

  const parentRef = useRef(null);
  const page = useRef(1);
  const scrollBot = useRef(false);
  const [nextExist, setNextExist] = useState(false);
  const [scrollTop, setScrollTop] = useState(0);

  const { status, data, error } = useMessage(conversationId, setNextExist);

  // const generateRows = useCallback(() => {
  //   const numberOfItems = data ? data.pages[0].rows.length : 0;
  //   const startIndex = Math.max(
  //     0,
  //     Math.floor(scrollTop / itemHeight) - overscan,
  //   );
  //   let renderedNodesCount =
  //     Math.floor(windowHeight / itemHeight) + 2 * overscan;
  //   renderedNodesCount = Math.min(
  //     numberOfItems - startIndex,
  //     renderedNodesCount,
  //   );

  //   let items = [];
  //   for (let i = 0; i < renderedNodesCount; i++) {
  //     const index = i + startIndex;
  //     items.push(
  //       // <div
  //       //   style={{
  //       //     height: `${itemHeight}px`,
  //       //   }}
  //       // >
  //       //   <MessageContent
  //       //     message={data.pages[0].rows[index]}
  //       //     id={conversationId}
  //       //     mt={index === 0}
  //       //   />
  //       // </div>,

  //       <MessageContent
  //         message={data.pages[0].rows[index]}
  //         id={conversationId}
  //         mt={index === 0}
  //         height={itemHeight}
  //       />,
  //     );
  //   }

  //   return items;
  // }, [data, scrollTop]);

  useEffect(() => {
    if (data) {
      // const scrollDiv = document.getElementsByClassName(
      //   "ReactVirtualized__Grid__innerScrollContainer",
      // );
      // scrollDiv[0].scrollTop = scrollDiv[0].offsetHeight;
      // parentRef.current.scrollTop = parentRef.current.offsetHeight;
    }
  }, [data]);

  const rowRenderer = useCallback(
    ({
      key, // Unique key within array of rows
      index, // Index of row within collection
      style, // Style object to be applied to row (to position it)
    }) => {
      return (
        <div key={key} style={style}>
          {data?.pages[0].rows.map((item) => item.id)[index]}
        </div>
      );
    },
    [data],
  );

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
  };

  // const debounceFetch = useCallback(debounce(fetchMoreMessage, 100), []);

  if (!data) return null;

  return (
    <div className="h-full w-full overflow-y-scroll border-2 border-black">
      <AutoSizer>
        {({ width, height }) => (
          <List
            width={width}
            height={height}
            rowCount={data?.pages[0].rows.length}
            rowHeight={60}
            rowRenderer={rowRenderer}
            scrollToIndex={14}
          />
        )}
      </AutoSizer>
    </div>
  );
};

export default ListMessage;
