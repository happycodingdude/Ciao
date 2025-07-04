import React, { useRef } from "react";
import LocalLoading from "../components/LocalLoading";
import Chatbox from "../features/chatbox/components/Chatbox";
import ChatboxHeader from "../features/chatbox/components/ChatboxHeader";
import ChatInput from "../features/chatbox/components/ChatInput";
import useChatDetailToggles from "../features/chatbox/hooks/useChatDetailToggles";
import Attachment from "../features/chatdetail/components/Attachment";
import Information from "../features/chatdetail/components/Information";
import useConversation from "../features/listchat/hooks/useConversation";
import useLoading from "../hooks/useLoading";
import { isPhoneScreen } from "../utils/getScreenSize";

const ChatboxContainer = () => {
  const { loading, setLoading } = useLoading();
  const { data: conversations } = useConversation();
  // const { data: info } = useInfo();

  const { toggle, setToggle } = useChatDetailToggles();

  const refChatboxContainer = useRef<HTMLDivElement>();
  const refInput = useRef<HTMLInputElement>();

  return (
    <>
      {isPhoneScreen() ? (
        // <LocalLoading className="!z-[11]" />
        <>
          <div
            className={`absolute h-full w-full bg-[var(--bg-color)]
            ${conversations?.selected && (!toggle || toggle === "" || toggle === "null") ? "z-[10]" : "z-0"}`}
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
        <div className="flex flex-col ">
          <ChatboxHeader />
          <div className="flex w-full laptop:h-[89dvh] laptop-md:h-[91dvh]">
            <div
              ref={refChatboxContainer}
              className={`relative flex w-full flex-col items-center gap-[1rem] 
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
    </>
  );
};

export default ChatboxContainer;
