import React, { useRef } from "react";
import { AttachmentProvider } from "../../context/AttachmentContext";
import { ConversationProvider } from "../../context/ConversationContext";
import { MessageProvider } from "../../context/MessageContext";
import { ParticipantProvider } from "../../context/ParticipantContext";
import { useAuth, useFetchConversations } from "../../hook/CustomHooks";
import Attachment from "./Attachment";
import Chatbox from "./Chatbox";
import Information from "./Information";
import ListChat from "./ListChat";

export const ChatSection = (props) => {
  const { refListChat, refChatbox } = props;
  const { selected, reFetch: reFetchConversations } = useFetchConversations();
  const { valid } = useAuth();

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
    <ConversationProvider>
      <MessageProvider>
        <ParticipantProvider>
          <AttachmentProvider>
            <section className={`relative flex grow overflow-hidden`}>
              <ListChat refListChat={refListChat} />
              {selected ? (
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
            </section>
          </AttachmentProvider>
        </ParticipantProvider>
      </MessageProvider>
    </ConversationProvider>
  );
};
