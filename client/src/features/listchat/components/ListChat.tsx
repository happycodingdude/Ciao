import React from "react";
import LocalLoading from "../../../components/LocalLoading";
import useConversation from "../hooks/useConversation";
import ListChatFilter from "./ListChatFilter";
import ListchatContent from "./ListchatContent";

const ListChat = () => {
  const { isLoading, isRefetching } = useConversation(1);

  return (
    <div className="relative grow laptop:w-[27rem] laptop-lg:w-[30rem]">
      <ListChatFilter />
      {isLoading || isRefetching ? <LocalLoading /> : ""}
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
