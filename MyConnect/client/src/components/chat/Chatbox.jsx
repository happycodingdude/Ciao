import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Tooltip } from "antd";
import EmojiPicker from "emoji-picker-react";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import moment from "moment";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { blurImage } from "../../common/Utility";
import { useEventListener, useInfo, useMessage } from "../../hook/CustomHooks";
import { send } from "../../hook/MessageAPIs";
import BackgroundPortal from "../common/BackgroundPortal";
import RelightBackground from "../common/RelightBackground";
import UserProfile from "../profile/UserProfile";
import ChatInput from "./ChatInput";
import MessageContent from "./MessageContent";

const Chatbox = (props) => {
  console.log("Chatbox calling");
  const { refChatbox, toggleInformation } = props;

  const queryClient = useQueryClient();

  const { data: info } = useInfo();
  const { data: messages } = useMessage();

  const [files, setFiles] = useState([]);
  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState();
  const [openEmoji, setOpenEmoji] = useState(false);

  const refChatContent = useRef();
  const refScrollButton = useRef();
  const refToggleInformationContainer = useRef();
  const refChatboxContainer = useRef();
  const refTitleContainer = useRef();
  const refChatInput = useRef();

  // useEffect(() => {
  //   setFiles([]);
  // }, []);

  useEffect(() => {
    blurImage(".chatbox-content");
    setFiles([]);
  }, [messages]);

  useEffect(() => {
    // listenNotification((message) => {
    //   console.log("Chatbox receive message from worker");
    //   const messageData = JSON.parse(message.data);
    //   switch (message.event) {
    //     case "NewMessage":
    //       // add new message to current list
    //       var newArr = messages?.map((item) => {
    //         if (item.Messages.some((message) => message.Id === messageData.Id))
    //           return item;
    //         if (
    //           item.Date !== moment(messageData.CreatedTime).format("MM/DD/YYYY")
    //         )
    //           return item;

    //         item.Messages = [...item.Messages, messageData];
    //         return item;
    //       });
    //       setMessages(newArr);

    //       setTimeout(() => {
    //         refChatContent.current.scrollTop =
    //           refChatContent.current.scrollHeight;
    //       }, 200);
    //       break;
    //     default:
    //       break;
    //   }
    // });

    // setTimeout(() => {
    //   refChatContent.current.scrollTop = refChatContent.current.scrollHeight;
    // }, 500);
    refChatContent.current.scrollTop = refChatContent.current.scrollHeight;
  }, [messages]);

  const chooseFile = (e) => {
    const chosenFiles = Array.from(e.target.files);
    if (chosenFiles.length === 0) return;

    const mergedFiles = chosenFiles.filter((item) => {
      if (!files.some((file) => file.name === item.name)) return item;
    });
    setFiles([...files, ...mergedFiles]);

    e.target.value = null;
  };

  const removeFile = (e) => {
    setFiles(files.filter((item) => item.name !== e.target.dataset.key));
  };

  const uploadFile = async () => {
    // Create a root reference
    const storage = getStorage();
    return Promise.all(
      files.map((item) => {
        if (
          ["doc", "docx", "xls", "xlsx", "pdf"].includes(
            item.name.split(".")[1],
          )
        ) {
          return uploadBytes(ref(storage, `file/${item.name}`), item).then(
            (snapshot) => {
              return getDownloadURL(snapshot.ref).then((url) => {
                return {
                  type: "file",
                  url: url,
                  name: item.name,
                  size: item.size,
                };
              });
            },
          );
        }
        return uploadBytes(ref(storage, `img/${item.name}`), item).then(
          (snapshot) => {
            return getDownloadURL(snapshot.ref).then((url) => {
              return {
                type: "image",
                url: url,
                name: item.name,
                size: item.size,
              };
            });
          },
        );
      }),
    );
  };

  // const sendMessage = async (text) => {
  //   let body = {
  //     contactId: info.data.id,
  //     conversationId: messages.id,
  //   };
  //   if (files.length === 0) {
  //     if (text === "") return;
  //     body = {
  //       ...body,
  //       type: "text",
  //       content: text,
  //     };
  //   } else {
  //     const uploaded = await uploadFile().then((uploads) => {
  //       return uploads.map((item) => ({
  //         type: item.type,
  //         mediaUrl: item.url,
  //         mediaName: item.name,
  //         mediaSize: item.size,
  //       }));
  //     });
  //     body = {
  //       ...body,
  //       type: "media",
  //       attachments: uploaded,
  //       content: uploaded.map((item) => item.MediaName).join(","),
  //     };
  //   }

  //   refChatContent.current.scrollTop = refChatContent.current.scrollHeight;

  //   HttpRequest({
  //     method: "post",
  //     url: import.meta.env.VITE_ENDPOINT_MESSAGE_SEND.replace(
  //       "{id}",
  //       messages.id,
  //     ),
  //     data: body,
  //   }).then((res) => {
  //     setFiles([]);
  //   });
  // };

  const delay = (delay) => {
    return new Promise((resolve) => setTimeout(resolve, delay));
  };

  const {
    mutate: sendMutation,
    isPending,
    variables,
  } = useMutation({
    mutationFn: async (param) => {
      setTimeout(() => {
        scrollChatContentToBottom();
      }, 200);

      // await delay(5000);

      if (param.type === "text" && param.content === "") return;

      let body = {
        moderator: messages.participants.find((q) => q.isModerator === true)
          .contact.id,
        type: param.type,
        content: param.content,
      };

      if (param.type === "media")
        body = {
          ...body,
          attachments: param.attachments,
        };

      await send(messages.id, body);

      queryClient.setQueryData(["message"], (oldData) => {
        const cloned = Object.assign({}, oldData);
        if (cloned.id !== messages.id) return cloned;
        cloned.messages = [
          {
            ...body,
            contact: {
              id: info.data.id,
              name: info.data.name,
              avatar: info.data.avatar,
            },
          },
          ...cloned.messages,
        ];
        return cloned;
      });
      queryClient.setQueryData(["conversation"], (oldData) => {
        const cloned = oldData.map((item) => {
          return Object.assign({}, item);
        });
        let newData = cloned.map((conversation) => {
          if (conversation.id !== messages.id) return conversation;
          conversation.lastMessage =
            param.type === "text"
              ? param.content
              : files.map((item) => item.name).join(",");
          return conversation;
        });
        return newData;
      });
      if (param.type === "media") {
        queryClient.setQueryData(["attachment"], (oldData) => {
          const cloned = oldData.map((item) => {
            return Object.assign({}, item);
          });
          // Chỉ cần lấy item đầu tiên vì là thời gian gần nhất
          var firstItem = cloned[0];
          // Nếu undefined tức là chưa có attachment nào
          // hoặc nếu ngày gần nhất không phải hôm nay
          // -> tạo object mới
          if (!firstItem || firstItem.date !== moment().format("MM/DD/YYYY")) {
            cloned.unshift({
              date: moment().format("MM/DD/YYYY"),
              attachments: param.attachments,
            });
            return cloned;
          }
          // Ngược lại thì ngày gần nhất là hôm nay
          else {
            let newData = cloned.map((item) => {
              if (item.date === moment().format("MM/DD/YYYY")) {
                return {
                  ...item,
                  attachments: [...param.attachments, ...item.attachments],
                };
              }
              return item;
            });
            return newData;
          }
        });
      }
    },
  });

  const sendMedia = async () => {
    const uploaded = await uploadFile().then((uploads) => {
      return uploads.map((item) => ({
        type: item.type,
        mediaUrl: item.url,
        mediaName: item.name,
        mediaSize: item.size,
      }));
    });
    sendMutation({ type: "media", attachments: uploaded });
  };

  const scrollChatContentToBottom = () => {
    refChatContent.current.scrollTop = refChatContent.current.scrollHeight;
  };

  const toggleInformationContainer = () => {
    toggleInformation();
    if (
      refToggleInformationContainer.current.classList.contains(
        "animate-information-hide-arrow",
      )
    ) {
      refToggleInformationContainer.current.classList.remove(
        "animate-information-hide-arrow",
      );
      refToggleInformationContainer.current.classList.add(
        "animate-information-show-arrow",
      );
    } else {
      refToggleInformationContainer.current.classList.remove(
        "animate-information-show-arrow",
      );
      refToggleInformationContainer.current.classList.add(
        "animate-information-hide-arrow",
      );
    }
  };

  // Event listener
  const handleScroll = useCallback(() => {
    if (refChatContent.current.scrollTop < -200)
      refScrollButton.current.classList.remove("hidden");
    else refScrollButton.current.classList.add("hidden");
  }, []);
  useEventListener("scroll", handleScroll);

  const closeProfile = useCallback((e) => {
    if (
      // e.keyCode === 27 ||
      Array.from(e.target.classList).some(
        (item) => item === "profile-container",
      )
    )
      setOpen(false);
  }, []);
  // useEventListener("keydown", closeProfile);
  useEventListener("click", closeProfile);

  const closeEmoji = useCallback((e) => {
    const classList = Array.from(e.target.classList);
    if (
      classList.some((item) => item === "choose-emoji") ||
      classList.some((item) => item.includes("epr"))
    )
      return;
    setOpenEmoji(false);
  }, []);
  useEventListener("click", closeEmoji);

  const onEmojiClick = (emoji) => {
    refChatInput.setText(emoji.emoji);
  };

  return (
    <div
      ref={refChatboxContainer}
      className="mx-[.1rem] flex flex-1 grow-[2] flex-col items-center"
    >
      <div className="chatbox-content relative flex w-full grow flex-col overflow-hidden [&>*:not(:first-child)]:px-[2rem]">
        <RelightBackground className="absolute bottom-[5%] right-[50%]">
          <div
            ref={refScrollButton}
            className="fa fa-arrow-down flex hidden aspect-square cursor-pointer items-center 
          justify-center rounded-[50%] text-xl font-normal text-[var(--text-main-color-normal)]"
            onClick={scrollChatContentToBottom}
          ></div>
        </RelightBackground>
        {/* <div className="flex h-[7rem] w-full shrink-0 items-center justify-between border-b-[.1rem] border-b-[var(--text-main-color-light)] py-[.5rem] text-[var(--text-main-color-normal)]">
          <div className="flex items-center gap-[1rem]">
            {messages.isGroup ? (
              <ImageWithLightBoxWithShadowAndNoLazy
                src={messages.avatar}
                className="aspect-square w-[4rem] cursor-pointer rounded-[50%]"
                onClick={() => {}}
                immediate={true}
              />
            ) : (
              // <ImageWithLightBoxWithBorderAndShadow
              //   src={
              //     messages.participants?.find(
              //       (item) => item.contact.id !== info.data.id,
              //     )?.contact.avatar ?? ""
              //   }
              //   className="aspect-square w-[4rem] cursor-pointer rounded-[50%]"
              //   // onClick={() => {
              //   //   setUserId(profile?.Id);
              //   //   setOpen(true);
              //   // }}
              //   slides={[
              //     {
              //       src:
              //         messages.participants?.find(
              //           (item) => item.contact.id !== info.data.id,
              //         )?.contact.avatar ?? "",
              //     },
              //   ]}
              // />
              <ImageWithLightBoxWithShadowAndNoLazy
                src={
                  messages.participants?.find(
                    (item) => item.contact.id !== info.data.id,
                  )?.contact.avatar
                }
                className="aspect-square w-[4rem] cursor-pointer rounded-[50%]"
                // onClick={() => {
                //   setUserId(profile?.Id);
                //   setOpen(true);
                // }}
                slides={[
                  {
                    src:
                      messages.participants?.find(
                        (item) => item.contact.id !== info.data.id,
                      )?.contact.avatar ?? "",
                  },
                ]}
                immediate={true}
              />
            )}

            <div
              ref={refTitleContainer}
              className="relative flex grow flex-col laptop:max-w-[30rem] desktop:max-w-[50rem]"
            >
              {messages.isGroup ? (
                <>
                  <div className="flex w-full gap-[.5rem]">
                    <CustomLabel
                      className="text-start text-lg font-bold"
                      title={messages.title}
                      tooltip
                    />
                    <UpdateTitle />
                  </div>
                  <p>{messages.participants.length} members</p>
                </>
              ) : (
                <>
                  <CustomLabel
                    className="text-start text-lg font-bold"
                    title={
                      messages.participants?.find(
                        (item) => item.contact.id !== info.data.id,
                      )?.contact.name
                    }
                  />
                  <FriendRequestButton
                    className="fa fa-user-plus !ml-0 w-auto px-[1rem] text-xs laptop:h-[2rem]"
                    onClose={() => {}}
                  />
                </>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-[1rem]">
            <div
              ref={refToggleInformationContainer}
              onClick={toggleInformationContainer}
              className="fa fa-arrow-right flex aspect-square w-[3rem] cursor-pointer items-center justify-center 
              rounded-[1rem] text-lg font-normal"
            ></div>
          </div>
        </div> */}
        <div
          ref={refChatContent}
          // className=" hide-scrollbar flex grow flex-col-reverse gap-[2rem] overflow-y-scroll scroll-smooth
          // bg-gradient-to-b from-[var(--sub-color)] to-[var(--main-color-thin)] pb-4"
          className="hide-scrollbar mt-4 flex grow flex-col-reverse gap-[2rem] overflow-y-scroll scroll-smooth pb-4"
        >
          {isPending && (
            <MessageContent
              pending={isPending}
              message={{
                type: variables.type,
                content: variables.content,
                contact: {
                  id: info.data.id,
                  name: info.data.name,
                  avatar: info.data.avatar,
                },
                attachments: variables.attachments,
              }}
            />
          )}

          {messages?.messages.map((message) => (
            <MessageContent message={message} />
          ))}
          <BackgroundPortal
            className="!w-[35%]"
            open={open}
            title="Profile"
            onClose={() => setOpen(false)}
          >
            <UserProfile id={userId} onClose={() => setOpen(false)} />
          </BackgroundPortal>
        </div>
      </div>
      <div className="flex w-full items-center justify-center px-8 py-3">
        <div className="flex max-w-[10rem] grow items-center justify-evenly text-[var(--text-main-color-normal)]">
          <input
            multiple
            type="file"
            accept="image/png, image/jpeg"
            className="hidden"
            id="choose-image"
            onChange={chooseFile}
          ></input>
          <Tooltip title="Choose image">
            <label
              for="choose-image"
              className="fa fa-image cursor-pointer font-normal"
            ></label>
          </Tooltip>
          <input
            multiple
            type="file"
            accept=".doc,.docx,.xls,.xlsx,.pdf"
            className="hidden"
            id="choose-file"
            onChange={chooseFile}
          ></input>
          <Tooltip title="Choose file">
            <label
              for="choose-file"
              className="fa fa-file cursor-pointer font-normal"
            ></label>
          </Tooltip>
          {messages.isGroup ? (
            ""
          ) : (
            <div className="relative">
              <Tooltip title="Emoji">
                <label
                  className="fa fa-smile choose-emoji cursor-pointer font-normal"
                  onClick={() => setOpenEmoji(true)}
                ></label>
              </Tooltip>
              <EmojiPicker
                open={openEmoji}
                width={300}
                height={400}
                className="!absolute !bottom-[3rem] !left-[1rem] !z-[1000]"
                onEmojiClick={onEmojiClick}
              />
            </div>
          )}
        </div>
        {files.length !== 0 ? (
          <>
            <div
              // className={`${
              //   files.length === 1
              //     ? "grid-cols-[12rem] p-[.5rem]"
              //     : "p-[.7rem] laptop:grid-cols-[repeat(auto-fill,minmax(9rem,1fr))] desktop:grid-cols-[repeat(auto-fill,minmax(15rem,1fr))]"
              // }
              className={`hide-scrollbar grid max-h-[7rem]              
              gap-[1rem] overflow-y-auto rounded-[.8rem] border-[.2rem] border-[var(--main-color-normal)] p-[.7rem] laptop:w-[clamp(41rem,73%,61rem)] laptop:grid-cols-[repeat(auto-fill,9rem)] 
              desktop:w-[clamp(70rem,75%,120rem)] desktop:grid-cols-[repeat(auto-fill,minmax(15rem,1fr))]`}
            >
              {files.map((item) => (
                <div
                  style={{
                    "--image-url": [
                      "doc",
                      "docx",
                      "xls",
                      "xlsx",
                      "pdf",
                    ].includes(item.name.split(".")[1])
                      ? "url('images/imagenotfound.jpg')"
                      : `url('${URL.createObjectURL(item)}'`,
                  }}
                  className={`relative aspect-video rounded-[.8rem] bg-[image:var(--image-url)] bg-[size:100%] bg-center`}
                  title={item.name.split(".")[0]}
                >
                  <span
                    data-key={item.name}
                    onClick={removeFile}
                    className="fa fa-times-circle absolute right-[0] top-[-5%] z-[1] aspect-square w-[1rem] cursor-pointer rounded-[50%] 
                    bg-white text-[var(--danger-text-color)] hover:text-[var(--danger-text-color-normal)]"
                    title="Clear image"
                  ></span>
                </div>
              ))}
            </div>
            <div className="flex grow items-center justify-center">
              <Tooltip title="Send">
                <div
                  className="fa fa-paper-plane flex aspect-square h-full cursor-pointer  rounded-[.8rem] 
                  text-[var(--main-color-medium)]"
                  onClick={sendMedia}
                ></div>
              </Tooltip>
            </div>
          </>
        ) : (
          // <ChatInput send={sendMessage} refChatInputExpose={refChatInput} />
          <ChatInput
            send={(text) => sendMutation({ type: "text", content: text })}
            refChatInputExpose={refChatInput}
          />
        )}
      </div>
    </div>
  );
};

export default Chatbox;
