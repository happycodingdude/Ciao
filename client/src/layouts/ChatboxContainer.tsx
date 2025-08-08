import { useParams } from "@tanstack/react-router";
import { useRef } from "react";
import LocalLoading from "../components/LocalLoading";
import Chatbox from "../features/chatbox/components/Chatbox";
import ChatboxHeader from "../features/chatbox/components/ChatboxHeader";
import ChatInput from "../features/chatbox/components/ChatInput";
import useChatDetailToggles from "../features/chatbox/hooks/useChatDetailToggles";
import Attachment from "../features/chatdetail/components/Attachment";
import Information from "../features/chatdetail/components/Information";
import { ConversationCache } from "../features/listchat/types";
import useLoading from "../hooks/useLoading";
import { isPhoneScreen } from "../utils/getScreenSize";
import queryClient from "../utils/queryClient";

const ChatboxContainer = () => {
  console.log("Rendering ChatboxContainer");

  const { loading, setLoading } = useLoading();
  // const { data: conversations, isLoading, isRefetching } = useConversation(1);
  // const { data: info } = useInfo();

  const { toggle, setToggle } = useChatDetailToggles();

  const refChatboxContainer = useRef<HTMLDivElement>();
  const refInput = useRef<HTMLInputElement>();

  // if (!conversations.selected) return null;
  // const { conversationId } = useParams({
  //   from: "/conversations/_layout/$conversationId",
  // });
  // const [conversationId] = useLocalStorage<string>("conversationId");
  // const conversation = conversations.filterConversations.find(
  //   (c) => c.id === conversationId,
  // );

  const { conversationId } = useParams({
    from: "/conversations/_layout/$conversationId",
  });
  // Get conversation list from cache
  const conversationCache = queryClient.getQueryData<ConversationCache>([
    "conversation",
  ]);
  const conversation = conversationCache?.filterConversations.find(
    (c) => c.id === conversationId,
  );

  // const { isFetching, isRefetching, isLoading } = useMessage(conversationId, 1);
  // if (isFetching || isRefetching || isLoading) return <LocalLoading />;

  // if (!conversation) return <div>Loading Conversation Info...</div>;

  return (
    <>
      {isPhoneScreen() ? (
        // <LocalLoading className="!z-[11]" />
        <>
          <div
            className={`absolute h-full w-full bg-[var(--bg-color)]
            ${conversation && (!toggle || toggle === "" || toggle === "null") ? "z-[10]" : "z-0"}`}
          >
            <div className="flex h-full flex-col">
              <ChatboxHeader />
              <div className="flex w-full grow overflow-hidden">
                {loading ? (
                  <LocalLoading className="!z-[11]" />
                ) : (
                  <div
                    ref={refChatboxContainer}
                    className={`relative flex w-full grow flex-col items-center gap-[1rem] border-r-[.1rem] border-r-[var(--border-color)] pb-[1rem]
                      ${toggle && toggle !== "" && toggle !== "null" ? "" : "shrink-0"}`}
                  >
                    <Chatbox />
                    <ChatInput className="chatbox" inputRef={refInput} />
                  </div>
                )}
              </div>
            </div>
          </div>
          <div
            className={`relative h-full w-full shrink-0 origin-right transition-all duration-200
              ${!toggle || toggle === "" || toggle === "null" ? "z-0" : "z-[10]"}`}
          >
            <i
              className="fa-arrow-left fa absolute left-[2rem] top-[1rem] z-[11] flex cursor-pointer items-center justify-center p-[.5rem]
            text-xl transition-all duration-500"
              onClick={() => setToggle(null)}
            ></i>
            <Information />
            <Attachment />
          </div>
        </>
      ) : (
        <div className="flex h-full flex-col">
          <ChatboxHeader />
          <div className="border-[var(--border-color)]] flex w-full grow border-t-[.1rem] bg-pastel-purple bg-opacity-40">
            <div className="laptop-md:h-[92dvh flex w-full laptop:h-[89dvh]">
              <div
                ref={refChatboxContainer}
                className={`relative flex w-full flex-col items-center gap-[1rem] 
                    ${toggle && toggle !== "" && toggle !== "null" ? "" : "shrink-0"}`}
              >
                <Chatbox />
                <ChatInput className="chatbox" inputRef={refInput} />
              </div>
            </div>
            <div
              className={`relative origin-right transition-all duration-200
                    ${!toggle || toggle === "" || toggle === "null" ? "w-0" : "laptop:w-[35rem]"}`}
            >
              <Information />
              <Attachment />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatboxContainer;
