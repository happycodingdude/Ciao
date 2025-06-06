// import EmojiPicker from "emoji-picker-react";
import {
  ArrowRightOutlined,
  CopyOutlined,
  EllipsisOutlined,
  PushpinOutlined,
} from "@ant-design/icons";
import React, { useState } from "react";
import { MessageMenuProps } from "../types";

const MessageMenu = (props: MessageMenuProps) => {
  // console.log("ChatboxMenu calling");
  const { id, message, mine } = props;

  const [show, setShow] = useState(true);

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

  return (
    <>
      <div
        data-show={show}
        className={`message-menu-container ${mine ? "left-[-18rem]" : "right-[-18rem]"}`}
      >
        <div className="message-menu-item" onClick={copyMessage}>
          <CopyOutlined /> Copy message
        </div>
        <div className="message-menu-item">
          <PushpinOutlined /> Pin message
        </div>
        <div className="message-menu-item">
          <ArrowRightOutlined /> Forward message
        </div>
      </div>
      <EllipsisOutlined
        className={`absolute ${mine ? "left-[-2rem]" : "right-[-2rem]"} top-[.5rem] text-lg`}
      />
    </>
  );
};

export default MessageMenu;
