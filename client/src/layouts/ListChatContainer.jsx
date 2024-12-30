import React from "react";
import ListchatFilterProvider from "../context/ListchatFilterContext";
import ListChat from "../features/listchat/components/ListChat";
import ListChatHeader from "../features/listchat/components/ListChatHeader";

const ListChatContainer = () => {
  console.log("ListChatContainer calling");
  return (
    <ListchatFilterProvider>
      <div className="flex flex-col laptop:w-[27rem] laptop-lg:w-[30rem]">
        <ListChatHeader />
        <ListChat />
      </div>
    </ListchatFilterProvider>
  );
};

export default ListChatContainer;
