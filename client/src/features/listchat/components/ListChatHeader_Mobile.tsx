import { CloseOutlined } from "@ant-design/icons";
import React from "react";
import useListchatFilter from "../hooks/useListchatFilter";

const ListChatHeader_Mobile = () => {
  const { search, setSearch } = useListchatFilter();

  return (
    <div className="flex h-[6rem] shrink-0 items-center gap-[1rem] px-[1rem]">
      <div className="relative flex h-[60%] w-[70%] grow items-center">
        <input
          value={search}
          type="text"
          placeholder="Find and chat"
          className="h-full w-full rounded-[.5rem] bg-[var(--bg-color-extrathin)] pl-[1rem] pr-[3rem] placeholder:text-[var(--text-main-color-light)] focus:outline-none"
          onChange={(e) => setSearch(e.target.value)}
        ></input>
        <CloseOutlined
          className={`absolute right-[1rem] rounded-full bg-[var(--bg-color-extrathin)] p-[.4rem] text-xs text-[var(--text-main-color)]
            ${search === "" ? "pointer-events-none opacity-0" : "cursor-pointer opacity-100"} `}
          onClick={() => setSearch("")}
        />
      </div>
      {/* <div className="flex h-full items-center gap-[1rem]">
        <AddFriend />
        <CreateGroupChat />
      </div> */}
    </div>
  );
};

export default ListChatHeader_Mobile;
