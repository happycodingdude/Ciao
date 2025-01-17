import { useQueryClient } from "@tanstack/react-query";
import { debounce } from "lodash";
import { useCallback, useEffect, useRef, useState } from "react";
import useMessage from "../hooks/useMessage";
import getMessages from "../services/getMessages";
import MessageContent from "./MessageContent";

const itemHeight = 80; // Adjustable global variable
const windowHeight = 500; // Adjustable global variable
const overscan = 0; // Number of extra items to render before the visible range

const ListMessage = (props) => {
  const { conversationId } = props;

  const queryClient = useQueryClient();

  const parentRef = useRef(null);
  const page = useRef(1);
  const scrollBot = useRef(false);
  const [nextExist, setNextExist] = useState(false);
  const [scrollTop, setScrollTop] = useState(0);

  const { status, data, error } = useMessage(conversationId, setNextExist);

  const generateRows = useCallback(() => {
    const numberOfItems = data ? data.pages[0].rows.length : 0;
    const startIndex = Math.max(
      0,
      Math.floor(scrollTop / itemHeight) - overscan,
    );
    let renderedNodesCount =
      Math.floor(windowHeight / itemHeight) + 2 * overscan;
    renderedNodesCount = Math.min(
      numberOfItems - startIndex,
      renderedNodesCount,
    );

    let items = [];
    for (let i = 0; i < renderedNodesCount; i++) {
      const index = i + startIndex;
      items.push(
        // <div
        //   style={{
        //     height: `${itemHeight}px`,
        //   }}
        // >
        //   <MessageContent
        //     message={data.pages[0].rows[index]}
        //     id={conversationId}
        //     mt={index === 0}
        //   />
        // </div>,

        <MessageContent
          message={data.pages[0].rows[index]}
          id={conversationId}
          mt={index === 0}
        />,
      );
    }

    return items;
  }, [data, scrollTop]);

  useEffect(() => {
    if (data) parentRef.current.scrollTop = parentRef.current.offsetHeight;
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
    requestAnimationFrame(() => {
      parentRef.current.style.scrollBehavior = "auto";
      parentRef.current.scrollTop =
        parentRef.current.scrollHeight - currentScrollHeight;
      parentRef.current.style.scrollBehavior = "smooth";
    });
  };

  const debounceFetch = useCallback(debounce(fetchMoreMessage, 100), []);

  return (
    <div
      ref={parentRef}
      className="w-full overflow-y-scroll border-2 border-black"
      style={{ height: `${windowHeight}px` }}
      onScroll={(e) => {
        setScrollTop(e.currentTarget.scrollTop);
        if (parentRef.current.scrollTop === 0 && nextExist) {
          page.current = page.current + 1;
          const currentScrollHeight = parentRef.current.scrollHeight;
          debounceFetch(conversationId, currentScrollHeight);
        }
      }}
    >
      {/* {generateRows()} */}
      <div
        style={{
          height: `${data ? data.pages[0].rows.length * itemHeight : 0}px`,
        }}
      >
        {generateRows()}
      </div>
    </div>
  );
};

export default ListMessage;
