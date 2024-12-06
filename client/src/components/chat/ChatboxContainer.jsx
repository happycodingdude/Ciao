import React, { useEffect, useState } from "react";
import { useConversation, useMessage } from "../../hook/CustomHooks";
import LocalLoading from "../common/LocalLoading";
import Attachment from "./Attachment";
import Chatbox from "./Chatbox";
import Information from "./Information";

const ChatboxContainer = (props) => {
  console.log("ChatboxContainer calling");
  // const { removeInListChat, refChatbox } = props;

  // const [selected] = useSelected();
  const { data: messages } = useMessage();
  // const { isLoading, isRefetching, isFetched } = useAttachment();
  const [toggle, setToggle] = useState("information");
  const [showInfo, setShowInfo] = useState(true);
  // const [toggle, setToggle] = useState("attachment");

  const [loading, setLoading] = useState();

  const { data: conversations } = useConversation();
  useEffect(() => {
    if (
      !conversations?.selected ||
      conversations?.fromEditProfile ||
      conversations?.noLoading
    )
      return;
    setLoading(true);
  }, [conversations?.selected]);

  return (
    <div className="relative flex grow bg-[var(--bg-color)]">
      {/* {isLoading || isRefetching ? <LocalLoading /> : ""} */}
      {loading ? <LocalLoading /> : ""}
      {/* <LocalLoading /> */}
      {messages?.messages || conversations?.createGroupChat ? (
        <>
          <Chatbox toggleInformation={setShowInfo} showInfo={showInfo} />
          <div
            className={`relative shrink-0 origin-right transition-all duration-200 laptop:w-[25rem] 
            ${showInfo ? "opacity-100" : "opacity-0"}`}
          >
            {/* {isLoading || isRefetching ? <LocalLoading /> : ""} */}
            {/* {!isFetched ? <LocalLoading /> : ""} */}
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
