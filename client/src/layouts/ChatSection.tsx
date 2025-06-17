import React, { lazy, Suspense } from "react";
import LocalLoading from "../components/LocalLoading";
import ChatDetailTogglesProvider from "../context/ChatDetailTogglesContext";
import useConversation from "../features/listchat/hooks/useConversation";
import useLoading from "../hooks/useLoading";
const ListChatContainer = lazy(() => import("./ListChatContainer"));
const ChatboxContainer = lazy(() => import("./ChatboxContainer"));

const ChatSection = () => {
  const { data: conversations } = useConversation(1);
  const { loading, setLoading } = useLoading();

  // const { isLoading: isLoadingMessage, isRefetching: isRefetchingMessage } =
  //   useMessage();
  // const {
  //   isLoading: isLoadingAttachment,
  //   isRefetching: isRefetchingAttachment,
  // } = useAttachment();

  // const isLoading = isLoadingMessage || isLoadingAttachment;
  // const isRefetching = isRefetchingMessage || isRefetchingAttachment;

  // useEffect(() => {
  //   if (!isLoading && !isRefetching) {
  //     setTimeout(() => {
  //       setLoading(false);
  //     }, 50);
  //   }
  // }, [isLoading, isRefetching]);

  // const conversationId = conversations?.selected?.id; // hoặc lấy từ state bạn đang dùng

  // const { isLoading: isLoadingMessage, isRefetching: isRefetchingMessage } =
  //   useMessage(conversationId, 1);

  // const {
  //   isLoading: isLoadingAttachment,
  //   isRefetching: isRefetchingAttachment,
  // } = useAttachment(conversationId);

  // const isLoading =
  //   !!conversationId && (isLoadingMessage || isLoadingAttachment);
  // const isRefetching =
  //   !!conversationId && (isRefetchingMessage || isRefetchingAttachment);

  // useEffect(() => {
  //   if (!isLoading && !isRefetching && conversationId) {
  //     const timeout = setTimeout(() => {
  //       setLoading(false);
  //     }, 50);

  //     return () => clearTimeout(timeout); // tránh memory leak
  //   }
  // }, [isLoading, isRefetching, conversationId]);

  return (
    <section className={`relative flex grow overflow-hidden`}>
      <ChatDetailTogglesProvider>
        <Suspense>
          <ListChatContainer />
        </Suspense>
        {/* <Suspense> */}
        {/* {conversations?.selected ? (
            <div className="relative h-full w-full">
              {loading ? <LocalLoading className="!z-[11]" /> : ""}
              <ChatboxContainer />
            </div>
          ) : (
            ""
          )} */}

        {/* <div className="relative h-full w-full">
            {loading ? <LocalLoading className="!z-[11]" /> : ""}
            {conversations?.selected ? <ChatboxContainer /> : ""}
          </div> */}
        {/* </Suspense> */}

        <div className="relative h-full w-full">
          {loading ? <LocalLoading className="!z-[11]" /> : ""}
          {conversations?.selected ? <ChatboxContainer /> : ""}
        </div>
      </ChatDetailTogglesProvider>
    </section>
  );
};

export default ChatSection;
