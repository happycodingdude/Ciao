import { CloseOutlined } from "@ant-design/icons";
import React, { useState } from "react";
import AddFriend from "../friend/AddFriend";
import CreateGroupChat from "./CreateGroupChat";

const ListChatHeader = (props) => {
  console.log("ListChatHeader calling");
  const { onChange } = props;

  // const refInput = useRef();
  const [text, setText] = useState("");

  return (
    <div className="flex shrink-0 items-center gap-[1rem] border-b-[.1rem] border-b-[var(--border-color)] px-[1rem] laptop:h-[6rem]">
      <div className="relative flex h-[60%] w-[70%] grow items-center">
        <input
          // ref={refInput}
          value={text}
          type="text"
          placeholder="Find and chat"
          className="h-full w-full rounded-[.5rem] bg-[var(--bg-color-extrathin)] pl-[1rem] pr-[3rem] placeholder:text-[var(--text-main-color-light)] focus:outline-none"
          // onChange={(e) => onChange(e.target.value)}
          // onChange={(e) => setText((current) => current + e.target.value)}
          onChange={(e) => {
            setText(e.target.value);
            onChange(e.target.value);
          }}
        ></input>
        <CloseOutlined
          className={`absolute right-[1rem] rounded-full bg-[var(--bg-color-extrathin)] p-[.4rem] text-xs text-[var(--text-main-color)]
            ${text === "" ? "pointer-events-none opacity-0" : "cursor-pointer opacity-100"} `}
          onClick={() => {
            // refInput.current.value = "";
            setText("");
            onChange("");
          }}
        />
      </div>
      <div className="flex h-[40%] gap-[1rem]">
        {/* <Tooltip title="Connect friends"> */}
        {/* <RelightBackground> */}
        <AddFriend />
        {/* </RelightBackground> */}
        {/* </Tooltip> */}
        {/* <Tooltip title="Create group chat"> */}
        {/* <div className="pointer-events-none flex items-center justify-center opacity-50"> */}
        <CreateGroupChat />
        {/* </div> */}
        {/* </Tooltip> */}
      </div>
    </div>
  );
};

export default ListChatHeader;
