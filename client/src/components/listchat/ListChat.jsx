import React from "react";
import { useConversation } from "../../hook/CustomHooks";
import LocalLoading from "../common/LocalLoading";
import ListchatContent from "./ListchatContent";
import ListChatFilter from "./ListChatFilter";

const ListChat = () => {
  const { isLoading, isRefetching } = useConversation();

  return (
    <div className="relative grow">
      {isLoading || isRefetching ? <LocalLoading /> : ""}
      <ListChatFilter />
      <ListchatContent />
      <div
        className="mx-auto my-[.5rem] hidden items-center text-center"
      >
        <div
          className="fa fa-arrow-down flex aspect-square w-[3rem] cursor-pointer items-center justify-center rounded-full 
          bg-[var(--main-color)] font-normal text-[var(--text-sub-color)] hover:bg-[var(--main-color-light)]"
        ></div>
      </div>
    </div>
  );
};

export default ListChat;
