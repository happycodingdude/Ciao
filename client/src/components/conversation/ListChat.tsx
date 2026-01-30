import useConversation from "../../hooks/useConversation";
import LocalLoading from "../common/LocalLoading";
import ListChatFilter from "./ListChatFilter";
import ListchatContent from "./ListchatContent";

const ListChat = () => {
  const { isLoading, isRefetching } = useConversation();

  return (
    // <div className="relative grow phone:grow laptop:w-[27rem] laptop-lg:w-[30rem]">
    <div className="relative grow">
      <ListChatFilter />
      {isLoading || isRefetching ? <LocalLoading /> : ""}
      {/* <LocalLoading /> */}
      <ListchatContent />
      <div className="mx-auto my-[.5rem] hidden items-center text-center">
        <div
          className="fa fa-arrow-down flex aspect-square w-[3rem] cursor-pointer items-center justify-center rounded-full 
          bg-[var(--main-color)] font-normal text-[var(--text-sub-color)] hover:bg-[var(--main-color-light)]"
        ></div>
      </div>
    </div>
  );
};

export default ListChat;
