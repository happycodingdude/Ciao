import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Tooltip } from "antd";
import EmojiPicker from "emoji-picker-react";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { debounce } from "lodash";
import moment from "moment";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { blurImageOLD, HttpRequest } from "../../common/Utility";
import {
  useConversation,
  useEventListener,
  useInfo,
  useMessage,
} from "../../hook/CustomHooks";
import BackgroundPortal from "../common/BackgroundPortal";
import FetchingMoreMessages from "../common/FetchingMoreMessages";
import UserProfile from "../profile/UserProfile";
import ChatInput from "./ChatInput";
import MessageContent from "./MessageContent";

const Chatbox = (props) => {
  console.log("Chatbox calling");
  const { refChatbox, toggleInformation } = props;

  const queryClient = useQueryClient();

  const refChatContent = useRef();
  const refScrollToBottom = useRef();
  const refToggleInformationContainer = useRef();
  const refChatboxContainer = useRef();
  const refTitleContainer = useRef();
  const refChatInput = useRef();

  const [files, setFiles] = useState([]);
  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState();
  const [openEmoji, setOpenEmoji] = useState(false);
  const [page, setPage] = useState(2);
  const [fetching, setFetching] = useState(false);
  const [emojiText, setEmojiText] = useState();
  const [autoScrollBottom, setAutoScrollBottom] = useState(true);

  const { data: info } = useInfo();
  const { data: conversation } = useConversation();
  const { data: messages, refetch } = useMessage(conversation?.selected, page);

  useEffect(() => {
    // blurImage(".chatbox-content");
    blurImageOLD(".chatbox-content");
    setFiles([]);
    setEmojiText("");

    if (autoScrollBottom) scrollChatContentToBottom();
  }, [messages, autoScrollBottom]);

  useEffect(() => {
    setPage(2);
    setAutoScrollBottom(true);
  }, [conversation?.selected]);

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

  const delay = (delay) => {
    return new Promise((resolve) => setTimeout(resolve, delay));
  };

  const {
    mutate: sendMutation,
    isPending,
    variables,
  } = useMutation({
    mutationFn: async (param) => {
      await delay(1000);

      if (param.type === "text" && param.content === "") return;

      let bodyToCreate = {
        moderator: messages.participants.find((q) => q.isModerator === true)
          .contact.id,
        type: param.type,
        content: param.content,
      };
      let bodyLocal = Object.assign({}, bodyToCreate);

      if (param.type === "media") {
        // const uploaded = await uploadFile().then((uploads) => {
        //   return uploads.map((item) => ({
        //     type: item.type,
        //     mediaUrl: item.url,
        //     mediaName: item.name,
        //     mediaSize: item.size,
        //   }));
        // });
        // bodyToCreate = {
        //   ...bodyToCreate,
        //   attachments: uploaded,
        // };
        bodyLocal = {
          ...bodyLocal,
          attachments: param.attachments,
        };
      }

      // await send(messages.id, bodyToCreate);

      queryClient.setQueryData(["message"], (oldData) => {
        // if (oldData.id !== messages.id) return oldData;
        // oldData.messages = [
        //   {
        //     ...bodyLocal,
        //     contactId: info.data.id,
        //   },
        //   ...oldData.messages,
        // ];
        // return oldData;

        const newData = {
          ...oldData,
          messages: [
            {
              ...bodyLocal,
              contactId: info.data.id,
            },
            ...oldData.messages,
          ],
        };

        return newData;
      });
      queryClient.setQueryData(["conversation"], (oldData) => {
        const clonedConversations = oldData.conversations.map((item) => {
          return Object.assign({}, item);
        });
        const updatedConversations = clonedConversations.map((conversation) => {
          if (conversation.id !== messages.id) return conversation;
          conversation.lastMessage =
            param.type === "text"
              ? param.content
              : files.map((item) => item.name).join(",");
          return conversation;
        });
        return { ...oldData, conversations: updatedConversations };
      });
      if (param.type === "media") {
        // const immediateAttachments = param.attachments.map((item) => {
        //   return { ...item, immediate: true };
        // });
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
            const newData = cloned.map((item) => {
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
    // const uploaded = await uploadFile().then((uploads) => {
    //   return uploads.map((item) => ({
    //     type: item.type,
    //     mediaUrl: item.url,
    //     mediaName: item.name,
    //     mediaSize: item.size,
    //   }));
    // });

    const lazyImages = files.map((item) => {
      // console.log(URL.createObjectURL(item));
      return {
        type: "image",
        mediaUrl: URL.createObjectURL(item),
      };
    });
    setFiles([]);
    sendMutation({ type: "media", attachments: lazyImages });
  };

  useEffect(() => {
    scrollChatContentToBottom();
  }, [isPending]);

  const scrollChatContentToBottom = () => {
    refChatContent.current.scrollTop = refChatContent.current.scrollHeight;
    // refChatContent.current.scrollTop = 0;
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

  const fetchMoreMessage = (conversationId, page, currentScrollHeight) => {
    setFetching(true);
    HttpRequest({
      method: "get",
      url: import.meta.env.VITE_ENDPOINT_MESSAGE_GETWITHPAGING.replace(
        "{id}",
        conversationId,
      ).replace("{page}", page),
    }).then((data) => {
      queryClient.setQueryData(["message"], (oldData) => {
        const cloned = Object.assign({}, oldData);
        cloned.messages = [...cloned.messages, ...data.data.messages];
        cloned.nextExist = data.data.nextExist;
        return cloned;
      });
      setPage((current) => current + 1);
      setFetching(false);
      requestAnimationFrame(() => {
        refChatContent.current.style.scrollBehavior = "auto";
        refChatContent.current.scrollTop =
          refChatContent.current.scrollHeight - currentScrollHeight;
        refChatContent.current.style.scrollBehavior = "smooth";
      });
    });
  };

  const debounceFetch = useCallback(debounce(fetchMoreMessage, 100), []);

  const handleScroll = useCallback(async () => {
    // Nếu scroll 1 khoảng lớn hơn kích thước ô chat thì hiện nút scroll to bottom
    const distanceFromBottom =
      refChatContent.current.scrollHeight -
      (refChatContent.current.scrollTop + refChatContent.current.clientHeight);
    if (distanceFromBottom >= refChatContent.current.clientHeight)
      refScrollToBottom.current.setAttribute("data-show", "true");
    else refScrollToBottom.current.setAttribute("data-show", "false");

    if (refChatContent.current.scrollTop === 0 && messages.nextExist) {
      setAutoScrollBottom(false);
      const currentScrollHeight = refChatContent.current.scrollHeight;
      debounceFetch(messages.id, page, currentScrollHeight);
    }
  }, [messages, page]);
  useEventListener("scroll", handleScroll);

  return (
    <div
      ref={refChatboxContainer}
      className="mx-[.1rem] flex flex-1 grow-[2] flex-col items-center"
    >
      <div className="chatbox-content relative flex w-full grow flex-col overflow-hidden p-8">
        {/* <RelightBackground className="absolute bottom-[5%] right-[50%]"> */}
        {fetching ? <FetchingMoreMessages loading /> : ""}
        <div
          ref={refScrollToBottom}
          data-show="false"
          className="fa fa-chevron-down absolute bottom-[5%] right-[50%] flex aspect-square w-[3rem] cursor-pointer
          items-center justify-center rounded-[50%] bg-[var(--main-color-medium)] text-lg font-light text-[var(--text-main-color)]
          transition-all duration-200 hover:bg-[var(--main-color)]
          data-[show=false]:pointer-events-none data-[show=true]:pointer-events-auto data-[show=false]:z-0
          data-[show=true]:z-10 data-[show=false]:opacity-0 data-[show=true]:opacity-100"
          onClick={scrollChatContentToBottom}
        ></div>
        {/* </RelightBackground> */}
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
          className="hide-scrollbar mt-4 flex grow flex-col gap-[2rem] overflow-y-scroll scroll-smooth"
        >
          {[...messages?.messages].reverse().map((message) => (
            <MessageContent message={message} />
          ))}

          {isPending && (
            <MessageContent
              pending={isPending}
              message={{
                type: variables.type,
                content: variables.content,
                contactId: info.data.id,
                attachments: variables.attachments,
              }}
            />
          )}

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
        <div className="flex max-w-[10rem] grow items-center justify-evenly">
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
          {/* {messages.isGroup ? (
            ""
          ) : ( */}
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
              onEmojiClick={(emoji) => setEmojiText(emoji.emoji)}
            />
          </div>
          {/* )} */}
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
              gap-[1rem] overflow-y-auto rounded-[.8rem] border-[.2rem] border-[var(--main-color-light)] p-[.7rem] laptop:w-[clamp(41rem,73%,61rem)] laptop:grid-cols-[repeat(auto-fill,9rem)] 
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
                  className="fa fa-paper-plane flex aspect-square h-full cursor-pointer rounded-[.8rem] 
                  text-[var(--main-color-light)]"
                  onClick={sendMedia}
                ></div>
              </Tooltip>
            </div>
          </>
        ) : (
          <ChatInput
            send={(text) => {
              if (text.trim() === "") return;
              sendMutation({ type: "text", content: text });
            }}
            emoji={emojiText}
          />
        )}
      </div>
    </div>
  );
};

export default Chatbox;
