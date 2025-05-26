// import EmojiPicker from "emoji-picker-react";
import React, { useState } from "react";
import { MessageMenuProps } from "../types";

const MessageMenu = (props: MessageMenuProps) => {
  // console.log("ChatboxMenu calling");
  const { id, className } = props;

  const [show, setShow] = useState(false);

  return (
    <div
      className={`absolute right-0 top-[1rem] h-[2rem] w-[5rem] bg-red-500`}
    ></div>
  );
};

export default MessageMenu;
