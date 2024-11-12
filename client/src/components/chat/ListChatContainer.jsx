import React, { useState } from "react";
import ListChat from "./ListChat";
import ListChatHeader from "./ListChatHeader";

const ListChatContainer = () => {
  console.log("ListChatContainer calling");
  const [search, setSearch] = useState("");
  return (
    <div className="flex flex-col bg-[var(--bg-color-light)] shadow-[5px_0px_10px_-10px_var(--main-color)_inset] laptop:w-[27rem] laptop-lg:w-[30rem]">
      <ListChatHeader onChange={(text) => setSearch(text)} />
      <ListChat search={search} />
    </div>
  );
};

export default ListChatContainer;
