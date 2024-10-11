import React from "react";
import RelightBackground from "../common/RelightBackground";
import AddFriend from "../friend/AddFriend";
import CreateGroupChat from "./CreateGroupChat";

const ListChatHeader = () => {
  console.log("ListChatHeader calling");

  return (
    <div className="flex items-center gap-[1rem] border-b-[.1rem] border-b-[var(--text-main-color-light)] px-[1rem] laptop:h-[5rem]">
      <div className="flex h-[50%]">
        {/* <i
          className="fa fa-search flex w-[3rem] shrink-0 items-center justify-center rounded-l-lg bg-[var(--bg-color-normal)] 
          font-normal text-[var(--icon-text-color)]"
        ></i> */}
        <input
          type="text"
          placeholder="Find and connect"
          className="w-full rounded-[.5rem] bg-[var(--bg-color-extrathin)] p-[1rem] placeholder:text-[var(--text-main-color-light)] focus:outline-none"
        ></input>
      </div>
      <div className="gap-[.5rem flex h-[50%] laptop:w-[7rem]">
        <RelightBackground>
          <AddFriend />
        </RelightBackground>
        <RelightBackground>
          <CreateGroupChat />
        </RelightBackground>
      </div>
    </div>
  );
};

export default ListChatHeader;
