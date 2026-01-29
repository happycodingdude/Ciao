import useListchatFilter from "../../../hooks/useListchatFilter";

const ListChatFilter = () => {
  const { filter, setFilter } = useListchatFilter();

  return (
    <div className="listchat-filter-container">
      <div className="listchat-filter-group">
        <div
          onClick={() => setFilter("all")}
          className={`listchat-filter-item group ${filter === "all" ? "" : "bg-[var(--bg-color-extrathin)] hover:bg-[var(--main-color-extrathin)]"}`}
          // className="listchat-filter-item group"
        >
          <input
            type="radio"
            name="radio-listchat-filter"
            className="listchat-filter-input peer"
            checked={filter === "all"}
          ></input>
          <p className="listchat-filter-text  peer-checked:text-white">All</p>
        </div>
        <div
          onClick={() => setFilter("direct")}
          className={`listchat-filter-item group ${filter === "direct" ? "" : "bg-[var(--bg-color-extrathin)] hover:bg-[var(--main-color-extrathin)]"}`}
          // className="listchat-filter-item group"
        >
          <input
            type="radio"
            name="radio-listchat-filter"
            className="listchat-filter-input peer"
            checked={filter === "direct"}
          ></input>
          <p className="listchat-filter-text  peer-checked:text-white">
            Direct
          </p>
        </div>
        <div
          onClick={() => setFilter("group")}
          className={`listchat-filter-item group ${filter === "group" ? "" : "bg-[var(--bg-color-extrathin)] hover:bg-[var(--main-color-extrathin)]"}`}
          // className="listchat-filter-item group"
        >
          <input
            type="radio"
            name="radio-listchat-filter"
            className="listchat-filter-input peer"
            checked={filter === "group"}
          ></input>
          <p className="listchat-filter-text  peer-checked:text-white">Group</p>
        </div>
        <div
          data-tab={filter}
          className="phone:data-[tab=all]:translate-x-[1.5rem] phone:data-[tab=direct]:translate-x-[10.5rem] phone:data-[tab=group]:translate-x-[19.5rem] tablet:data-[tab=all]:translate-x-[.5rem] tablet:data-[tab=direct]:translate-x-[7.5rem] tablet:data-[tab=group]:translate-x-[14.5rem] laptop:data-[tab=all]:translate-x-[1.5rem] laptop:data-[tab=direct]:translate-x-[10.5rem]
          laptop:data-[tab=group]:translate-x-[19.5rem] absolute top-[.3rem] 
          h-[4rem] w-[6rem] rounded-[1rem]
          bg-[var(--main-color)] transition-all duration-300"
        ></div>
      </div>
    </div>
  );
};

export default ListChatFilter;
