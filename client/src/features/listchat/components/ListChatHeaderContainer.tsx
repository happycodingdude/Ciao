import useListchatFilter from "../hooks/useListchatFilter";
import ListChatHeader from "./ListChatHeader";

const ListChatHeaderContainer = () => {
  const { filter, setFilter } = useListchatFilter();
  return (
    <div className="flex flex-col gap-[1.5rem] px-[2rem] pt-[1rem]">
      {/* MARK: List chat header */}
      <div className="relative">
        <ListChatHeader />
      </div>
      {/* MARK: List chat filter */}
      <div className="flex gap-[1rem]">
        <div
          className={`${filter === "all" ? "selected" : ""}  cursor-pointer rounded-full bg-white px-6 py-3 text-sm font-medium text-gray-600 
                shadow-[0_0.125rem_0.25rem_rgba(0,0,0,0.075)] transition-colors duration-300 ease-in-out hover:shadow-md`}
          onClick={() => setFilter("all")}
        >
          All
        </div>
        <div
          className={`${filter === "direct" ? "selected" : ""} cursor-pointer rounded-full bg-white px-6 py-3 text-sm font-medium text-gray-600 
                shadow-[0_0.125rem_0.25rem_rgba(0,0,0,0.075)] transition-colors duration-300 ease-in-out hover:shadow-md`}
          onClick={() => setFilter("direct")}
        >
          Direct
        </div>
        <div
          className={`${filter === "group" ? "selected" : ""} cursor-pointer rounded-full bg-white px-6 py-3 text-sm font-medium text-gray-600 
                shadow-[0_0.125rem_0.25rem_rgba(0,0,0,0.075)] transition-colors duration-300 ease-in-out hover:shadow-md`}
          onClick={() => setFilter("group")}
        >
          Group
        </div>
      </div>
    </div>
  );
};

export default ListChatHeaderContainer;
