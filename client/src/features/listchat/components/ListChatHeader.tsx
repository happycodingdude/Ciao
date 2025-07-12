import { CloseOutlined } from "@ant-design/icons";
import React from "react";
import AddFriend from "../../friend/components/AddFriend";
import CreateGroupChat from "../../groupchat/components/CreateGroupChat";
import useListchatFilter from "../hooks/useListchatFilter";

const ListChatHeader = () => {
  const { search, setSearch } = useListchatFilter();

  return (
    <div className="flex h-[5rem] shrink-0 items-center gap-[1rem]">
      <div className="relative flex h-[60%] w-[70%] grow items-center">
        <input
          value={search}
          type="text"
          placeholder="Find and chat"
          className="h-full w-full rounded-3xl bg-white py-[1.7rem] pl-[1rem] pr-[3rem] shadow-sm 
          focus:shadow-lg focus:outline-none"
          onChange={(e) => setSearch(e.target.value)}
        ></input>
        <CloseOutlined
          className={`absolute right-[1rem] rounded-full bg-[var(--bg-color-extrathin)] p-[.4rem] text-xs text-[var(--text-main-color)]
            ${search === "" ? "pointer-events-none opacity-0" : "cursor-pointer opacity-100"} `}
          onClick={() => setSearch("")}
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
