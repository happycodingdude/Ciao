import React, { useEffect, useState } from "react";
import { useLoading } from "../../context/LoadingContext";
import {
  useAttachment,
  useConversation,
  useMessage,
} from "../../hook/CustomHooks";
import LocalLoading from "../common/LocalLoading";
import Attachment from "./Attachment";
import Chatbox from "./Chatbox";
import Information from "./Information";

const ChatboxContainer = () => {
  console.log("ChatboxContainer calling");
  const {
    data: messages,
    isLoading: isLoadingMessage,
    isRefetching: isRefetchingMessage,
  } = useMessage();
  const {
    isLoading: isLoadingAttachment,
    isRefetching: isRefetchingAttachment,
  } = useAttachment();
  const [showInfo, setShowInfo] = useState(true);
  const { data: conversations } = useConversation();

  const [toggle, setToggle] = useState("information");
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
    <div className="relative flex grow">
      {loading ? (
        <LocalLoading className="!z-[11]" />
      ) : messages?.messages || conversations?.createGroupChat ? (
        <>
          <Chatbox toggleInformation={setShowInfo} showInfo={showInfo} />
          <div
            className={`relative shrink-0 origin-right transition-all duration-200 laptop:w-[25rem] 
            ${showInfo ? "opacity-100" : "opacity-0"}`}
          >
            <Information
              // refAttachment={refAttachment}
              // refInformationExposed={refInformation}
              // removeInListChat={removeInListChat}
              show={toggle === "information"}
              toggle={() => setToggle("attachment")}
              onLoaded={() => setLoading(false)}
            />
            <Attachment
              // refInformation={refInformation}
              // refAttachmentExposed={refAttachment}
              show={toggle === "attachment"}
              toggle={() => setToggle("information")}
            />
          </div>
        </>
      ) : (
        ""
      )}
    </div>
  );
};

export default ChatboxContainer;
