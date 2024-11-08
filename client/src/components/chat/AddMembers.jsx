import { useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import { HttpRequest } from "../../common/Utility";
import { useFriend } from "../../hook/CustomHooks";
import CustomButton from "../common/CustomButton";
import CustomInput from "../common/CustomInput";
import CustomLabel from "../common/CustomLabel";
import ImageWithLightBoxAndNoLazy from "../common/ImageWithLightBoxAndNoLazy";

const AddMembers = (props) => {
  const { id, members, onClose } = props;

  const queryClient = useQueryClient();
  const { data } = useFriend();

  const refInput = useRef();

  const [membersToSearch, setMembersToSearch] = useState(
    data?.map((item) => item.contact),
  );
  const [membersToAdd, setMembersToAdd] = useState([]);

  // useEffect(() => {
  //   refetch();
  // }, []);

  useEffect(() => {
    if (!data) return;
    setMembersToSearch(data.map((item) => item.contact));
    refInput.current.focus();
  }, [data]);

  const addMembers = () => {
    if (membersToAdd.length === 0) return;

    queryClient.setQueryData(["conversation"], (oldData) => {
      const updatedConversations = oldData.conversations.map((conversation) => {
        if (conversation.id !== id) return conversation;
        return {
          ...conversation,
          participants: [
            ...conversation.participants,
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
          participants: [
            ...oldData.selected.participants,
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
      };
    });

    HttpRequest({
      method: "post",
      url: import.meta.env.VITE_ENDPOINT_PARTICIPANT_GET.replace("{id}", id),
      data: membersToAdd.map((mem) => {
        return {
          contactId: mem.id,
        };
      }),
    });

    onClose();
  };

  return (
    <div className="flex flex-col justify-between p-10 pt-12 text-[var(--text-main-color)] laptop:h-[45rem] desktop:h-[80rem]">
      <CustomInput
        type="text"
        label="Search for name"
        reference={refInput}
        onChange={(e) => {
          // findContact(e.target.value);
          console.log(e.target.value);
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
      <div className="flex gap-[2rem] border-b-[.1rem] border-[var(--text-main-color)] laptop:h-[30rem]">
        <div className="list-friend-container hide-scrollbar flex grow flex-col gap-[.5rem] overflow-y-scroll scroll-smooth">
          {membersToSearch?.map((item) => (
            <div
              key={item}
              className={`information-members flex w-full items-center gap-[1rem] rounded-[.5rem] p-[.7rem]
              ${
                members.some((mem) => mem.id === item.id)
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
              {members.some((mem) => mem.id === item.id) ||
              membersToAdd.some((mem) => mem.id === item.id) ? (
                <div
                  className="fa fa-check flex aspect-square w-[1.7rem] items-center justify-center rounded-full bg-gradient-to-tr
                  from-[var(--main-color)] to-[var(--main-color-extrathin)] text-xs font-normal text-[var(--text-sub-color)]"
                ></div>
              ) : (
                <div className="relative z-10">
                  <div
                    style={{
                      "--width": `120%`,
                      "--height": `120%`,
                      "--rounded": "50%",
                    }}
                    className="gradient-item relative aspect-square w-[1.7rem] rounded-full bg-[var(--bg-color)]"
                  ></div>
                </div>
              )}
              {/* <input
                type="checkbox"
                checked={members.some((mem) => mem.id === item.id)}
                onChange={() => {
                  setMemberToAdd((current) => {
                    return current.map((item) => item.id).includes(item.id)
                      ? current.filter(
                          (item) => item.contact.id !== item.contact.id,
                        )
                      : [
                          ...current,
                          {
                            id: item.id,
                            name: item.name,
                            avatar: item.avatar,
                          },
                        ];
                  });
                }}
              ></input> */}
              <ImageWithLightBoxAndNoLazy
                src={item.avatar}
                className="aspect-square cursor-pointer rounded-[50%] laptop:w-[4rem]"
                slides={[
                  {
                    src: item.avatar,
                  },
                ]}
                onClick={(e) => {}}
              />
              <div>
                <CustomLabel title={item.name} />
                {members.some((mem) => mem.id === item.id) ? (
                  <p className="text-[var(--text-main-color-blur)]">Joined</p>
                ) : (
                  ""
                )}
              </div>
            </div>
          ))}
        </div>
        <div
          style={{
            "--width": `102%`,
            "--height": `102%`,
            "--rounded": ".5rem",
          }}
          // className={`gradient-item relative ${membersToAdd.length === 0 ? "translate-x-full opacity-0" : "translate-x-0 opacity-100"} w-[35%]
          // overflow-hidden rounded-[.5rem] bg-[var(--bg-color)] p-2 transition-all duration-300`}

          // className={`gradient-item relative h-[95%] rounded-[.5rem] bg-[var(--bg-color)] transition-all duration-300
          //   ${membersToAdd.length === 0 ? "w-0 translate-x-full opacity-0" : "w-[40%] translate-x-0 opacity-100"}`}

          className={twMerge(
            "gradient-item relative h-[95%] w-[40%] translate-x-0 rounded-[.5rem] bg-[var(--bg-color)] opacity-100 transition-all duration-300",
            membersToAdd.length === 0 && "w-0 translate-x-full opacity-0",
          )}
        >
          <div className="flex h-full w-full flex-col gap-[1rem] rounded-[.5rem] bg-[var(--bg-color)] p-2">
            <p>
              Selected{" "}
              {/* <span className="bg-gradient-to-tr from-[var(--main-color)] to-[var(--main-color-extrathin)] text-[var(--text-sub-color)]"> */}
              <span className="text-[var(--main-color-light)]">
                {membersToAdd.length ?? 0}/{data?.length}
              </span>
            </p>
            <div className="hide-scrollbar flex flex-col gap-[.5rem] overflow-y-scroll scroll-smooth text-xs">
              {membersToAdd?.map((item) => (
                <div className="flex items-center justify-between rounded-[1rem] bg-[var(--bg-color-extrathin)] p-2 !pr-4">
                  <div className="pointer-events-none inline-flex items-center gap-[.5rem]">
                    <ImageWithLightBoxAndNoLazy
                      src={item.avatar}
                      className="aspect-square cursor-pointer rounded-[50%] laptop:w-[2.5rem]"
                      slides={[
                        {
                          src: item.avatar,
                        },
                      ]}
                      onClick={(e) => {}}
                    />
                    <div>
                      <CustomLabel title={item.name} />
                    </div>
                  </div>
                  <div
                    className="fa fa-trash cursor-pointer text-base text-[var(--danger-text-color)]"
                    onClick={() => {
                      setMembersToAdd((members) => {
                        return members.filter((mem) => mem.id !== item.id);
                      });
                    }}
                  ></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <CustomButton
        className={`!mr-0 !p-[.2rem] laptop:!w-[7rem] laptop:text-base desktop:text-md`}
        leadingClass="leading-[3rem]"
        gradientWidth="107%"
        gradientHeight="115%"
        rounded="3rem"
        title="Save"
        onClick={addMembers}
      />
    </div>
  );
};

export default AddMembers;
