import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import CustomButton from "../../../components/CustomButton";
import CustomInput from "../../../components/CustomInput";
import CustomLabel from "../../../components/CustomLabel";
import ImageWithLightBoxAndNoLazy from "../../../components/ImageWithLightBoxAndNoLazy";
import ListFriendLoading from "../../../components/ListFriendLoading";
import { ForwardMessageModalProps } from "../../../types";
import { isPhoneScreen } from "../../../utils/getScreenSize";
import useInfo from "../../authentication/hooks/useInfo";
import useFriend from "../../friend/hooks/useFriend";
import createDirectChatWithMessage from "../../friend/services/createDirectChatWithMessage";
import { ContactModel } from "../../friend/types";
import useConversation from "../../listchat/hooks/useConversation";
import { ConversationCache, ConversationModel } from "../../listchat/types";
import sendMessage from "../services/sendMessage";
import { SendMessageRequest } from "../types";

const ForwardMessageModal = (props: ForwardMessageModalProps) => {
  const { onClose, message } = props;

  console.log(message);

  const queryClient = useQueryClient();

  const { data: info } = useInfo();
  const { data: conversations } = useConversation();
  const { data, isLoading, isRefetching } = useFriend();

  const refInput = useRef<HTMLInputElement>();

  const [membersToSearch, setMembersToSearch] = useState<ContactModel[]>(
    data?.map((item) => item.contact),
  );

  useEffect(() => {
    if (!data) return;
    setMembersToSearch(data.map((item) => item.contact));
    refInput.current.focus();
    // blurImage(".list-friend-container");
  }, [data]);

  const send = async (contact: ContactModel) => {
    // onClose();
    const randomId = Math.random().toString(36).substring(2, 7);
    const existedConversation = conversations.conversations.find(
      (conv) =>
        conv.isGroup === false &&
        conv.members.some((mem) => mem.contact.id === contact.id),
    );
    if (existedConversation) {
      handleExistedConversation(existedConversation, message);
    } else {
      handleNewConversation(contact, message, randomId);
    }
  };

  const handleExistedConversation = async (
    conversation: ConversationModel,
    message: string,
  ) => {
    queryClient.setQueryData(["conversation"], (oldData: ConversationCache) => {
      // Move existed conversation to the top if the conversation was deleted
      // else keep the current position of the conversation
      let isDeletedConversation = conversation.members.find(
        (mem) => mem.contact.id === info.id,
      ).isDeleted;
      let updatedConversations = [];
      if (isDeletedConversation) {
        conversation.lastMessage = message;
        conversation.members = conversation.members.map((mem) => {
          if (mem.contact.id !== info.id) return mem;
          return { ...mem, isDeleted: false };
        });
        updatedConversations = [
          conversation,
          ...oldData.conversations.filter(
            (conv) => conv.id !== conversation.id,
          ),
        ];
      } else {
        updatedConversations = oldData.conversations.map((conv) => {
          if (conv.id !== conversation.id) return conv;
          conv.lastMessage = message;
          conv.members = conv.members.map((mem) => {
            if (mem.contact.id !== info.id) return mem;
            return { ...mem, isDeleted: false };
          });
          return conv;
        });
      }

      return {
        ...oldData,
        conversations: updatedConversations,
        filterConversations: updatedConversations,
        selected: conversation,
        reload: true,
      } as ConversationCache;
    });

    const bodyToCreate: SendMessageRequest = {
      type: "text",
      content: message,
      isForwarded: true,
    };
    sendMessage(conversation.id, bodyToCreate);
  };

  const handleNewConversation = async (
    contact: ContactModel,
    message: string,
    randomId: string,
  ) => {
    queryClient.setQueryData(["conversation"], (oldData: ConversationCache) => {
      const newConversation: ConversationModel = {
        id: randomId,
        lastMessage: message,
        isGroup: false,
        isNotifying: true,
        members: [
          {
            isModerator: true,
            contact: {
              id: info.id,
              name: info.name,
              avatar: info.avatar,
              isOnline: true,
            },
          },
          {
            contact: {
              id: contact.id,
              name: contact.name,
              avatar: contact.avatar,
              isOnline: contact.isOnline,
            },
          },
        ],
      };
      return {
        ...oldData,
        conversations: [newConversation, ...oldData.conversations],
        filterConversations: [newConversation, ...oldData.conversations],
        selected: newConversation,
        reload: false,
      } as ConversationCache;
    });

    createDirectChatWithMessage(contact.id, message).then((res) => {
      queryClient.setQueryData(
        ["conversation"],
        (oldData: ConversationCache) => {
          const updatedConversations = oldData.conversations.map(
            (conversation) => {
              if (conversation.id !== randomId) return conversation;
              return { ...conversation, id: res.conversationId };
            },
          );
          return {
            ...oldData,
            conversations: updatedConversations,
            filterConversations: updatedConversations,
          } as ConversationCache;
        },
      );
    });
  };

  return (
    <>
      <CustomInput
        type="text"
        placeholder="Search for name"
        inputRef={refInput}
        onChange={(e) => {
          if (e.target.value === "")
            setMembersToSearch(data.map((item) => item.contact));
          else
            setMembersToSearch((current) => {
              const found = current.filter((item) =>
                item.name.toLowerCase().includes(e.target.value.toLowerCase()),
              );

              return found;
            });
        }}
      />
      <div
        className={`relative flex grow gap-[2rem]
      ${isPhoneScreen() ? "flex-col" : "flex-row"} `}
      >
        {isLoading || isRefetching ? (
          <ListFriendLoading />
        ) : (
          <>
            <div className="list-friend-container hide-scrollbar flex grow flex-col gap-[.5rem] overflow-y-scroll scroll-smooth">
              {membersToSearch?.map((item) => (
                <div
                  key={item.id}
                  className={`information-members flex w-full items-center gap-[1rem] rounded-[.5rem] p-[.7rem]`}
                >
                  <ImageWithLightBoxAndNoLazy
                    src={item.avatar}
                    className="pointer-events-none aspect-square phone:w-[3rem] laptop:w-[4rem]"
                    circle
                    slides={[
                      {
                        src: item.avatar,
                      },
                    ]}
                    onClick={() => {}}
                    local
                  />
                  <CustomLabel
                    title={item.name}
                    className="pointer-events-none"
                  />
                  <CustomButton
                    className={`phone:text-base desktop:text-md`}
                    width={7}
                    padding="py-[.3rem]"
                    gradientWidth={`${isPhoneScreen() ? "115%" : "112%"}`}
                    gradientHeight={`${isPhoneScreen() ? "130%" : "122%"}`}
                    rounded="3rem"
                    title="Send"
                    onClick={() => send(item)}
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default ForwardMessageModal;
