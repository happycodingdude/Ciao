import React, { useState } from "react";
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

  // const refInformationContainer = useRef();
  const [toggle, setToggle] = useState("information");

  const removeInListChat = (id) => {
    refListChat.removeChat(id);
  };

  // const showInformationContainer = () => {
  //   refInformationContainer.current.classList.remove(
  //     "animate-information-hide",
  //   );
  //   refInformationContainer.current.classList.add("animate-information-show");
  // };

  // const hideInformationContainer = () => {
  //   refInformationContainer.current.classList.remove(
  //     "animate-information-show",
  //   );
  //   refInformationContainer.current.classList.add("animate-information-hide");
  // };

  // const toggleInformationContainer = () => {
  //   if (
  //     refInformationContainer.current.classList.contains(
  //       "animate-information-hide",
  //     )
  //   )
  //     showInformationContainer();
  //   else hideInformationContainer();
  // };

  return (
    <section className={`flex grow overflow-hidden`}>
      <ListChatContainer refListChat={refListChat} />
      <div className="flex grow">
        {data?.messages ? (
          <>
            <Chatbox
              refChatbox={refChatbox}
              // toggleInformation={toggleInformationContainer}
            />
            <div className="relative origin-right overflow-hidden laptop:w-[25rem]">
              <Information
                // refAttachment={refAttachment}
                // refInformationExposed={refInformation}
                removeInListChat={(val) => removeInListChat(val)}
                show={toggle === "information"}
                toggle={() => setToggle("attachment")}
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
        {isLoading || isRefetching ? <LocalLoading loading /> : ""}
      </div>
    </section>
  );
};
