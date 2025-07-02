import { useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import { flushSync } from "react-dom";
import CustomLabel from "../components/CustomLabel";
import ImageWithLightBoxAndNoLazy from "../components/ImageWithLightBoxAndNoLazy";
import LocalLoading from "../components/LocalLoading";
import ListchatFilterProvider from "../context/ListchatFilterContext";
import useInfo from "../features/authentication/hooks/useInfo";
import getMessages from "../features/chatbox/services/getMessages";
import getAttachments from "../features/chatdetail/services/getAttachments";
import AddFriend from "../features/friend/components/AddFriend";
import CreateGroupChat from "../features/groupchat/components/CreateGroupChat";
import ListChat from "../features/listchat/components/ListChat";
import ListChatHeader_Mobile from "../features/listchat/components/ListChatHeader_Mobile";
import useConversation from "../features/listchat/hooks/useConversation";
import { ConversationCache } from "../features/listchat/types";
import useLoading from "../hooks/useLoading";
import "../listchat.css";
import { isPhoneScreen } from "../utils/getScreenSize";

const ListChatContainer = () => {
  // console.log("ListChatContainer calling");
  // const { value, setValue } = useListchatToggle();
  const { data: conversations, isLoading, isRefetching } = useConversation();
  const { data: info } = useInfo();

  const [filter, setFilter] = useState<"all" | "direct" | "group">("all");

  const queryClient = useQueryClient();
  const { setLoading } = useLoading();
  const clickConversation = async (id: string) => {
    if (conversations.selected?.id === id) return;

    flushSync(() => {
      setLoading(true);
    });

    queryClient.setQueryData(["conversation"], (oldData: ConversationCache) => {
      const data: ConversationCache = {
        ...oldData,
        selected: oldData.filterConversations.find((item) => item.id === id),
        reload: true,
        quickChat: false,
        message: null,
      };
      return data;
    });

    const [messages, attachments] = await Promise.all([
      getMessages(id, 1),
      getAttachments(id),
    ]);

    queryClient.setQueryData(["message"], messages);
    queryClient.setQueryData(["attachment"], attachments);

    setLoading(false);
  };

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
          id="chat-list-v2"
          className="version-2 flex h-screen w-[30rem] shrink-0 flex-col rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50"
        >
          <div className="p-[2rem]">
            <div className="relative mb-6">
              <input
                type="text"
                placeholder="Find and chat"
                className="w-full rounded-3xl bg-white px-4 py-3 pr-20 shadow-sm focus:shadow-lg focus:outline-none"
              />
              <div className="absolute right-3 top-1/2 flex -translate-y-1/2 transform space-x-2">
                <div className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-purple-100 hover:bg-purple-200">
                  <i className="fa-solid fa-filter text-xs text-purple-600"></i>
                </div>
                <div className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-purple-100 hover:bg-purple-200">
                  <i className="fa-solid fa-gear text-xs text-purple-600"></i>
                </div>
              </div>
            </div>

            <div className="mb-6 flex gap-[1rem]">
              <div
                className={`${filter === "all" ? "selected" : ""}  cursor-pointer rounded-full bg-white px-6 py-3 text-sm font-medium text-gray-600 
                shadow-[0_0.125rem_0.25rem_rgba(0,0,0,0.075)] transition-colors duration-300 ease-in-out hover:shadow-md`}
                onClick={() => setFilter("all")}
              >
                All
              </div>
              <div
                className={`${filter === "direct" ? "selected" : ""} cursor-pointer rounded-full bg-white px-6 py-3 text-sm font-medium text-gray-600 
                shadow-[0_0.125rem_0.25rem_rgba(0,0,0,0.075)] transition-colors duration-300 ease-in-out hover:shadow-md`}
                onClick={() => setFilter("direct")}
              >
                Direct
              </div>
              <div
                className={`${filter === "group" ? "selected" : ""} cursor-pointer rounded-full bg-white px-6 py-3 text-sm font-medium text-gray-600 
                shadow-[0_0.125rem_0.25rem_rgba(0,0,0,0.075)] transition-colors duration-300 ease-in-out hover:shadow-md`}
                onClick={() => setFilter("group")}
              >
                Group
              </div>
            </div>
          </div>

          <div
            className={`relative flex grow flex-col gap-[2rem] ${isLoading || isRefetching ? "" : "px-[2rem]"}`}
          >
            {/* <LocalLoading /> */}
            {isLoading || isRefetching ? <LocalLoading /> : ""}
            {conversations?.filterConversations
              .filter((conv) =>
                conv.members.some(
                  (mem) => mem.contact.id === info.id && !mem.isDeleted,
                ),
              )
              .map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    clickConversation(item.id);
                  }}
                >
                  <div className="chat-item cursor-pointer rounded-2xl bg-white p-4 shadow-[0_0.125rem_0.25rem_rgba(0,0,0,0.075)]">
                    <div className="flex items-center justify-between">
                      <div className="relative">
                        <div className="animate-morph flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-400 to-pink-400">
                          <ImageWithLightBoxAndNoLazy
                            src={
                              item.isGroup
                                ? item.avatar
                                : item.members.find(
                                    (item) => item.contact.id !== info.id,
                                  )?.contact.avatar
                            }
                            className={`loaded pointer-events-none aspect-square w-[2rem]`}
                            circle
                          />
                        </div>
                        <div className="absolute -bottom-1 -right-1 h-4 w-4 animate-pulse rounded-full border-2 border-white bg-green-400"></div>
                      </div>
                      <div className="w-[80%]">
                        <div className="flex items-start justify-between">
                          <CustomLabel
                            className={`${item.id === conversations.selected?.id ? "text-[var(--text-sub-color)]" : "text-[var(--text-main-color)]"} font-semibold`}
                            title={
                              item.isGroup
                                ? item.title
                                : item.members.find(
                                    (item) => item.contact.id !== info.id,
                                  )?.contact.name
                            }
                          />
                          <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-500">
                            2m
                          </span>
                        </div>
                        <p className="mt-1 truncate text-sm text-gray-600">
                          <CustomLabel
                            className={`
                              ${
                                item.id === conversations.selected?.id
                                  ? "text-[var(--text-sub-color-thin)]"
                                  : item.unSeen
                                    ? "text-[var(--danger-text-color)]"
                                    : "text-[var(--text-main-color-blur)]"
                              }`}
                            title={item.lastMessage}
                          />
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </ListchatFilterProvider>
  );
};

export default ListChatContainer;
