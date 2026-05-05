import useListchatFilter from "../../hooks/useListchatFilter";

const FILTER_OPTIONS = [
  { value: "all", label: "All" },
  { value: "direct", label: "Direct" },
  { value: "group", label: "Group" },
] as const;

const ListChatFilter = () => {
  const { filter, setFilter } = useListchatFilter();

  return (
    <div className="listchat-filter-container">
      <div className="listchat-filter-group">
        {FILTER_OPTIONS.map((opt) => {
          const isActive = filter === opt.value;
          return (
            <div
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              className={`listchat-filter-item group ${
                isActive
                  ? ""
                  : "bg-(--bg-color-extrathin) hover:bg-(--main-color-extrathin)"
              }`}
            >
              <input
                type="radio"
                name="radio-listchat-filter"
                className="listchat-filter-input peer"
                checked={isActive}
                readOnly
              />
              <p className="listchat-filter-text peer-checked:text-white">
                {opt.label}
              </p>
            </div>
          );
        })}
        {/*
          Thumb trượt highlight filter đang active.
          translate-x phải literal class do Tailwind JIT — không thể compute động qua style.
        */}
        <div
          data-tab={filter}
          className="bg-(--main-color) absolute top-[.3rem] h-16 w-24 rounded-2xl transition-all duration-300
            phone:data-[tab=all]:translate-x-6 phone:data-[tab=direct]:translate-x-42 phone:data-[tab=group]:translate-x-78
            tablet:data-[tab=all]:translate-x-2 tablet:data-[tab=direct]:translate-x-30 tablet:data-[tab=group]:translate-x-58
            laptop:data-[tab=all]:translate-x-6 laptop:data-[tab=direct]:translate-x-42 laptop:data-[tab=group]:translate-x-78"
        />
      </div>
    </div>
  );
};

export default ListChatFilter;
