// import EmojiPicker from "emoji-picker-react";
import {
  ArrowRightOutlined,
  CopyOutlined,
  EllipsisOutlined,
  PushpinOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import { useQueryClient } from "@tanstack/react-query";
import React, { useCallback, useState } from "react";
import useEventListener from "../../../hooks/useEventListener";
import { MessageCache } from "../../listchat/types";
import pinMessage from "../services/pinMessage";
import { MessageMenuProps } from "../types";

const MessageMenu = (props: MessageMenuProps) => {
  // console.log("ChatboxMenu calling");
  const { conversationId, id, message, mine, pinned } = props;

  const queryClient = useQueryClient();

  const [show, setShow] = useState(false);

  const [pinning, setPinning] = useState(false);

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
      .writeText(message)
      .then(() => {
        console.log("Message copied to clipboard");
      })
      .catch((err) => {
        console.error("Failed to copy message: ", err);
      });
  };

  const pin = async () => {
    setPinning(true);
    await pinMessage({
      conversationId: conversationId,
      messageId: id,
      pinned: !pinned,
    });

    queryClient.setQueryData(["message"], (oldData: MessageCache) => {
      return {
        ...oldData,
        messages: oldData.messages.map((mess) => {
          if (mess.id !== id) return mess;
          return {
            ...mess,
            isPinned: !pinned,
          };
        }),
      } as MessageCache;
    });
    setPinning(false);
  };

  return (
    <>
      <div
        data-show={show}
        className={`message-menu-container ${mine ? "left-[-18rem] origin-top-right" : "right-[-18rem] origin-top-left"}`}
      >
        <div className="message-menu-item" onClick={copyMessage}>
          <CopyOutlined /> Copy message
        </div>
        <div
          className={`message-menu-item ${pinning ? "pointer-events-none" : ""}`}
          onClick={pin}
        >
          {pinning ? (
            <SyncOutlined spin />
          ) : (
            <PushpinOutlined className={`${pinned ? "text-orange-500" : ""}`} />
          )}
          {pinned ? " Unpin" : " Pin"} message
        </div>
        <div className="message-menu-item">
          <ArrowRightOutlined /> Forward message
        </div>
      </div>
      <EllipsisOutlined
        className={`absolute ${mine ? "left-[-2rem]" : "right-[-2rem]"} top-[.5rem] text-lg`}
        onClick={() => setShow(!show)}
      />
    </>
  );
};

export default MessageMenu;
