import React from "react";
import useListchatFilter from "../hooks/useListchatFilter";

const ListChatFilter_V1 = () => {
  const { filter, setFilter } = useListchatFilter();

  return (
    <div className="flex justify-between border-b-[.1rem] border-b-[var(--border-color)]">
      <div className="relative flex w-[27rem]">
        <div
          onClick={() => setFilter("all")}
          className="group relative flex-1 cursor-pointer py-[1rem] text-center text-[var(--text-main-color)]"
        >
          <input
            type="radio"
            name="radio-listchat-filter"
            className="peer absolute left-0 top-0 h-full w-full cursor-pointer opacity-0"
            checked={filter === "all"}
          ></input>
          <p className="group-hover:text-[var(--main-color-bold)] peer-checked:text-[var(--main-color-bold)]">
            All
          </p>
        </div>
        <div
          onClick={() => setFilter("direct")}
          className="group relative flex-1 cursor-pointer py-[1rem] text-center text-[var(--text-main-color)]"
        >
          <input
            type="radio"
            name="radio-listchat-filter"
            className="peer absolute left-0 top-0 h-full w-full cursor-pointer opacity-0"
            checked={filter === "direct"}
          ></input>
          <p className="group-hover:text-[var(--main-color-bold)] peer-checked:text-[var(--main-color-bold)]">
            Direct
          </p>
        </div>
        <div
          onClick={() => setFilter("group")}
          className="group relative flex-1 cursor-pointer py-[1rem] text-center text-[var(--text-main-color)]"
        >
          <input
            type="radio"
            name="radio-listchat-filter"
            className="peer absolute left-0 top-0 h-full w-full cursor-pointer opacity-0"
            checked={filter === "group"}
          ></input>
          <p className="group-hover:text-[var(--main-color-bold)] peer-checked:text-[var(--main-color-bold)]">
            Group
          </p>
        </div>
        <div
          data-tab={filter}
          className="absolute bottom-0 h-[.2rem] w-[6rem] bg-[var(--main-color)] transition-all duration-200 
          phone:data-[tab=all]:translate-x-[1.5rem] phone:data-[tab=direct]:translate-x-[10.5rem] phone:data-[tab=group]:translate-x-[19.5rem] 
          tablet:data-[tab=all]:translate-x-[.5rem] tablet:data-[tab=direct]:translate-x-[7.5rem] tablet:data-[tab=group]:translate-x-[14.5rem]
          laptop:data-[tab=all]:translate-x-[1.5rem] laptop:data-[tab=direct]:translate-x-[10.5rem] laptop:data-[tab=group]:translate-x-[19.5rem]"
        ></div>
      </div>
    </div>
  );
};

export default ListChatFilter_V1;
