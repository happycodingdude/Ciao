import { CheckCircleOutlined } from "@ant-design/icons";
import { useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useRef, useState } from "react";
import CustomButton from "../../../components/CustomButton";
import CustomInput from "../../../components/CustomInput";
import CustomLabel from "../../../components/CustomLabel";
import ImageWithLightBoxAndNoLazy from "../../../components/ImageWithLightBoxAndNoLazy";
import LocalLoading from "../../../components/LocalLoading";
import { OnCloseType } from "../../../types";
import blurImage from "../../../utils/blurImage";
import { isPhoneScreen } from "../../../utils/getScreenSize";
import useFriend from "../../friend/hooks/useFriend";
import { ContactModel } from "../../friend/types";
import useConversation from "../../listchat/hooks/useConversation";
import { ConversationCache } from "../../listchat/types";
import MemberToAdd_LargeScreen from "../responsive/MemberToAdd_LargeScreen";
import MemberToAdd_Phone from "../responsive/MemberToAdd_Phone";
import addMembers from "../services/addMembers";

const AddMembersModal = (props: OnCloseType) => {
  const { onClose } = props;

  const queryClient = useQueryClient();

  const { data: conversations } = useConversation();
  const { data, isLoading, isRefetching } = useFriend();

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
        if (conversation.id !== conversations.selected.id) return conversation;
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
        selected: {
          ...oldData.selected,
          members: [
            ...oldData.selected.members,
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
        },
      } as ConversationCache;
    });

    addMembers(
      conversations.selected.id,
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
    <div
      className="flex flex-col gap-[1rem] p-10 pt-12 text-[var(--text-main-color)] 
    phone:h-[50rem] laptop:h-[45rem] laptop-lg:h-[55rem] desktop:h-[80rem]"
    >
      <CustomInput
        type="text"
        placeholder="Search for name"
        inputRef={refInput}
        onChange={(e) => {
          // findContact(e.target.value);
          // console.log(e.target.value);
          if (e.target.value === "")
            setMembersToSearch(data.map((item) => item.contact));
          else
            setMembersToSearch((current) => {
              const found = current.filter((item) =>
                item.name.toLowerCase().includes(e.target.value.toLowerCase()),
              );
              // console.log(found);

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
                  className={`information-members flex w-full items-center gap-[1rem] rounded-[.5rem] p-[.7rem]
                ${
                  conversations.selected.members.some(
                    (mem) => mem.contact.id === item.id,
                  )
                    ? "pointer-events-none"
                    : "cursor-pointer hover:bg-[var(--bg-color-extrathin)]"
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
                  {/* {conversations.selected.members.some(
                    (mem) => mem.contact.id === item.id,
                  ) || membersToAdd.some((mem) => mem.id === item.id) ? (
                    <div
                      className="fa fa-check flex aspect-square w-[1.8rem] items-center justify-center rounded-full bg-gradient-to-tr
                      from-[var(--main-color)] to-[var(--main-color-extrabold)] text-xs font-normal text-[var(--sub-color)]"
                    ></div>
                  ) : (
                    <div className="relative z-10">
                      <div
                        style={
                          {
                            "--width": `120%`,
                            "--height": `120%`,
                            "--rounded": "50%",
                          } as CSSProperties
                        }
                        className="gradient-item relative aspect-square w-[1.8rem] rounded-full bg-[var(--bg-color)]"
                      ></div>
                    </div>
                  )} */}
                  <CheckCircleOutlined
                    className={`base-icon-sm ${
                      conversations.selected.members.some(
                        (mem) => mem.contact.id === item.id,
                      ) || membersToAdd.some((mem) => mem.id === item.id)
                        ? "text-[var(--main-color-bold)]"
                        : ""
                    }`}
                  />
                  <ImageWithLightBoxAndNoLazy
                    src={item.avatar}
                    className="aspect-square cursor-pointer phone:w-[3rem] laptop:w-[4rem]"
                    // spinnerClassName="laptop:bg-[size:2rem]"
                    // imageClassName="bg-[size:170%]"
                    circle
                    slides={[
                      {
                        src: item.avatar,
                      },
                    ]}
                    onClick={() => {}}
                  />
                  <div>
                    <CustomLabel title={item.name} />
                    {conversations.selected.members.some(
                      (mem) => mem.contact.id === item.id,
                    ) ? (
                      <p className="text-[var(--text-main-color-blur)]">
                        Joined
                      </p>
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
        className={`!mr-0 phone:text-base desktop:text-md`}
        width={7}
        padding="py-[.3rem]"
        gradientWidth={`${isPhoneScreen() ? "115%" : "112%"}`}
        gradientHeight={`${isPhoneScreen() ? "130%" : "122%"}`}
        rounded="3rem"
        title="Save"
        onClick={addMembersCTA}
      />
    </div>
  );
};

export default AddMembersModal;
