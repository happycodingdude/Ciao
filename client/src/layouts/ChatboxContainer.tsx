import React, { useEffect, useRef } from "react";
import LocalLoading from "../components/LocalLoading";
import Chatbox from "../features/chatbox/components/Chatbox";
import ChatboxHeader from "../features/chatbox/components/ChatboxHeader";
import ChatInput from "../features/chatbox/components/ChatInput";
import useChatDetailToggles from "../features/chatbox/hooks/useChatDetailToggles";
import useMessage from "../features/chatbox/hooks/useMessage";
import Attachment from "../features/chatdetail/components/Attachment";
import Information from "../features/chatdetail/components/Information";
import useAttachment from "../features/chatdetail/hooks/useAttachment";
import useConversation from "../features/listchat/hooks/useConversation";
import useLoading from "../hooks/useLoading";
import { isPhoneScreen } from "../utils/getScreenSize";

const ChatboxContainer = () => {
  // console.log("ChatboxContainer calling");
  const { isLoading: isLoadingMessage, isRefetching: isRefetchingMessage } =
    useMessage();
  const {
    isLoading: isLoadingAttachment,
    isRefetching: isRefetchingAttachment,
  } = useAttachment();
  const { data: conversations } = useConversation();

  const { toggle } = useChatDetailToggles();
  const { loading, setLoading } = useLoading();

  const isLoading = isLoadingMessage || isLoadingAttachment;
  const isRefetching = isRefetchingMessage || isRefetchingAttachment;

  const refChatboxContainer = useRef<HTMLDivElement>();
  const refInput = useRef<HTMLInputElement>();

  useEffect(() => {
    if (!isLoading && !isRefetching) {
      setTimeout(() => {
        setLoading(false);
      }, 100);
      setTimeout(() => {
        if (refInput.current) {
          refInput.current.textContent = "";
          refInput.current.focus();
        }
      }, 150);
    }
  }, [isLoading, isRefetching]);

  return (
    <>
      {isPhoneScreen() ? (
        <div
          className={`absolute w-full bg-[var(--bg-color)]
            ${conversations?.selected ? "z-[10]" : "z-0"}`}
        >
          {loading ? (
            <LocalLoading className="!z-[11]" />
          ) : (
            <div className="flex h-full w-full grow flex-col border-l-[.1rem] border-l-[var(--border-color)]">
              <ChatboxHeader />
              <div className="flex w-full phone:h-[88dvh] laptop-lg:h-[92dvh]">
                <div
                  ref={refChatboxContainer}
                  className={`relative flex w-full grow flex-col items-center gap-[1rem] border-r-[.1rem] border-r-[var(--border-color)]
                    ${toggle && toggle !== "" && toggle !== "null" ? "" : "shrink-0"}`}
                >
                  <Chatbox />
                  <ChatInput className="chatbox" inputRef={refInput} />
                </div>
                <div
                  className={`relative shrink-0 origin-right transition-all duration-200 laptop:w-[25rem] 
            ${!toggle || toggle === "" || toggle === "null" ? "opacity-0" : "opacity-100"}`}
                >
                  <Information />
                  <Attachment />
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="relative grow">
          {loading ? (
            <LocalLoading className="!z-[11]" />
          ) : (
            <div className="flex h-full w-full grow flex-col border-l-[.1rem] border-l-[var(--border-color)]">
              <ChatboxHeader />
              <div className="flex w-full phone:h-[88dvh] laptop-lg:h-[92dvh]">
                <div
                  ref={refChatboxContainer}
                  className={`relative flex w-full grow flex-col items-center gap-[1rem] border-r-[.1rem] border-r-[var(--border-color)]
                    ${toggle && toggle !== "" && toggle !== "null" ? "" : "shrink-0"}`}
                >
                  <Chatbox />
                  <ChatInput className="chatbox" inputRef={refInput} />
                </div>
                <div
                  className={`relative shrink-0 origin-right transition-all duration-200 laptop:w-[25rem] 
            ${!toggle || toggle === "" || toggle === "null" ? "opacity-0" : "opacity-100"}`}
                >
                  <Information />
                  <Attachment />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default ChatboxContainer;
