import { CloseOutlined } from "@ant-design/icons";
import React, { useState } from "react";
import CreateGroupChat from "../chat/CreateGroupChat";
import AddFriend from "../friend/AddFriend";

const ListChatHeader = (props) => {
  const { onChange } = props;
  const [text, setText] = useState("");

  return (
    <div className="flex shrink-0 items-center gap-[1rem] border-b-[.1rem] border-b-[var(--border-color)] px-[1rem] laptop:h-[6rem]">
      <div className="relative flex h-[60%] w-[70%] grow items-center">
        <input
          value={text}
          type="text"
          placeholder="Find and chat"
          className="h-full w-full rounded-[.5rem] bg-[var(--bg-color-extrathin)] pl-[1rem] pr-[3rem] placeholder:text-[var(--text-main-color-light)] focus:outline-none"
          onChange={(e) => {
            setText(e.target.value);
            onChange(e.target.value);
          }}
        ></input>
        <CloseOutlined
          className={`absolute right-[1rem] rounded-full bg-[var(--bg-color-extrathin)] p-[.4rem] text-xs text-[var(--text-main-color)]
            ${text === "" ? "pointer-events-none opacity-0" : "cursor-pointer opacity-100"} `}
          onClick={() => {
            setText("");
            onChange("");
          }}
        />
      </div>
      <div className="flex h-full items-center gap-[1rem]">
        <AddFriend />
        <CreateGroupChat />
      </div>
    </div>
  );
};

export default ListChatHeader;
