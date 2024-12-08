import { useQueryClient } from "@tanstack/react-query";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import React, { useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import { blurImage, HttpRequest } from "../../common/Utility";
import { useFriend, useInfo } from "../../hook/CustomHooks";
import CustomButton from "../common/CustomButton";
import CustomInput from "../common/CustomInput";
import CustomLabel from "../common/CustomLabel";
import ImageWithLightBox from "../common/ImageWithLightBox";
import ImageWithLightBoxAndNoLazy from "../common/ImageWithLightBoxAndNoLazy";
import MediaPicker from "../common/MediaPicker";

const CreateGroupChatModal = (props) => {
  const { onClose } = props;

  const queryClient = useQueryClient();
  const { data } = useFriend();
  const { data: info } = useInfo();

  const refInputSearch = useRef();
  const refInputTitle = useRef();

  const [membersToSearch, setMembersToSearch] = useState(
    data?.map((item) => item.contact),
  );
  const [membersToAdd, setMembersToAdd] = useState([]);
  const [avatar, setAvatar] = useState();
  const [file, setFile] = useState();

  useEffect(() => {
    if (!data) return;
    setMembersToSearch(data.map((item) => item.contact));
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

  const createGroupChat = async () => {
    if (membersToAdd.length === 0) return;

    let url = "";
    if (file === undefined) {
      url = avatar;
    } else {
      // Create a root reference
      const storage = getStorage();
      url = await uploadBytes(ref(storage, `avatar/${file?.name}`), file).then(
        (snapshot) => {
          return getDownloadURL(snapshot.ref).then((url) => {
            return url;
          });
        },
      );
    }

    HttpRequest({
      method: "post",
      url: import.meta.env.VITE_ENDPOINT_CONVERSATION_GET,
      data: {
        title: refInputTitle.current.value,
        isGroup: true,
        avatar: url,
        participants: membersToAdd.map((mem) => {
          return {
            contactId: mem.id,
          };
        }),
      },
    }).then((res) => {
      queryClient.setQueryData(["conversation"], (oldData) => {
        const cloned = Object.assign({}, oldData);
        const updatedConversations = cloned.conversations.map(
          (conversation) => {
            if (conversation.id !== randomId) return conversation;
            conversation.id = res.data;
            return conversation;
          },
        );
        return {
          ...oldData,
          conversations: updatedConversations,
          selected: {
            ...oldData.selected,
            id: res.data,
          },
        };
      });
    });

    let randomId = Math.random().toString(36).substring(2, 7);
    queryClient.setQueryData(["conversation"], (oldData) => {
      return {
        ...oldData,
        conversations: [
          {
            id: randomId,
            title: refInputTitle.current.value,
            avatar: avatar,
            isGroup: true,
            isNotifying: true,
            participants: [
              {
                isModerator: true,
                contact: {
                  id: info.id,
                  name: info.name,
                  avatar: info.avatar,
                  isOnline: true,
                },
              },
              ...membersToAdd.map((mem) => {
                return {
                  contact: {
                    id: mem.id,
                    name: mem.name,
                    avatar: mem.avatar,
                    // isOnline: contact.isOnline,
                  },
                };
              }),
            ],
            noLazy: true,
          },
          ...oldData.conversations,
        ],
        selected: {
          id: randomId,
          title: refInputTitle.current.value,
          avatar: avatar,
          isGroup: true,
          participants: [
            {
              isModerator: true,
              contact: {
                id: info.id,
                name: info.name,
                avatar: info.avatar,
                isOnline: true,
              },
            },
            ...membersToAdd.map((mem) => {
              return {
                contact: {
                  id: mem.id,
                  name: mem.name,
                  avatar: mem.avatar,
                  // isOnline: contact.isOnline,
                },
              };
            }),
          ],
        },
        noLoading: true,
        createGroupChat: true,
      };
    });
    queryClient.setQueryData(["message"], (oldData) => {
      const newData = {
        ...oldData,
        messages: [],
        participants: [
          {
            isModerator: true,
            contact: {
              id: info.id,
              name: info.name,
              avatar: info.avatar,
              isOnline: true,
            },
          },
          ...membersToAdd.map((mem) => {
            return {
              contact: {
                id: mem.id,
                name: mem.name,
                avatar: mem.avatar,
                // isOnline: contact.isOnline,
              },
            };
          }),
        ],
      };

      return newData;
    });

    onClose();
  };

  return (
    <div className="flex flex-col justify-between p-10 pt-12 text-[var(--text-main-color)] laptop:h-[45rem] desktop:h-[80rem]">
      <div className="relative flex shrink-0 items-end gap-[5rem] pb-[.5rem]">
        <ImageWithLightBoxAndNoLazy
          src={avatar ?? ""}
          className="aspect-square cursor-pointer rounded-[1rem] laptop:w-[5rem]"
        />
        <MediaPicker
          className="absolute laptop:left-[5rem] laptop:top-[-1rem]"
          accept="image/png, image/jpeg"
          id="new-conversation-avatar"
          onChange={chooseAvatar}
        />
        <CustomInput
          type="text"
          reference={refInputTitle}
          className="laptop:w-[30rem]"
          placeholder="Type group name"
        />
      </div>
      <CustomInput
        type="text"
        placeholder="Search for name"
        reference={refInputSearch}
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
      <div className="flex gap-[2rem] border-b-[.1rem] border-[var(--border-color)] laptop:h-[20rem]">
        <div className="list-friend-container hide-scrollbar flex grow flex-col gap-[.5rem] overflow-y-scroll scroll-smooth">
          {membersToSearch?.map((item) => (
            <div
              key={item}
              className={`information-members flex w-full cursor-pointer items-center gap-[1rem] rounded-[.5rem] p-[.7rem] hover:bg-[var(--bg-color-extrathin)]`}
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
              {membersToAdd.some((mem) => mem.id === item.id) ? (
                <div
                  className="fa fa-check flex aspect-square w-[1.8rem] items-center justify-center rounded-full bg-gradient-to-tr
                  from-[var(--main-color)] to-[var(--main-color-extrabold)] text-xs font-normal text-[var(--sub-color)]"
                ></div>
              ) : (
                <div className="relative z-10">
                  <div
                    style={{
                      "--width": `120%`,
                      "--height": `120%`,
                      "--rounded": "50%",
                    }}
                    className="gradient-item relative aspect-square w-[1.8rem]  rounded-full bg-[var(--bg-color)]"
                  ></div>
                </div>
              )}
              <ImageWithLightBox
                src={item.avatar}
                className="aspect-square cursor-pointer laptop:w-[4rem]"
                spinnerClassName="laptop:bg-[size:2rem]"
                imageClassName="bg-[size:140%]"
                slides={[
                  {
                    src: item.avatar,
                  },
                ]}
                onClick={(e) => {}}
              />
              <CustomLabel title={item.name} />
            </div>
          ))}
        </div>
        <div
          style={{
            "--width": `102%`,
            "--height": `102%`,
            "--rounded": ".5rem",
          }}
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
        className={`!mr-0 laptop:!w-[7rem] laptop:text-base desktop:text-md`}
        padding="py-[.3rem]"
        gradientWidth="110%"
        gradientHeight="120%"
        rounded="3rem"
        title="Save"
        onClick={createGroupChat}
      />
    </div>
  );
};

export default CreateGroupChatModal;
