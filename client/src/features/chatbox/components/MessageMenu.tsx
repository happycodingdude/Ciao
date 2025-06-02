// import EmojiPicker from "emoji-picker-react";
import { EllipsisOutlined } from "@ant-design/icons";
import React, { useState } from "react";
import { MessageMenuProps } from "../types";

const MessageMenu = (props: MessageMenuProps) => {
  // console.log("ChatboxMenu calling");
  const { id, mine } = props;

  const [show, setShow] = useState(false);

  return (
    // <div
    //   className={`absolute ${mine ? "left-[-5rem]" : "right-[-5rem]"}  top-[1rem] h-[2rem] w-[5rem] bg-red-500`}
    // ></div>

    <EllipsisOutlined
      className={`absolute ${mine ? "left-[-2rem]" : "right-[-2rem]"}  top-[.5rem] text-lg`}
    />
  );
};

export default MessageMenu;
