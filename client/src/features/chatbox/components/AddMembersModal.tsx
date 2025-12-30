import { CheckCircleOutlined } from "@ant-design/icons";
import { useQueryClient } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import dayjs from "dayjs";
import { useEffect, useRef, useState } from "react";
import CustomButton from "../../../components/CustomButton";
import CustomInput from "../../../components/CustomInput";
import CustomLabel from "../../../components/CustomLabel";
import ImageWithLightBoxAndNoLazy from "../../../components/ImageWithLightBoxAndNoLazy";
import ListFriendLoading from "../../../components/ListFriendLoading";
import { OnCloseType } from "../../../types";
import blurImage from "../../../utils/blurImage";
import { isPhoneScreen } from "../../../utils/getScreenSize";
import useInfo from "../../authentication/hooks/useInfo";
import useFriend from "../../friend/hooks/useFriend";
import { ContactModel } from "../../friend/types";
import useConversation from "../../listchat/hooks/useConversation";
import {
  ConversationCache,
  MessageCache,
  PendingMessageModel,
} from "../../listchat/types";
import MemberToAdd_LargeScreen from "../responsive/MemberToAdd_LargeScreen";
import MemberToAdd_Phone from "../responsive/MemberToAdd_Phone";
import addMembers from "../services/addMembers";

const AddMembersModal = (props: OnCloseType) => {
  const { onClose } = props;

  const queryClient = useQueryClient();

  const { data: info } = useInfo();
  const { data: conversations } = useConversation();
  const { data, isLoading, isRefetching } = useFriend();

  const { conversationId } = useParams({
    from: "/conversations/_layout/$conversationId",
  });
  const conversation = conversations.conversations.find(
    (c) => c.id === conversationId,
  );

  const refInput = useRef<HTMLInputElement>();

  const [membersToSearch, setMembersToSearch] = useState<ContactModel[]>(
    data?.map((item) => item.contact),
  );
  const [membersToAdd, setMembersToAdd] = useState<ContactModel[]>([]);

  useEffect(() => {
    if (!data) return;
    setMembersToSearch(data.map((item) => item.contact));
    refInput.current.focus();
    blurImage(".list-friend-container");
  }, [data]);

  const addMembersCTA = () => {
    if (membersToAdd.length === 0) return;
    onClose();

    queryClient.setQueryData(["conversation"], (oldData: ConversationCache) => {
      const updatedConversations = oldData.conversations.map((conversation) => {
        if (conversation.id !== conversation.id) return conversation;
        return {
          ...conversation,
          members: [
            ...conversation.members,
            ...membersToAdd.map((mem) => {
              return {
                contact: {
                  id: mem.id,
                  name: mem.name,
                  avatar: mem.avatar,
                },
              };
            }),
          ],
        };
      });
      return {
        ...oldData,
        conversations: updatedConversations,
      } as ConversationCache;
    });

    queryClient.setQueryData(
      ["message", conversationId],
      (oldData: MessageCache) => {
        return {
          ...oldData,
          messages: [
            ...(oldData.messages || []),
            {
              type: "system",
              content: `${info.name} added new members: ${membersToAdd.map((mem) => mem.name).join(", ")}`,
              contactId: "system",
              createdTime: dayjs().format(),
            } as PendingMessageModel,
          ],
        } as MessageCache;
      },
    );

    addMembers(
      conversation.id,
      membersToAdd.map((mem) => {
        return mem.id;
      }),
    );
  };

  const removeMemberToAdd = (id: string) => {
    setMembersToAdd((members) => {
      return members.filter((mem) => mem.id !== id);
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
        className={`border-(--border-color) relative flex grow gap-8 border-b-[.1rem]
      ${isPhoneScreen() ? "flex-col" : "flex-row"} `}
      >
        {isLoading || isRefetching ? (
          <ListFriendLoading />
        ) : (
          <>
            <div className="list-friend-container hide-scrollbar flex grow flex-col gap-2 overflow-y-scroll scroll-smooth">
              {membersToSearch?.map((item) => (
                <div
                  key={item.id}
                  className={`information-members flex w-full items-center gap-2 rounded-lg p-[.7rem]
                  ${
                    conversation.members.some(
                      (mem) => mem.contact.id === item.id,
                    )
                      ? "pointer-events-none"
                      : "hover:bg-(--bg-color-extrathin) cursor-pointer"
                  } `}
                  onClick={() => {
                    setMembersToAdd((members) => {
                      return members.map((mem) => mem.id).includes(item.id)
                        ? members.filter((mem) => mem.id !== item.id)
                        : [
                            ...members,
                            {
                              id: item.id,
                              name: item.name,
                              avatar: item.avatar,
                            },
                          ];
                    });
                  }}
                >
                  <CheckCircleOutlined
                    className={`base-icon 
                      ${
                        conversation.members.some(
                          (mem) => mem.contact.id === item.id,
                        ) || membersToAdd.some((mem) => mem.id === item.id)
                          ? "text-light-blue-500!"
                          : ""
                      }
                    `}
                  />
                  <ImageWithLightBoxAndNoLazy
                    src={item.avatar}
                    className="aspect-square w-10 cursor-pointer"
                    circle
                    slides={[
                      {
                        src: item.avatar,
                      },
                    ]}
                    onClick={() => {}}
                    local
                  />
                  <div>
                    <CustomLabel title={item.name} />
                    {conversation.members.some(
                      (mem) => mem.contact.id === item.id,
                    ) ? (
                      <p className="text-(--text-main-color-blur)">Joined</p>
                    ) : (
                      ""
                    )}
                  </div>
                </div>
              ))}
            </div>
            {isPhoneScreen() ? (
              <MemberToAdd_Phone
                membersToAdd={membersToAdd}
                total={data?.length}
                removeMemberToAdd={removeMemberToAdd}
              />
            ) : (
              <MemberToAdd_LargeScreen
                membersToAdd={membersToAdd}
                total={data?.length}
                removeMemberToAdd={removeMemberToAdd}
              />
            )}
          </>
        )}
      </div>
      <CustomButton
        className="text-2xs mr-0"
        width={4}
        padding="py-0"
        gradientWidth={`${isPhoneScreen() ? "115%" : "112%"}`}
        gradientHeight={`${isPhoneScreen() ? "130%" : "122%"}`}
        rounded="3rem"
        title="Save"
        onClick={addMembersCTA}
      />
    </>
  );
};

export default AddMembersModal;
