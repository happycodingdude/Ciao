import { useQueryClient } from "@tanstack/react-query";
import React from "react";
import CustomLabel from "../../../components/CustomLabel";
import ImageWithLightBoxAndNoLazy from "../../../components/ImageWithLightBoxAndNoLazy";
import { isPhoneScreen } from "../../../utils/getScreenSize";
import useInfo from "../../authentication/hooks/useInfo";
import useConversation from "../../listchat/hooks/useConversation";
import { ConversationCache } from "../../listchat/types";
import ChatboxHeaderMenu from "./ChatboxHeaderMenu";
import ChatboxHeaderMenu_Mobile from "./ChatboxHeaderMenu_Mobile";

const ChatboxHeader = () => {
  const queryClient = useQueryClient();
  const { data: info } = useInfo();
  const { data: conversations } = useConversation();
  if (!conversations || !conversations.selected) return;

  return (
    <div
      className="flex w-full shrink-0 items-center justify-between border-b-[.1rem] border-[var(--border-color)] px-[1rem] 
    py-[.5rem] text-[var(--text-main-color-normal)] phone:h-[6rem] laptop:h-[6rem]"
    >
      <div className="relative flex items-center gap-[1rem]">
        {isPhoneScreen() ? (
          <i
            className="fa-arrow-left fa flex cursor-pointer items-center justify-center p-[.5rem]
            text-xl transition-all duration-500"
            onClick={() => {
              queryClient.setQueryData(
                ["conversation"],
                (oldData: ConversationCache) => {
                  return {
                    ...oldData,
                    selected: null,
                  } as ConversationCache;
                },
              );
              queryClient.setQueryData(["message"], (oldData) => {
                return null;
              });
              queryClient.setQueryData(["attachment"], (oldData) => {
                return null;
              });
            }}
          ></i>
        ) : (
          ""
        )}
        {/* MARK: AVATAR  */}
        <ImageWithLightBoxAndNoLazy
          src={
            conversations.selected.isGroup
              ? conversations.selected.avatar
              : conversations.selected.members?.find(
                  (item) => item.contact.id !== info.id,
                )?.contact.avatar
          }
          slides={[
            {
              src: conversations.selected.isGroup
                ? conversations.selected.avatar
                : conversations.selected.members?.find(
                    (item) => item.contact.id !== info.id,
                  )?.contact.avatar,
            },
          ]}
          className="loaded relative aspect-square w-[4rem] cursor-pointer"
          circle
        />
        {/* MARK: TITLE  */}
        <div className="relative flex grow flex-col text-md phone:max-w-[12rem] laptop:max-w-[30rem] desktop:max-w-[50rem]">
          {conversations.selected.isGroup ? (
            <>
              <div className="flex w-full gap-[.5rem]">
                <CustomLabel
                  className="font-bold"
                  title={conversations.selected.title}
                />
              </div>
              <p className="text-sm">
                {conversations.selected.members.length} members
              </p>
            </>
          ) : (
            <>
              <CustomLabel
                className="font-bold"
                title={
                  conversations.selected.members?.find(
                    (item) => item.contact.id !== info.id,
                  )?.contact.name
                }
              />
            </>
          )}
        </div>
      </div>
      <div className="flex gap-[2rem]">
        {isPhoneScreen() ? <ChatboxHeaderMenu_Mobile /> : <ChatboxHeaderMenu />}
      </div>
    </div>
  );
};

export default ChatboxHeader;
