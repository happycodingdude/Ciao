import React, { lazy, Suspense, useEffect } from "react";
import LocalLoading from "../components/LocalLoading";
import ChatDetailTogglesProvider from "../context/ChatDetailTogglesContext";
import useMessage from "../features/chatbox/hooks/useMessage";
import useAttachment from "../features/chatdetail/hooks/useAttachment";
import useConversation from "../features/listchat/hooks/useConversation";
import useLoading from "../hooks/useLoading";
const ListChatContainer = lazy(() => import("./ListChatContainer"));
const ChatboxContainer = lazy(() => import("./ChatboxContainer"));

const ChatSection = () => {
  const { data: conversations } = useConversation(1);
  const { loading, setLoading } = useLoading();

  const { isLoading: isLoadingMessage, isRefetching: isRefetchingMessage } =
    useMessage();
  const {
    isLoading: isLoadingAttachment,
    isRefetching: isRefetchingAttachment,
  } = useAttachment();

  const isLoading = isLoadingMessage || isLoadingAttachment;
  const isRefetching = isRefetchingMessage || isRefetchingAttachment;

  useEffect(() => {
    if (!isLoading && !isRefetching) {
      setTimeout(() => {
        setLoading(false);
      }, 50);
    }
  }, [isLoading, isRefetching]);

  return (
    <section className={`relative flex grow overflow-hidden`}>
      <ChatDetailTogglesProvider>
        <Suspense>
          <ListChatContainer />
        </Suspense>
        <Suspense>
          {conversations?.selected ? (
            <div className="relative h-full w-full">
              {loading ? <LocalLoading className="!z-[11]" /> : ""}
              <ChatboxContainer />
            </div>
          ) : (
            ""
          )}
        </Suspense>
      </ChatDetailTogglesProvider>
    </section>
  );
};

export default ChatSection;
