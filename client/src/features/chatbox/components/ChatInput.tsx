import appleEmojisData from "@emoji-mart/data/sets/14/apple.json";
import Picker from "@emoji-mart/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import moment from "moment";
import React, { ChangeEvent, useCallback, useEffect, useState } from "react";
import CustomContentEditable from "../../../components/CustomContentEditable";
import ImageWithLightBoxAndNoLazy from "../../../components/ImageWithLightBoxAndNoLazy";
import useEventListener from "../../../hooks/useEventListener";
import { ChatInputProps } from "../../../types";
import delay from "../../../utils/delay";
import useInfo from "../../authentication/hooks/useInfo";
import useConversation from "../../listchat/hooks/useConversation";
import {
  AttachmentCache,
  AttachmentModel,
  ConversationCache,
  MessageCache,
  MessageModel,
} from "../../listchat/types";
import sendMessage from "../services/sendMessage";
import {
  MentionModel,
  SendMessageRequest,
  SendMessageResponse,
} from "../types";
import ChatboxMenu from "./ChatboxMenu";
import ImageItem from "./ImageItem";

const ChatInput = (props: ChatInputProps) => {
  const { className, inputRef } = props;

  // if (!inputRef?.current) return;

  const queryClient = useQueryClient();

  const { data: info } = useInfo();
  // const { data: messages } = useMessage();
  const { data: conversations } = useConversation();

  // const inputRef = useRef();

  const [mentions, setMentions] = useState<MentionModel[]>([]);
  const [showMention, setShowMention] = useState<boolean>(false);
  const [showEmoji, setShowEmoji] = useState<boolean>(false);
  const [files, setFiles] = useState<File[]>([]);

  useEffect(() => {
    // if (inputRef) {
    //   inputRef.current.textContent = "";
    //   inputRef.current.focus();
    // }
    setFiles([]);
    setMentions(() => {
      return conversations?.selected?.members
        .filter((item) => item.contact.id !== info.id)
        .map((item) => {
          return {
            name: item.contact.name,
            avatar: item.contact.avatar ?? "src/assets/imagenotfound.jpg",
            userId: item.contact.id,
          };
        });
    });
  }, [conversations?.selected]);

  const setCaretToEnd = (addSpace: boolean) => {
    // inputRef.current.textContent += " ";
    if (addSpace) inputRef.current.innerHTML += "&nbsp;"; // Adds a non-breaking space
    inputRef.current.focus();

    // Create a range and set it to the end of the content
    const range = document.createRange();
    range.selectNodeContents(inputRef.current);
    range.collapse(false); // Collapse the range to the end

    // Create a selection and add the range to it
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  };

  const chooseMention = (id: string) => {
    const user = mentions.find((item) => item.userId === id);
    // inputRef.current.innerHTML += "&nbsp;";
    inputRef.current.innerText =
      inputRef.current.innerText.replace("@", "") + user.name;
    // inputRef.current.focus();
    setCaretToEnd(true);
    setShowMention(false);
  };

  const uploadFile = async (files: File[]) => {
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

  const { mutate: sendMutation } = useMutation({
    mutationFn: async (param: SendMessageRequest) => {
      const randomId: string = Math.random().toString(36).substring(2, 7);
      const hasMedia: boolean = param.files.length !== 0;

      queryClient.setQueryData(
        ["conversation"],
        (oldData: ConversationCache) => {
          const updatedConversations = oldData.conversations.map(
            (conversation) => {
              if (conversation.id !== conversations?.selected.id)
                return conversation;
              return {
                ...conversation,
                lastMessage:
                  param.type === "text"
                    ? param.content
                    : param.files.map((item) => item.name).join(","),
              };
            },
          );
          return {
            ...oldData,
            conversations: updatedConversations,
            filterConversations: updatedConversations,
          } as ConversationCache;
        },
      );

      let bodyToCreate: SendMessageRequest = {
        type: param.type,
        content: param.content,
      };
      let bodyLocal: SendMessageRequest = Object.assign({}, bodyToCreate);

      const today: string = moment().format("MM/DD/YYYY");
      if (hasMedia) {
        queryClient.setQueryData(["message"], (oldData: MessageCache) => {
          return {
            ...oldData,
            messages: [
              ...(oldData.messages || []),
              {
                id: randomId,
                type: param.type,
                content: param.content,
                contactId: info.id,
                attachments: param.attachments.map((item) => {
                  return { ...item, id: randomId };
                }),
                currentReaction: null,
                noLazy: true,
                pending: true,
              } as MessageModel,
            ],
          } as MessageCache;
        });
        queryClient.setQueryData(
          ["attachment"],
          (oldData: AttachmentCache[]) => {
            queryClient.setQueryData(
              ["attachment"],
              (oldData: AttachmentCache[] = []) => {
                // If there is no attachment yet, create a new entry
                if (oldData.length === 0 || oldData[0].date !== today) {
                  return [
                    {
                      date: today,
                      attachments: param.attachments.map((item) => {
                        return { ...item, id: randomId };
                      }),
                    },
                    ...oldData, // Return a new array to trigger state updates
                  ] as AttachmentCache[];
                }

                // If today's entry exists, update its attachments
                return oldData.map((item) =>
                  item.date === today
                    ? {
                        ...item,
                        attachments: [
                          ...param.attachments.map((item) => {
                            return { ...item, id: randomId };
                          }),
                          ...item.attachments,
                        ],
                      }
                    : item,
                ) as AttachmentCache[];
              },
            );
          },
        );
        const uploaded: AttachmentModel[] = await uploadFile(param.files).then(
          (uploads) => {
            return uploads.map((item) => ({
              type: item.type,
              mediaUrl: item.url,
              mediaName: item.name,
              mediaSize: item.size,
            }));
          },
        );
        bodyToCreate = {
          ...bodyToCreate,
          attachments: uploaded,
        };
        bodyLocal = {
          ...bodyLocal,
          attachments: param.attachments,
        };
      } else {
        queryClient.setQueryData(["message"], (oldData: MessageCache) => {
          return {
            ...oldData,
            messages: [
              ...(oldData.messages || []),
              {
                id: randomId,
                type: param.type,
                content: param.content,
                contactId: info.id,
                attachments: [],
                currentReaction: null,
                noLazy: true,
                pending: true,
              } as MessageModel,
            ],
          } as MessageCache;
        });
      }

      const res: SendMessageResponse = await sendMessage(
        conversations?.selected.id,
        bodyToCreate,
      );
      await delay(1000);

      queryClient.setQueryData(["message"], (oldData: MessageCache) => {
        return {
          ...oldData,
          messages: oldData.messages.map((message) => {
            if (message.id !== randomId) return message;
            return {
              ...message,
              id: res.message,
              loaded: true,
              pending: false,
              attachments: message.attachments.map((atta, index) => {
                if (atta.id !== randomId) return atta;
                return {
                  ...atta,
                  id: res.attachments[index],
                  pending: false,
                };
              }),
            };
          }),
        } as MessageCache;
      });

      if (hasMedia) {
        queryClient.setQueryData(
          ["attachment"],
          (oldData: AttachmentCache[]) => {
            return oldData.map((item) =>
              item.date === today
                ? {
                    ...item,
                    attachments: item.attachments.map((atta, index) => {
                      if (atta.id !== randomId) return atta;
                      return {
                        ...atta,
                        id: res.attachments[index],
                        pending: false,
                      };
                    }),
                  }
                : item,
            ) as AttachmentCache[];
          },
        );
      }
    },
  });

  const chat = () => {
    // send(inputRef.current.innerText, files ?? []);

    if (inputRef.current.innerText.trim() === "" && files.length === 0) return;

    const lazyImages = files.map((item) => {
      return {
        type: "image",
        mediaUrl: URL.createObjectURL(item),
        pending: true,
      } as AttachmentModel;
    });
    // setFiles([]);
    sendMutation({
      type: inputRef.current.innerText.trim() === "" ? "media" : "text",
      content: inputRef.current.innerText,
      attachments: lazyImages,
      files: files,
    });

    inputRef.current.innerText = "";
    setFiles([]);
  };

  const keydownBindingFn = (e) => {
    if (e.keyCode === 13 && !e.shiftKey) {
      e.preventDefault();
      chat();
    } else if (e.key === "@") {
      setShowMention(true);
    } else {
      setShowMention(false);
    }
  };

  const keyupBindingFn = (e) => {
    e.preventDefault();

    // Cái này cho element input
    // const cursorPosition = inputRef.current.selectionStart;

    // Cái này cho element contenteditable
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    const clonedRange = range.cloneRange();
    clonedRange.selectNodeContents(inputRef.current);
    clonedRange.setEnd(range.endContainer, range.endOffset);

    const cursorPosition = clonedRange.toString().length;
    // Ensure the cursor is not at the start (index 0)
    if (cursorPosition > 0) {
      const textBeforeCursor = inputRef.current.innerText.substring(
        0,
        cursorPosition,
      );
      const charBeforeCursor = textBeforeCursor[textBeforeCursor.length - 1];

      // console.log("Character before cursor:", charBeforeCursor);

      if (charBeforeCursor === "@" && e.keyCode === 32 && e.ctrlKey)
        setShowMention(true);
    }
  };

  // Event listener
  const closeMentionOnClick = useCallback((e) => {
    if (e.target.closest(".mention-item")) return;
    setShowMention(false);
  }, []);
  useEventListener("click", closeMentionOnClick);

  const hideMentionOnKey = useCallback((e) => {
    if (e.keyCode === 27) {
      setShowMention(false);
    }
  }, []);
  useEventListener("keydown", hideMentionOnKey);

  // const closeEmojiOnClick = useCallback((e) => {
  //   const classList = Array.from(e.target.classList);
  //   if (
  //     e.target.closest("emoji-item") ||
  //     classList.some((item) => item.includes("epr"))
  //   )
  //     return;
  //   setShowEmoji(false);
  // }, []);
  const closeEmojiOnClick = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const classList = Array.from(target.classList);
    if (
      target.closest(".emoji-item") ||
      classList.some((item) => item.includes("epr"))
    )
      return;
    setShowEmoji(false);
  }, []);
  // useEventListener("click", closeEmojiOnClick);

  const closeEmojiOnKey = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") {
      setShowEmoji(false);
    }
  }, []);
  useEventListener("keydown", closeEmojiOnKey);

  const chooseFile = (e: ChangeEvent<HTMLInputElement>) => {
    const chosenFiles = Array.from(e.target.files);
    if (chosenFiles.length === 0) return;

    const mergedFiles = chosenFiles.filter((item) => {
      if (!files) return item;
      if (!files.some((file) => file.name === item.name)) return item;
    });
    setFiles(!files ? [...mergedFiles] : [...files, ...mergedFiles]);

    e.target.value = null;

    // onInput(files.length === 0);
  };

  const removeFile = useCallback(
    (e) => {
      setFiles((current) =>
        current.filter((item) => item.name !== e.target.dataset.key),
      );
      // onInput(files.length === 0);
    },
    [files],
  );

  useEffect(() => {
    if (files?.length !== 0) setCaretToEnd(false);
    // if (files && onInput) onInput();
  }, [files]);

  // useEffect(() => {
  //   if (!files || files.length === 0) return;

  //   const fileContainer = document.querySelector(".file-container");
  //   const callback = (e) => {
  //     e.preventDefault();

  //     fileContainer.scrollBy({
  //       left: e.deltaY < 0 ? -100 : 100,
  //     });
  //   };
  //   fileContainer.addEventListener("wheel", callback, true);
  //   return () => {
  //     fileContainer.removeEventListener("wheel", callback, true);
  //   };
  // }, [files]);

  // const expandTextarea = useCallback((e) => {
  //   e.target.style.height = "auto";
  //   e.target.style.height = e.target.scrollHeight + "px";
  // }, []);

  return (
    <div className={`flex w-full grow items-center justify-center`}>
      <div
        // className={`${className} relative grow rounded-[.5rem] bg-[var(--bg-color-extrathin)] laptop:max-w-[65rem]`}
        className={`${className} relative flex grow flex-col rounded-[.5rem] bg-[var(--bg-color-extrathin)] laptop:max-w-[65rem]`}
      >
        {files?.length !== 0 ? (
          <div
            className={`file-container custom-scrollbar flex w-full gap-[1rem] overflow-x-auto scroll-smooth p-[.7rem]`}
          >
            {files?.map((item) => (
              <ImageItem file={item} onClick={removeFile} key={item.name} />
            ))}
          </div>
        ) : (
          ""
        )}
        <div
          className={`mention-item relative w-full ${files?.length !== 0 ? "py-3" : "py-2"}`}
        >
          {conversations?.selected?.isGroup ? (
            <div
              data-show={showMention}
              className="hide-scrollbar absolute bottom-[4rem] left-0 flex flex-col overflow-y-scroll
          scroll-smooth rounded-[.7rem] bg-[var(--bg-color-light)] p-2 text-sm transition-all duration-200
          data-[show=false]:pointer-events-none data-[show=true]:pointer-events-auto data-[show=false]:opacity-0 data-[show=true]:opacity-100 
          laptop:max-h-[20rem] laptop:w-[20rem]"
            >
              {mentions?.map((item) => (
                <div
                  className="flex cursor-pointer gap-[1rem] rounded-[.7rem] p-3 hover:bg-[var(--bg-color-extrathin)]"
                  // data-user={item.userId}
                  onClick={() => chooseMention(item.userId)}
                >
                  <ImageWithLightBoxAndNoLazy
                    src={item.avatar}
                    className="aspect-square cursor-pointer rounded-[50%] laptop:w-[3rem]"
                    slides={[
                      {
                        src: item.avatar,
                      },
                    ]}
                    // onClick={() => {}}
                  />
                  <p>{item.name}</p>
                </div>
              ))}
            </div>
          ) : (
            ""
          )}
          <ChatboxMenu
            chooseFile={chooseFile}
            className={`absolute left-[1rem] ${files?.length !== 0 ? "top-[1.3rem] " : "top-[.8rem] "}`}
          />
          {/* <div
            ref={inputRef}
            // ref={ref}
            contentEditable={true}
            // data-text="Type something.."
            // aria-placeholder="Type something.."
            className={`hide-scrollbar w-full resize-none overflow-y-auto break-all
            pb-2 outline-none laptop:max-h-[10rem] ${noMenu ? "px-3" : "px-16"}`}
            onKeyDown={keyBindingFn}
            onKeyUp={keyupBindingFn}
          ></div> */}
          <CustomContentEditable
            ref={inputRef}
            onKeyDown={keydownBindingFn}
            onKeyUp={keyupBindingFn}
            className="px-[4rem]"
          />
          {/* <div className="relative"> */}
          <label
            className={`emoji-item fa fa-smile choose-emoji absolute right-[1rem] ${files?.length !== 0 ? "top-[1.3rem] " : "top-[.8rem] "} 
          cursor-pointer text-md font-normal`}
            onClick={() => setShowEmoji(true)}
          ></label>
          {/* </div> */}
        </div>
        {showEmoji && (
          <div className="absolute bottom-[3rem] right-0">
            <Picker
              data={appleEmojisData}
              set="apple"
              onEmojiSelect={(e) => (inputRef.current.innerText += e.native)}
              onClickOutside={(e) => {
                if (e.target.classList.contains("emoji-item"))
                  setShowEmoji(true);
                else setShowEmoji(false);
              }}
            />
          </div>
        )}
        {/* <div
          className={`${showEmoji ? "block" : "hidden"} absolute bottom-[3rem] right-0`}
        >
          <Picker
            data={appleEmojisData}
            set="apple"
            onEmojiSelect={(e) => (inputRef.current.innerText += e.native)}
            onClickOutside={(e) => {
              if (e.target.classList.contains("emoji-item")) setShowEmoji(true);
              else setShowEmoji(false);
            }}
          />
        </div> */}
        {/* <EmojiPicker
          open={showEmoji}
          width={300}
          height={400}
          onEmojiClick={(emoji) => (inputRef.current.innerText += emoji.emoji)}
          className="emoji-item !absolute right-[2rem] top-[-41rem]"
          // icons="solid"
        /> */}
      </div>
    </div>
  );
};

export default ChatInput;
