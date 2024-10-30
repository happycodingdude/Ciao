import React from "react";
import AddFriend from "../friend/AddFriend";
import CreateGroupChat from "./CreateGroupChat";

const ListChatHeader = () => {
  console.log("ListChatHeader calling");

  return (
    <div className="flex shrink-0 items-center gap-[1rem] border-b-[.1rem] border-b-[var(--text-main-color-light)] px-[1rem] laptop:h-[6rem]">
      <div className="flex h-[60%]">
        <input
          type="text"
          placeholder="Find and connect"
          className="w-full rounded-[.5rem] bg-[var(--bg-color-extrathin)] px-[1rem] placeholder:text-[var(--text-main-color-light)] focus:outline-none"
        ></input>
      </div>
      <div className="flex h-[40%] gap-[1rem]">
        {/* <Tooltip title="Connect friends"> */}
        {/* <RelightBackground> */}
        <AddFriend />
        {/* </RelightBackground> */}
        {/* </Tooltip> */}
        {/* <Tooltip title="Create group chat"> */}
        <div className="pointer-events-none flex items-center justify-center opacity-50">
          <CreateGroupChat />
        </div>
        {/* </Tooltip> */}
      </div>
    </div>
  );
};

export default ListChatHeader;
