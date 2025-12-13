import { Link } from "@tanstack/react-router";
import moment from "moment";
import { useEffect, useState } from "react";
import CustomLabel from "../components/CustomLabel";
import ImageWithLightBoxAndNoLazy from "../components/ImageWithLightBoxAndNoLazy";
import ListchatLoading from "../components/ListchatLoading";
import useInfo from "../features/authentication/hooks/useInfo";
import useConversation from "../features/listchat/hooks/useConversation";
import "../listchat.css";
import { useActiveConversation } from "../features/chatbox/hooks/useActiveConversation";

moment.updateLocale("en", {
  relativeTime: {
    future: "in %s",
    past: "%s",
    s: "1m",
    ss: "1m",
    m: "1m",
    mm: "%dm",
    h: "1h",
    hh: "%dh",
    d: "1d",
    dd: "%dd",
    M: "1M",
    MM: "%dM",
    y: "1Y",
    yy: "%dY",
  },
});

const ListChatContainer = () => {
  console.log("Rendering ListChatContainer");

  // const [storedConversationId, setStoredConversationId] = useState<string>(
  //   () => {
  //     const value = localStorage.getItem("conversationId");
  //     console.log("Initial conversationId from localStorage:", value);
  //     return value || "";
  //   },
  // );

  // // Listen for localStorage changes
  // useEffect(() => {
  //   const handleStorageChange = (e: StorageEvent) => {
  //     if (e.key === "conversationId") {
  //       console.log("Storage changed - new value:", e.newValue);
  //       setStoredConversationId(e.newValue || "");
  //     }
  //   };

  //   const handleCustomEvent = (e: Event) => {
  //     const customEvent = e as CustomEvent<{ key: string }>;
  //     if (customEvent.detail.key === "conversationId") {
  //       const newValue = localStorage.getItem("conversationId") || "";
  //       console.log("Custom event - new conversationId:", newValue);
  //       setStoredConversationId(newValue);
  //     }
  //   };

  //   window.addEventListener("storage", handleStorageChange);
  //   window.addEventListener("localstorage-changed", handleCustomEvent);

  //   return () => {
  //     window.removeEventListener("storage", handleStorageChange);
  //     window.removeEventListener("localstorage-changed", handleCustomEvent);
  //   };
  // }, []);

  const activeConversationId = useActiveConversation();

  const { data: info } = useInfo();

  const { data: conversations, isLoading, isRefetching } = useConversation(1);
  if (isLoading || isRefetching) return <ListchatLoading />;

  return (
    // <>
    //   {isPhoneScreen() ? (
    //     <div
    //       className={`absolute flex h-full w-full flex-col bg-[var(--bg-color)]
    //         ${conversationId ? "z-0" : "z-[10]"}`}
    //     >
    //       <div className="flex h-[5rem] shrink-0 items-center justify-between px-[1rem]">
    //         <p className="text-xl font-bold">Messages</p>
    //         <div className="flex h-full items-center gap-[2rem]">
    //           <AddFriend />
    //           <CreateGroupChat />
    //           <ImageWithLightBoxAndNoLazy
    //             src={info.avatar}
    //             className="aspect-square w-[3rem] cursor-pointer"
    //             slides={[
    //               {
    //                 src: info.avatar,
    //               },
    //             ]}
    //             circle
    //           />
    //         </div>
    //       </div>

    //       <ListChatHeader_Mobile />
    //       <ListChat />
    //     </div>
    //   ) : (
    //     conversations?.filterConversations
    //       .filter((conv) =>
    //         conv.members.some(
    //           (mem) => mem.contact.id === info.id && !mem.isDeleted,
    //         ),
    //       )
    //       .map((item) => (
    //         <Link key={item.id} to={`/conversations/${item.id}`}>
    //           <div
    //             // className={`chat-item cursor-pointer rounded-2xl bg-gray-100 p-4 shadow-[0_0.125rem_0.25rem_rgba(0,0,0,0.075)]
    //             //     ${item.id === conversationId ? "active" : ""}`}
    //             className={`chat-item cursor-pointer rounded-2xl p-4
    //               laptop-md:text-md
    //               ${item.id === conversationId ? "active" : ""}`}
    //           >
    //             <div className="flex items-center laptop:h-[4rem] laptop-md:h-[5rem]">
    //               <div className="relative">
    //                 {/* MARK: AVATAR */}
    //                 <ImageWithLightBoxAndNoLazy
    //                   src={
    //                     item.isGroup
    //                       ? item.avatar
    //                       : item.members.find(
    //                           (item) => item.contact.id !== info.id,
    //                         )?.contact.avatar
    //                   }
    //                   className={`loaded pointer-events-none aspect-square w-[4rem] animate-morph`}
    //                   circle
    //                 />
    //                 <div
    //                   className={`absolute -bottom-1 -right-1 aspect-square w-[1.5rem] rounded-full border-2 border-white
    //                     ${item.members.some((mem) => mem.contact.isOnline && mem.contact.id !== info.id) ? "bg-green-400" : "bg-gray-400"}`}
    //                 ></div>
    //               </div>
    //               <div className="my-auto ml-[1rem] flex w-[60%] flex-col">
    //                 {/* MARK: TITLE */}
    //                 <CustomLabel
    //                   className={`${item.id === conversationId ? "text-[var(--text-sub-color)]" : "text-[var(--text-main-color)]"}
    //                       font-['Be_Vietnam_Pro'] font-semibold`}
    //                   title={
    //                     item.isGroup
    //                       ? item.title
    //                       : item.members.find(
    //                           (item) => item.contact.id !== info.id,
    //                         )?.contact.name
    //                   }
    //                 />
    //                 {/* MARK: LAST MESSAGE */}
    //                 {item.lastMessage ? (
    //                   <div className="mt-1 truncate laptop-md:text-base text-gray-600">
    //                     <CustomLabel
    //                       className={`
    //                           ${
    //                             item.id === conversationId
    //                               ? "text-[var(--text-sub-color-thin)]"
    //                               : item.unSeen
    //                                 ? "text-[var(--danger-text-color)]"
    //                                 : "text-[var(--text-main-color-blur)]"
    //                           }`}
    //                       title={item.lastMessage}
    //                     />
    //                   </div>
    //                 ) : (
    //                   ""
    //                 )}
    //               </div>
    //               {/* MARK: LAST MESSAGE TIME */}
    //               {item.lastMessageTime === null ? (
    //                 ""
    //               ) : (
    //                 <div
    //                   className={`ml-auto flex aspect-square flex-col items-center justify-center rounded-full bg-gray-100 text-xs text-gray-500 laptop:w-[2.5rem]`}
    //                 >
    //                   <p>
    //                     {item.lastMessageTime === null
    //                       ? ""
    //                       : moment(item.lastMessageTime).fromNow()}
    //                   </p>
    //                 </div>
    //               )}
    //             </div>
    //           </div>
    //         </Link>
    //       ))
    //   )}
    // </>

    conversations?.filterConversations
      .filter((conv) =>
        conv.members.some(
          (mem) => mem.contact.id === info.id && !mem.isDeleted,
        ),
      )
      .map((item) => {
        const isActive = item.id === activeConversationId;

        return (
          <Link key={item.id} to={`/conversations/${item.id}`}>
            <div
              className={`chat-item cursor-pointer rounded-2xl p-4
                  ${isActive ? "active" : ""}`}
            >
              <div className="flex items-center laptop:h-16 laptop-md:h-20">
                <div className="relative">
                  {/* MARK: AVATAR */}
                  <ImageWithLightBoxAndNoLazy
                    src={
                      item.isGroup
                        ? item.avatar
                        : item.members.find(
                            (item) => item.contact.id !== info.id,
                          )?.contact.avatar
                    }
                    className={`loaded pointer-events-none aspect-square w-16 animate-morph`}
                    circle
                  />
                  <div
                    className={`absolute -bottom-1 -right-1 aspect-square w-6 rounded-full border-2 border-white 
                        ${item.members.some((mem) => mem.contact.isOnline && mem.contact.id !== info.id) ? "bg-green-400" : "bg-gray-400"}`}
                  ></div>
                </div>
                <div className="my-auto ml-4 flex w-[60%] flex-col">
                  {/* MARK: TITLE */}
                  <CustomLabel
                    className={`${isActive ? "text-(--text-sub-color)" : "text-(--text-main-color)"} 
                          font-['Be_Vietnam_Pro'] font-semibold`}
                    title={
                      item.isGroup
                        ? item.title
                        : item.members.find(
                            (item) => item.contact.id !== info.id,
                          )?.contact.name
                    }
                  />
                  {/* MARK: LAST MESSAGE */}
                  {item.lastMessage ? (
                    <div className="mt-1 truncate text-gray-600 laptop-md:text-base">
                      <CustomLabel
                        className={`
                              ${
                                isActive
                                  ? "text-(--text-sub-color-thin)"
                                  : item.unSeen
                                    ? "text-(--danger-text-color)"
                                    : "text-(--text-main-color-blur)"
                              }`}
                        title={item.lastMessage}
                      />
                    </div>
                  ) : (
                    ""
                  )}
                </div>
                {/* MARK: LAST MESSAGE TIME */}
                {item.lastMessageTime === null ? (
                  ""
                ) : (
                  <div
                    className={`ml-auto flex aspect-square flex-col items-center justify-center rounded-full bg-gray-100 text-base text-gray-500 laptop:w-10`}
                  >
                    <p>
                      {item.lastMessageTime === null
                        ? ""
                        : moment(item.lastMessageTime).fromNow()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Link>
        );
      })
  );
};

export default ListChatContainer;
