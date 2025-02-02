import React, { useEffect } from "react";
import LocalLoading from "../components/LocalLoading";
import Chatbox from "../features/chatbox/components/Chatbox";
import ChatboxHeader from "../features/chatbox/components/ChatboxHeader";
import useMessage from "../features/chatbox/hooks/useMessage";
import useToggleChatDetail from "../features/chatbox/hooks/useToggleChatDetail";
import Attachment from "../features/chatdetail/components/Attachment";
import Information from "../features/chatdetail/components/Information";
import useAttachment from "../features/chatdetail/hooks/useAttachment";
import useConversation from "../features/listchat/hooks/useConversation";
import useLoading from "../hooks/useLoading";

const ChatboxContainer = () => {
  // console.log("ChatboxContainer calling");
  const { isLoading: isLoadingMessage, isRefetching: isRefetchingMessage } =
    useMessage();
  const {
    isLoading: isLoadingAttachment,
    isRefetching: isRefetchingAttachment,
  } = useAttachment();
  const { data: conversations } = useConversation();

  const { toggle, setToggle } = useToggleChatDetail();
  const { loading, setLoading } = useLoading();

  const isLoading = isLoadingMessage || isLoadingAttachment;
  const isRefetching = isRefetchingMessage || isRefetchingAttachment;

  useEffect(() => {
    if (!isLoading && !isRefetching) {
      setTimeout(() => {
        setLoading(false);
      }, 100);
    }
  }, [isLoading, isRefetching]);

  return (
    <div className="relative grow">
      {loading ? (
        <LocalLoading className="!z-[11]" />
      ) : conversations?.selected ||
        conversations?.createGroupChat ||
        conversations?.quickChat ? (
        <div className="flex h-full w-full grow flex-col border-l-[.1rem] border-l-[var(--border-color)]">
          <ChatboxHeader toggle={toggle} setToggle={setToggle} />
          <div className="flex h-[92vh] w-full">
            <Chatbox isToggle={toggle && toggle !== "" && toggle !== "null"} />
            <div
              className={`relative shrink-0 origin-right transition-all duration-200 laptop:w-[25rem] 
            ${!toggle || toggle === "" || toggle === "null" ? "opacity-0" : "opacity-100"}`}
            >
              <Information
                show={toggle === "information"}
                toggle={() => setToggle("attachment")}
                // onLoaded={() => setLoading(false)}
              />
              <Attachment
                show={toggle === "attachment"}
                toggle={() => setToggle("information")}
              />
            </div>
          </div>
        </div>
      ) : (
        ""
      )}
    </div>

    // <>
    //   {conversations?.selected ||
    //   conversations?.createGroupChat ||
    //   conversations?.quickChat ? (
    //     <div className="flex h-full w-full grow flex-col border-l-[.1rem] border-l-[var(--border-color)]">
    //       <ChatboxHeader toggle={toggle} setToggle={setToggle} />
    //       <div className="flex h-[92vh] w-full">
    //         <Chatbox isToggle={toggle && toggle !== "" && toggle !== "null"} />
    //         <div
    //           className={`relative shrink-0 origin-right transition-all duration-200 laptop:w-[25rem]
    //         ${!toggle || toggle === "" || toggle === "null" ? "opacity-0" : "opacity-100"}`}
    //         >
    //           <Information
    //             show={toggle === "information"}
    //             toggle={() => setToggle("attachment")}
    //             // onLoaded={() => setLoading(false)}
    //           />
    //           <Attachment
    //             show={toggle === "attachment"}
    //             toggle={() => setToggle("information")}
    //           />
    //         </div>
    //       </div>
    //     </div>
    //   ) : (
    //     ""
    //   )}
    // </>
  );
};

export default ChatboxContainer;
