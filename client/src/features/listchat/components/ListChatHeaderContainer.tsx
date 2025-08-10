import useListchatFilter from "../hooks/useListchatFilter";
import ListChatHeader from "./ListChatHeader";
import '../../../button.css'

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
          className={`${filter === "all" ? "selected" : ""} custom-button`}
          onClick={() => setFilter("all")}
        >
          All
        </div>
        <div
          className={`${filter === "direct" ? "selected" : ""} custom-button`}
          onClick={() => setFilter("direct")}
        >
          Direct
        </div>
        <div
          className={`${filter === "group" ? "selected" : ""} custom-button`}
          onClick={() => setFilter("group")}
        >
          Group
        </div>
      </div>
    </div>
  );
};

export default ListChatHeaderContainer;
