import React, { useState } from "react";
import { useLoading } from "../../context/LoadingContext";
import { useConversation, useMessage } from "../../hook/CustomHooks";
import LocalLoading from "../common/LocalLoading";
import Attachment from "./Attachment";
import Chatbox from "./Chatbox";
import Information from "./Information";

const ChatboxContainer = (props) => {
  console.log("ChatboxContainer calling");
  const { data: messages } = useMessage();
  const [toggle, setToggle] = useState("information");
  const [showInfo, setShowInfo] = useState(true);

  const { loading } = useLoading();

  const { data: conversations } = useConversation();

  return (
    <div className="relative flex grow">
      {/* {isLoading || isRefetching ? <LocalLoading /> : ""} */}
      {loading ? <LocalLoading zindex="z-[11]" /> : ""}
      {/* <LocalLoading  /> */}
      {messages?.messages || conversations?.createGroupChat ? (
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
