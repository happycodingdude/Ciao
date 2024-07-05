import React from "react";
import AddFriend from "../friend/AddFriend";
import CreateGroupChat from "./CreateGroupChat";

const ListChatHeader = () => {
  console.log("ListChatHeader calling");

  return (
    <div className="flex h-[7rem] shrink-0 items-center gap-[1rem] border-b-[.1rem] border-b-[var(--border-color)] px-[2rem]">
      <div className="flex h-[50%] grow">
        <i
          className="fa fa-search flex w-[3rem] shrink-0 items-center justify-center rounded-l-lg bg-[var(--search-bg-color)] pl-[1rem] 
          font-normal text-[var(--icon-text-color)]"
        ></i>
        <input
          type="text"
          placeholder="Search"
          className="w-full rounded-r-[.5rem] bg-[var(--search-bg-color)] p-[1rem] focus:outline-none"
        ></input>
      </div>
      <div className="flex h-[50%] gap-[.5rem] [&>*]:px-[.5rem]">
        <AddFriend />
        <CreateGroupChat />
      </div>
    </div>
  );
};

export default ListChatHeader;
