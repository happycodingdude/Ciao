import React from "react";
import ImageWithLightBoxAndNoLazy from "../components/ImageWithLightBoxAndNoLazy";
import ListchatFilterProvider from "../context/ListchatFilterContext";
import useInfo from "../features/authentication/hooks/useInfo";
import AddFriend from "../features/friend/components/AddFriend";
import CreateGroupChat from "../features/groupchat/components/CreateGroupChat";
import ListChat from "../features/listchat/components/ListChat";
import ListChatHeader from "../features/listchat/components/ListChatHeader";
import ListChatHeader_Mobile from "../features/listchat/components/ListChatHeader_Mobile";
import useConversation from "../features/listchat/hooks/useConversation";
import { isPhoneScreen } from "../utils/getScreenSize";

const ListChatContainer_V1 = () => {
  // console.log("ListChatContainer calling");
  // const { value, setValue } = useListchatToggle();
  const { data: conversations } = useConversation();
  const { data: info } = useInfo();
  return (
    <ListchatFilterProvider>
      {isPhoneScreen() ? (
        <div
          className={`absolute flex h-full w-full flex-col bg-[var(--bg-color)]
            ${conversations?.selected ? "z-0" : "z-[10]"}`}
        >
          <div className="flex h-[5rem] shrink-0 items-center justify-between px-[1rem]">
            <p className="text-xl font-bold">Messages</p>
            <div className="flex h-full items-center gap-[2rem]">
              <AddFriend />
              <CreateGroupChat />
              <ImageWithLightBoxAndNoLazy
                src={info.avatar}
                className="aspect-square w-[3rem] cursor-pointer"
                slides={[
                  {
                    src: info.avatar,
                  },
                ]}
                circle
              />
            </div>
          </div>

          <ListChatHeader_Mobile />
          <ListChat />
        </div>
      ) : (
        <div
          className={`relative flex flex-col bg-[var(--bg-color)]
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

export default ListChatContainer_V1;
