import React from "react";
import ListchatFilterProvider from "../context/ListchatFilterContext";
import ListChat from "../features/listchat/components/ListChat";
import ListChatHeader from "../features/listchat/components/ListChatHeader";
import useConversation from "../features/listchat/hooks/useConversation";
import { isPhoneScreen } from "../utils/getScreenSize";

const ListChatContainer = () => {
  // console.log("ListChatContainer calling");
  // const { value, setValue } = useListchatToggle();
  const { data: conversations } = useConversation();
  return (
    <ListchatFilterProvider>
      {isPhoneScreen() ? (
        <div
          className={`absolute flex w-full flex-col bg-[var(--bg-color)] transition-all duration-300
            ${conversations?.selected ? "z-0" : "z-[10]"}`}
        >
          <ListChatHeader />
          <ListChat />
        </div>
      ) : (
        <div
          className={`relative flex flex-col bg-[var(--bg-color)] transition-all duration-300
            tablet:w-[21rem] 
            laptop:w-[27rem] 
            laptop-lg:w-[30rem]`}
        >
          <ListChatHeader />
          <ListChat />
        </div>
      )}
    </ListchatFilterProvider>
  );
};

export default ListChatContainer;
