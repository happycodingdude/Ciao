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
  // const [toggle, setToggle] = useState("attachment");

  const [loading, setLoading] = useState();

  const { data: conversations } = useConversation();
  useEffect(() => {
    if (!conversations?.selected || conversations?.fromEditProfile) return;
    setLoading(true);
  }, [conversations?.selected]);

  return (
    <div className="relative flex grow">
      {/* {isLoading || isRefetching ? <LocalLoading /> : ""} */}
      {loading ? <LocalLoading /> : ""}
      {messages?.messages ? (
        <>
          <Chatbox
          // toggleInformation={toggleInformationContainer}
          />
          <div className="relative origin-right laptop:w-[22rem]">
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
