import React, { useRef } from "react";
import { useConversation } from "../../hook/CustomHooks";
import LocalLoading from "../common/LocalLoading";
import ListchatContent from "./ListchatContent";

// const ListchatLazy = React.lazy(() => {
//   return new Promise((resolve) => setTimeout(resolve, 0)).then(
//     () => import("./ListchatContent"),
//   );
// });

const ListChat = (props) => {
  const { search } = props;

  const { isLoading, isRefetching } = useConversation();

  const refChatsScroll = useRef();

  // const scrollListChatToBottom = () => {
  //   refChats.current.scrollTop = refChats.current.scrollHeight;
  // };

  return (
    <div className="relative grow">
      {isLoading || isRefetching ? <LocalLoading /> : ""}
      {/* <Suspense fallback={<LocalLoading />}> */}
      <ListchatContent search={search} />
      {/* </Suspense> */}
      <div
        ref={refChatsScroll}
        className="mx-auto my-[.5rem] hidden items-center text-center"
      >
        <div
          className="fa fa-arrow-down flex aspect-square w-[3rem] cursor-pointer items-center justify-center rounded-full 
          bg-[var(--main-color)] font-normal text-[var(--text-sub-color)] hover:bg-[var(--main-color-light)]"
          // onClick={scrollListChatToBottom}
        ></div>
      </div>
    </div>
  );
};

export default ListChat;
