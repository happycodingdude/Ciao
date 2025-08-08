import { CheckCircleOutlined } from "@ant-design/icons";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import CustomButton from "../../../components/CustomButton";
import CustomInput from "../../../components/CustomInput";
import CustomLabel from "../../../components/CustomLabel";
import ImageWithLightBoxAndNoLazy from "../../../components/ImageWithLightBoxAndNoLazy";
import LocalLoading from "../../../components/LocalLoading";
import MediaPicker from "../../../components/MediaPicker";
import { OnCloseType } from "../../../types";
import blurImage from "../../../utils/blurImage";
import { isPhoneScreen } from "../../../utils/getScreenSize";
import useInfo from "../../authentication/hooks/useInfo";
import { uploadFile } from "../../chatbox/functions/uploadFile";
import MemberToAdd_LargeScreen from "../../chatbox/responsive/MemberToAdd_LargeScreen";
import MemberToAdd_Phone from "../../chatbox/responsive/MemberToAdd_Phone";
import useFriend from "../../friend/hooks/useFriend";
import { ContactModel } from "../../friend/types";
import {
  ConversationCache,
  ConversationModel,
  ConversationModel_Member,
} from "../../listchat/types";
import createGroupChat, {
  CreateGroupChatRequest,
} from "../services/createGroupChat";

const CreateGroupChatModal = (props: OnCloseType) => {
  const { onClose } = props;

  const queryClient = useQueryClient();

  const { data, isLoading, isRefetching } = useFriend();
  const { data: info } = useInfo();

  const refInputSearch = useRef<HTMLInputElement>();
  const refInputTitle = useRef<HTMLInputElement>();
  const [membersToSearch, setMembersToSearch] = useState<ContactModel[]>(
    data?.filter((fr) => fr.status === "friend").map((item) => item.contact),
  );
  const [membersToAdd, setMembersToAdd] = useState<ContactModel[]>([]);
  const [avatar, setAvatar] = useState<string>();
  const [file, setFile] = useState<File>();

  const [processing, setProcessing] = useState<boolean>(false);

  useEffect(() => {
    if (!data) return;
    setMembersToSearch(
      data.filter((fr) => fr.status === "friend").map((item) => item.contact),
    );
    refInputTitle.current.focus();
    blurImage(".list-friend-container");
  }, [data]);

  const chooseAvatar = (e) => {
    const chosenFiles = Array.from(e.target.files);
    if (chosenFiles.length === 0) return;

    setAvatar(URL.createObjectURL(e.target.files?.[0]));
    setFile(e.target.files?.[0]);
    e.target.value = null;
  };

  const createGroupChatCTA = async () => {
    if (membersToAdd.length === 0) return;

    setProcessing(true);

    const url = file !== undefined ? await uploadFile(file) : null;

    const randomId = Math.random().toString(36).substring(2, 7);
    tempAddConversation(randomId);

    // const title = refInputTitle.current.value;
    const request: CreateGroupChatRequest = {
      title: refInputTitle.current.value,
      avatar: url,
      members: membersToAdd.map((members) => members.id),
    };
    createGroupChat(request).then((res) => {
      updateAddedConversation(randomId, res.data);
    });

    onClose();
  };

  const tempAddConversation = (tempId: string) => {
    queryClient.setQueryData(["conversation"], (oldData: ConversationCache) => {
      const newConversation: ConversationModel = {
        id: tempId,
        title: refInputTitle.current.value,
        avatar: avatar,
        isGroup: true,
        isNotifying: true,
        lastMessageTime: null,
        members: [
          {
            isModerator: true,
            contact: {
              id: info.id,
              name: info.name,
              avatar: info.avatar,
              isOnline: true,
            },
            // unSeenMessages: 0,
          },
          ...membersToAdd.map((mem) => {
            return {
              contact: {
                id: mem.id,
                name: mem.name,
                avatar: mem.avatar,
                isOnline: mem.isOnline,
              },
            } as ConversationModel_Member;
          }),
        ],
      };
      return {
        ...oldData,
        conversations: [
          {
            ...newConversation,
            noLazy: true,
          },
          ...oldData.conversations,
        ],
        filterConversations: [
          {
            ...newConversation,
            noLazy: true,
          },
          ...oldData.conversations,
        ],
        selected: newConversation,
        noLoading: true,
        reload: false,
      } as ConversationCache;
    });
    // queryClient.setQueryData(["message"], (oldData: MessageCache) => {
    //   return {
    //     ...oldData,
    //     conversationId: tempId,
    //     messages: [],
    //     hasMore: false,
    //   } as MessageCache;
    // });
    // queryClient.setQueryData(["attachment"], (oldData: AttachmentCache) => {
    //   return {
    //     ...oldData,
    //     conversationId: tempId,
    //     attachments: [],
    //   } as AttachmentCache;
    // });
  };

  const updateAddedConversation = (tempId: string, addedId: string) => {
    queryClient.setQueryData(["conversation"], (oldData: ConversationCache) => {
      const updatedConversations: ConversationModel[] =
        oldData.conversations.map((conversation) => {
          if (conversation.id !== tempId) return conversation;
          conversation.id = addedId;
          return conversation;
        });
      return {
        ...oldData,
        conversations: updatedConversations,
        filterConversations: updatedConversations,
        // selected: {
        //   ...oldData.selected,
        //   id: addedId,
        // },
      } as ConversationCache;
    });
    // queryClient.setQueryData(["message"], (oldData: MessageCache) => {
    //   return {
    //     ...oldData,
    //     conversationId: addedId,
    //   } as MessageCache;
    // });
    // queryClient.setQueryData(["attachment"], (oldData: AttachmentCache) => {
    //   return {
    //     ...oldData,
    //     conversationId: addedId,
    //   } as AttachmentCache;
    // });
  };

  const removeMemberToAdd = (id: string) => {
    setMembersToAdd((members) => {
      return members.filter((mem) => mem.id !== id);
    });
  };

  return (
    <>
      <div className="relative flex shrink-0 items-end gap-[5rem] pb-[.5rem]">
        <ImageWithLightBoxAndNoLazy
          src={avatar ?? ""}
          className="aspect-square w-[5rem] cursor-pointer"
        />
        <MediaPicker
          className="absolute left-[5rem] top-[-1rem]"
          accept="image/png, image/jpeg"
          id="new-conversation-avatar"
          onChange={chooseAvatar}
        />
        <CustomInput
          type="text"
          inputRef={refInputTitle}
          className="phone:w-[20rem] laptop:w-[30rem]"
          placeholder="Type group name"
        />
      </div>
      <div className="flex grow flex-col gap-[1rem]">
        <CustomInput
          type="text"
          placeholder="Search for name"
          inputRef={refInputSearch}
          onChange={(e) => {
            if (e.target.value === "")
              setMembersToSearch(
                data
                  .filter((fr) => fr.status === "friend")
                  .map((item) => item.contact),
              );
            else
              setMembersToSearch((current) => {
                const found = current.filter((item) =>
                  item.name
                    .toLowerCase()
                    .includes(e.target.value.toLowerCase()),
                );
                return found;
              });
          }}
        />
        <div
          className={`relative flex grow gap-[2rem] border-b-[.1rem] border-[var(--border-color)]
              ${isPhoneScreen() ? "flex-col" : "flex-row"} `}
        >
          {isLoading || isRefetching ? (
            <LocalLoading />
          ) : (
            <>
              <div className="list-friend-container hide-scrollbar flex grow flex-col gap-[.5rem] overflow-y-scroll scroll-smooth">
                {membersToSearch?.map((item) => (
                  <div
                    key={item.id}
                    className={`information-members flex w-full cursor-pointer items-center gap-[1rem] rounded-[.5rem] p-[.7rem] hover:bg-[var(--bg-color-extrathin)]`}
                    onClick={() => {
                      setMembersToAdd((members) => {
                        return members.map((mem) => mem.id).includes(item.id)
                          ? members.filter((mem) => mem.id !== item.id)
                          : [...members, item];
                      });
                    }}
                  >
                    <CheckCircleOutlined
                      className={`base-icon-sm 
                        ${
                          membersToAdd.some((mem) => mem.id === item.id)
                            ? "text-[var(--main-color-bold)]"
                            : ""
                        }
                        `}
                    />
                    <ImageWithLightBoxAndNoLazy
                      src={item.avatar}
                      className="aspect-square w-[4rem] cursor-pointer"
                      circle
                      slides={[
                        {
                          src: item.avatar,
                        },
                      ]}
                      onClick={() => {}}
                    />
                    <CustomLabel title={item.name} className="contents" />
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
      </div>

      <CustomButton
        className={`!mr-0 phone:text-base desktop:text-md`}
        width={7}
        padding="py-[.3rem]"
        gradientWidth={`${isPhoneScreen() ? "115%" : "112%"}`}
        gradientHeight={`${isPhoneScreen() ? "130%" : "122%"}`}
        rounded="3rem"
        title="Save"
        onClick={createGroupChatCTA}
        processing={processing}
      />
    </>
  );
};

export default CreateGroupChatModal;
