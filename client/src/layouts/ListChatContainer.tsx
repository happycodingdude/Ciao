import React from "react";
import ListchatFilterProvider from "../context/ListchatFilterContext";
import ListChat from "../features/listchat/components/ListChat";
import ListChatHeader from "../features/listchat/components/ListChatHeader";

const ListChatContainer = () => {
  // console.log("ListChatContainer calling");
  return (
    <ListchatFilterProvider>
      <div className="z-[11] flex flex-col bg-[var(--bg-color)]">
        <ListChatHeader />
        <ListChat />
      </div>
    </ListchatFilterProvider>
  );
};

export default ListChatContainer;
