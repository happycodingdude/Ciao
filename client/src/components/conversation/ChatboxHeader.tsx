import { useQueryClient } from "@tanstack/react-query";
import useConversation from "../../hooks/useConversation";
import useInfo from "../../hooks/useInfo";
import { Route } from "../../routes/_layout.conversations.$conversationId";
import { ConversationCache } from "../../types/conv.types";
import useIsPhoneScreen from "../../hooks/useIsPhoneScreen";
import CustomLabel from "../common/CustomLabel";
import ImageWithLightBoxAndNoLazy from "../common/ImageWithLightBoxAndNoLazy";
import ChatboxHeaderMenu from "./ChatboxHeaderMenu";
import ChatboxHeaderMenu_Mobile from "./ChatboxHeaderMenu_Mobile";

const ChatboxHeader = () => {
  const queryClient = useQueryClient();
  const { data: info } = useInfo();
  const { data: conversations } = useConversation();
  const { conversationId } = Route.useParams();
  const isPhone = useIsPhoneScreen();

  if (!conversations) return null;
  const conversation = conversations?.conversations?.find(
    (c) => c.id === conversationId,
  );

  const otherMember = (conversation?.members ?? []).find(
    (item) => item.contact?.id !== info?.id,
  );

  return (
    <div
      className="border-b-(--border-color) text-(--text-main-color-normal) panel-header-h flex w-full
      items-center justify-between border-b-[.1rem] bg-white px-4"
    >
      <div className="relative flex items-center gap-4">
        {isPhone ? (
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
                () => null,
              );
              queryClient.setQueryData(["attachment", conversationId], () => null);
            }}
          ></i>
        ) : (
          ""
        )}
        {/* MARK: AVATAR  */}
        <ImageWithLightBoxAndNoLazy
          src={
            conversation?.isGroup
              ? conversation.avatar
              : otherMember?.contact?.avatar
          }
          slides={[
            {
              src: conversation?.isGroup
                ? conversation.avatar ?? ""
                : otherMember?.contact?.avatar ?? "",
            },
          ]}
          className="loaded relative aspect-square w-12 cursor-pointer"
          circle
        />
        {/* MARK: TITLE  */}
        <div className="laptop:max-w-120 desktop:max-w-200 phone:max-w-48 relative flex grow flex-col">
          {conversation?.isGroup ? (
            <>
              <div className="flex w-full gap-2">
                <CustomLabel
                  className="text-sm font-medium"
                  title={conversation.title}
                />
              </div>
              <p className="text-2xs">{(conversation.members ?? []).length} members</p>
            </>
          ) : (
            <>
              <CustomLabel
                className="text-sm font-medium"
                title={otherMember?.contact?.name}
              />
            </>
          )}
        </div>
      </div>
      <div className="flex gap-8">
        {isPhone ? <ChatboxHeaderMenu_Mobile /> : <ChatboxHeaderMenu />}
      </div>
    </div>
  );
};

export default ChatboxHeader;
