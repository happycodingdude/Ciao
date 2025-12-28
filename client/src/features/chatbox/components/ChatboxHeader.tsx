import { useQueryClient } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
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
  if (!conversations) return null; // Tránh render khi chưa có dữ liệu cần thiết

  const { conversationId } = useParams({
    from: "/conversations/_layout/$conversationId",
  });
  const conversation = conversations.conversations.find(
    (c) => c.id === conversationId,
  );

  return (
    <div
      className="border-b-(--border-color) text-(--text-main-color-normal) flex w-full shrink-0 items-center justify-between
      border-b-[.1rem] bg-white px-4 py-2 phone:h-24 laptop:h-20"
    >
      <div className="relative flex items-center gap-4">
        {isPhoneScreen() ? (
          <i
            className="fa-arrow-left fa flex cursor-pointer items-center justify-center p-2
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
              queryClient.setQueryData(
                ["message", conversationId],
                (oldData) => {
                  return null;
                },
              );
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
            conversation.isGroup
              ? conversation.avatar
              : conversation.members?.find(
                  (item) => item.contact.id !== info.id,
                )?.contact.avatar
          }
          slides={[
            {
              src: conversation.isGroup
                ? conversation.avatar
                : conversation.members?.find(
                    (item) => item.contact.id !== info.id,
                  )?.contact.avatar,
            },
          ]}
          className="loaded relative aspect-square w-12 cursor-pointer"
          circle
        />
        {/* MARK: TITLE  */}
        <div className="relative flex grow flex-col phone:max-w-48 laptop:max-w-120 desktop:max-w-200">
          {conversation.isGroup ? (
            <>
              <div className="flex w-full gap-2">
                <CustomLabel
                  className="font-['Be_Vietnam_Pro'] font-bold"
                  title={conversation.title}
                />
              </div>
              <p className="text-2xs">{conversation.members.length} members</p>
            </>
          ) : (
            <>
              <CustomLabel
                className="font-['Be_Vietnam_Pro'] font-bold"
                title={
                  conversation.members?.find(
                    (item) => item.contact.id !== info.id,
                  )?.contact.name
                }
              />
            </>
          )}
        </div>
      </div>
      <div className="flex gap-8">
        {isPhoneScreen() ? <ChatboxHeaderMenu_Mobile /> : <ChatboxHeaderMenu />}
      </div>
    </div>
  );
};

export default ChatboxHeader;
