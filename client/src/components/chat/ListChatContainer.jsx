import React, { useState } from "react";
import ListChat from "./ListChat";
import ListChatHeader from "./ListChatHeader";

const ListChatContainer = () => {
  console.log("ListChatContainer calling");
  const [search, setSearch] = useState("");
  return (
    <div className="flex flex-col laptop:w-[27rem] laptop-lg:w-[30rem]">
      <ListChatHeader onChange={(text) => setSearch(text)} />
      <ListChat search={search} />
    </div>
  );
};

export default ListChatContainer;
