// import EmojiPicker from "emoji-picker-react";
import { CopyOutlined, PushpinOutlined, SyncOutlined } from "@ant-design/icons";
import { useQueryClient } from "@tanstack/react-query";
import React, { Suspense, useCallback, useRef, useState } from "react";
import { toast } from "react-toastify";
import BackgroundPortal from "../../../components/BackgroundPortal";
import ModalLoading from "../../../components/ModalLoading";
import useEventListener from "../../../hooks/useEventListener";
import "../../../messagemenu_slide.css";
import useInfo from "../../authentication/hooks/useInfo";
import useConversation from "../../listchat/hooks/useConversation";
import { MessageCache } from "../../listchat/types";
import pinMessage from "../services/pinMessage";
import { MessageMenuProps } from "../types";
import ForwardMessageModal from "./ForwardMessageModal";
import MessageMenuItem from "./MessageMenuItem";

const MessageMenu_Slide = (props: MessageMenuProps) => {
  // console.log("ChatboxMenu calling");
  const { conversationId, message, mine, contact, getContainerRect } = props;

  const { data: conversations } = useConversation();
  const conversation = conversations.conversations.find(
    (c) => c.id === conversationId,
  );

  const queryClient = useQueryClient();

  const { data: info } = useInfo();

  const [show, setShow] = useState<boolean>(false);
  const [pinning, setPinning] = useState<boolean>(false);
  const [openForward, setOpenForward] = useState<boolean>(false);

  const refMenu = useRef<HTMLDivElement>(null);

  // Event listener
  const hideMenuOnClick = useCallback((e) => {
    if (
      Array.from(e.target.classList).includes("message-menu-container") ||
      Array.from(e.target.classList).includes("message-menu-item")
    )
      return;
    setShow(false);
  }, []);
  useEventListener("click", hideMenuOnClick);

  const copyMessage = () => {
    if (!message) return;
    navigator.clipboard
      .writeText(message.content)
      .then(() => {
        toast.success("Message copied to clipboard");
        // console.log("Message copied to clipboard");
      })
      .catch((err) => {
        console.error("Failed to copy message: ", err);
      });
  };

  const pin = async () => {
    setPinning(true);
    await pinMessage({
      conversationId: conversationId,
      messageId: message.id,
      pinned: !message.isPinned,
    });

    queryClient.setQueryData(
      ["message", conversationId],
      (oldData: MessageCache) => {
        return {
          ...oldData,
          messages: oldData.messages.map((mess) => {
            if (mess.id !== message.id) return mess;
            return {
              ...mess,
              isPinned: !message.isPinned,
              pinnedBy: info.id,
            };
          }),
        } as MessageCache;
      },
    );
    setPinning(false);
  };

  const toggleMenu = useCallback(
    (e: React.MouseEvent) => {
      const menu = refMenu.current;
      if (!menu) return;

      const containerRect = getContainerRect();
      const clickY = e.clientY;

      const direction =
        clickY > containerRect.top + containerRect.height / 2
          ? "above"
          : "below";

      setShow((prev) => !prev);

      // Gán class direction
      menu.classList.remove("above", "below");
      menu.classList.add(direction);
      menu.style.transformOrigin = `${mine ? "100%" : "0%"} ${direction === "above" ? "60%" : "40%"} `;
    },
    [getContainerRect],
  );

  const replyMessage = () => {
    queryClient.setQueryData(["reply"], {
      replyId: message.id,
      replyContact: mine ? info.id : contact.id,
      replyContactName: mine ? info.name : contact.name,
      replyContent: message.content || "",
    });
  };

  return (
    <>
      <div
        ref={refMenu}
        data-show={show}
        data-mine={mine}
        className={`message-menu-container`}
      >
        {/* MARK: COPY */}
        <MessageMenuItem
          onClick={copyMessage}
          closeOnClick={false}
          tooltip="Copy message"
        >
          <CopyOutlined />
        </MessageMenuItem>
        {/* MARK: PIN */}
        <MessageMenuItem
          className={`${pinning ? "pointer-events-none" : ""} ${message.isPinned && !pinning ? "text-light-blue-500" : ""}`}
          onClick={pin}
          closeOnClick={false}
          tooltip={message.isPinned ? "Unpin message" : "Pin message"}
        >
          {pinning ? <SyncOutlined spin /> : <PushpinOutlined rotate={316} />}
        </MessageMenuItem>
        {/* MARK: REPLY */}
        <MessageMenuItem
          onClick={replyMessage}
          closeOnClick={true}
          close={() => setShow(false)}
          tooltip="Reply message"
        >
          <i className="fa fa-reply" />
        </MessageMenuItem>
        {/* MARK: FORWARD */}
        <MessageMenuItem
          onClick={() => setOpenForward(true)}
          closeOnClick={true}
          close={() => setShow(false)}
          tooltip="Forward message"
        >
          <i className="fa fa-share" />
          <BackgroundPortal
            show={openForward}
            className="laptop:w-100 phone:w-80 desktop:w-[35%]"
            title="Forward message"
            onClose={() => setOpenForward(false)}
          >
            <div className="phone:h-100 laptop:h-120 laptop-lg:h-150 desktop:h-200 flex flex-col p-5">
              <Suspense fallback={<ModalLoading />}>
                <ForwardMessageModal
                  message={message}
                  forward={true}
                  directContact={
                    !conversation.isGroup
                      ? conversation.members?.find(
                          (item) => item.contact.id !== info.id,
                        )?.contact.id
                      : undefined
                  }
                />
              </Suspense>
            </div>
          </BackgroundPortal>
        </MessageMenuItem>
      </div>
    </>
  );
};

export default MessageMenu_Slide;
