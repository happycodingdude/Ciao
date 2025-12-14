import { CloseOutlined } from "@ant-design/icons";
import AddFriend from "../../friend/components/AddFriend";
import CreateGroupChat from "../../groupchat/components/CreateGroupChat";
import useListchatFilter from "../hooks/useListchatFilter";

const ListChatHeader = () => {
  const { search, setSearch } = useListchatFilter();

  return (
    <div className="flex h-20 shrink-0 items-center gap-4">
      <div className="relative flex h-[60%] w-[70%] grow items-center">
        <input
          value={search}
          type="text"
          placeholder="Find and chat"
          className="h-full w-full rounded-3xl bg-gray-100 py-[1.7rem] pl-4 pr-12 shadow-sm 
          focus:shadow-md focus:outline-none"
          onChange={(e) => setSearch(e.target.value)}
        ></input>
        <CloseOutlined
          className={`absolute right-4 rounded-full bg-(--bg-color-extrathin) p-[.4rem] text-xs text-(--text-main-color)
            ${search === "" ? "pointer-events-none opacity-0" : "cursor-pointer opacity-100"} `}
          onClick={() => setSearch("")}
        />
      </div>
      <div className="flex h-full items-center gap-4">
        <AddFriend />
        <CreateGroupChat />
      </div>
    </div>
  );
};

export default ListChatHeader;
