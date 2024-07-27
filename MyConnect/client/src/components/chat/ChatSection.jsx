import React, { useRef } from "react";
import { useMessage } from "../../hook/CustomHooks";
import LocalLoading from "../common/LocalLoading";
import Attachment from "./Attachment";
import Chatbox from "./Chatbox";
import Information from "./Information";
import ListChatContainer from "./ListChatContainer";

export const ChatSection = (props) => {
  console.log("ChatSection calling");
  const { refListChat, refChatbox } = props;

  const { data, isLoading, isRefetching } = useMessage();

  const refInformationContainer = useRef();
  const refInformation = useRef();
  const refAttachment = useRef();

  const removeInListChat = (id) => {
    refListChat.removeChat(id);
  };

  const showInformationContainer = () => {
    refInformationContainer.current.classList.remove(
      "animate-information-hide",
    );
    refInformationContainer.current.classList.add("animate-information-show");
  };

  const hideInformationContainer = () => {
    refInformationContainer.current.classList.remove(
      "animate-information-show",
    );
    refInformationContainer.current.classList.add("animate-information-hide");
  };

  const toggleInformationContainer = () => {
    if (
      refInformationContainer.current.classList.contains(
        "animate-information-hide",
      )
    )
      showInformationContainer();
    else hideInformationContainer();
  };

  return (
    <section className={`relative flex grow overflow-hidden`}>
      <ListChatContainer refListChat={refListChat} />
      <div className="relative flex grow">
        {data?.messages ? (
          <>
            <Chatbox
              refChatbox={refChatbox}
              toggleInformation={toggleInformationContainer}
            />
            <div
              ref={refInformationContainer}
              className="relative flex-1 origin-right overflow-hidden"
            >
              <Information
                refAttachment={refAttachment}
                refInformationExposed={refInformation}
                removeInListChat={(val) => removeInListChat(val)}
              />
              <Attachment
                refInformation={refInformation}
                refAttachmentExposed={refAttachment}
              />
            </div>
          </>
        ) : (
          ""
        )}
        {isLoading || isRefetching ? <LocalLoading loading /> : ""}
      </div>
    </section>
  );
};
