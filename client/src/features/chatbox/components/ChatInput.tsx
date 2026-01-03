import { CloseOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import dayjs from "dayjs";
import React, {
  ChangeEvent,
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import "../../../chatinput.css";
import CustomContentEditable from "../../../components/CustomContentEditable";
import ImageWithLightBoxAndNoLazy from "../../../components/ImageWithLightBoxAndNoLazy";
import useEventListener from "../../../hooks/useEventListener";
import { ChatInputProps } from "../../../types";
import { getToday } from "../../../utils/datetime";
import delay from "../../../utils/delay";
import { isPhoneScreen } from "../../../utils/getScreenSize";
import useInfo from "../../authentication/hooks/useInfo";
import useConversation from "../../listchat/hooks/useConversation";
import {
  AttachmentCache,
  AttachmentModel,
  ConversationCache,
  ConversationModel,
  MessageCache,
  PendingMessageModel,
} from "../../listchat/types";
import { uploadFile } from "../functions/uploadFile";
import useChatDetailToggles from "../hooks/useChatDetailToggles";
import sendMessage from "../services/sendMessage";
import {
  MentionModel,
  SendMessageRequest,
  SendMessageResponse,
} from "../types";
import ImageItem from "./ImageItem";

// ✅ Lazy load emoji picker to reduce initial bundle (-550KB)
const LazyEmojiPicker = lazy(
  () => import("../../../components/LazyEmojiPicker"),
);

const ChatInput = (props: ChatInputProps) => {
  const { className } = props;

  const queryClient = useQueryClient();

  const { toggle } = useChatDetailToggles();
  const { data: info } = useInfo();
  const { data: conversations } = useConversation();
  // if (!conversations) return null; // Tránh render khi chưa có dữ liệu cần thiết

  // const [conversationId] = useLocalStorage<string>("conversationId");
  // const conversation = conversations.filterConversations.find(
  //   (c) => c.id === conversationId,
  // );
  const { conversationId } = useParams({
    from: "/conversations/_layout/$conversationId",
  });
  const conversation = conversations.conversations.find(
    (c) => c.id === conversationId,
  );

  const [mentions, setMentions] = useState<MentionModel[]>([]);
  const [showMention, setShowMention] = useState<boolean>(false);
  const [showEmoji, setShowEmoji] = useState<boolean>(false);
  const [files, setFiles] = useState<File[]>([]);

  const [isEmpty, setIsEmpty] = useState<boolean>(true);

  const inputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setFiles([]);
    setMentions(() => {
      return conversation.members
        .filter((item) => item.contact.id !== info.id)
        .map((item) => {
          return {
            name: item.contact.name,
            avatar: item.contact.avatar,
            userId: item.contact.id,
          };
        });
    });

    // inputRef.current.focus();
    inputRef.current.innerText = "";
  }, [conversation]);

  const setCaretToEnd = (addSpace: boolean) => {
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
    inputRef.current.innerText =
      inputRef.current.innerText.replace("@", "") + `@[${user.name}]`;
    setCaretToEnd(true);
    setShowMention(false);
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
              if (conversation.id !== conversationId) return conversation;
              return {
                ...conversation,
                lastMessage:
                  param.type === "text"
                    ? param.content
                    : param.files.map((item) => item.name).join(","),
                lastMessageTime: dayjs().format(),
              } as ConversationModel;
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
      // let bodyLocal: SendMessageRequest = Object.assign({}, bodyToCreate);
      if (hasMedia) {
        queryClient.setQueryData(
          ["message", conversationId],
          (oldData: MessageCache) => {
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
                  noLazy: true,
                  pending: true,
                  likeCount: 0,
                  loveCount: 0,
                  careCount: 0,
                  wowCount: 0,
                  sadCount: 0,
                  angryCount: 0,
                  currentReaction: null,
                  createdTime: dayjs().format(),
                } as PendingMessageModel,
              ],
            } as MessageCache;
          },
        );
        queryClient.setQueryData(
          ["attachment", conversationId],
          (oldData: AttachmentCache) => {
            const today = getToday("MM/DD/YYYY");

            if (!oldData?.attachments) {
              return {
                ...oldData,
                attachments: [
                  {
                    date: today,
                    attachments: param.attachments.map((item) => {
                      return { ...item, id: randomId };
                    }),
                  },
                ],
              } as AttachmentCache;
            }

            const existingItem = oldData.attachments.find(
              (item) => item.date === today,
            );

            if (!existingItem) {
              return {
                ...oldData,
                attachments: [
                  ...oldData.attachments,
                  {
                    date: today,
                    attachments: param.attachments.map((item) => {
                      return { ...item, id: randomId };
                    }),
                  },
                ],
              } as AttachmentCache;
            }

            return {
              ...oldData,
              attachments: oldData.attachments.map((item) =>
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
              ),
            } as AttachmentCache;
          },
        );

        const uploaded: AttachmentModel[] = await uploadFile(param.files);
        bodyToCreate = {
          ...bodyToCreate,
          attachments: uploaded,
        };
      } else {
        queryClient.setQueryData(
          ["message", conversationId],
          (oldData: MessageCache) => {
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
                  noLazy: true,
                  pending: true,
                  likeCount: 0,
                  loveCount: 0,
                  careCount: 0,
                  wowCount: 0,
                  sadCount: 0,
                  angryCount: 0,
                  currentReaction: null,
                  createdTime: dayjs().format(),
                } as PendingMessageModel,
              ],
            } as MessageCache;
          },
        );
      }

      const res: SendMessageResponse = await sendMessage(
        conversation.id,
        bodyToCreate,
      );
      await delay(500);

      queryClient.setQueryData(
        ["message", conversationId],
        (oldData: MessageCache) => {
          return {
            ...oldData,
            messages: oldData.messages.map((message) => {
              if (message.id !== randomId) return message;
              return {
                ...message,
                id: res.messageId,
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
        },
      );

      if (hasMedia) {
        queryClient.setQueryData(
          ["attachment", conversationId],
          (oldData: AttachmentCache) => {
            return {
              ...oldData,
              attachments: oldData.attachments.map((item) =>
                item.date === getToday("MM/DD/YYYY")
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
              ),
            } as AttachmentCache;
          },
        );
      }
    },
  });

  const chat = () => {
    if (inputRef.current.innerText.trim() === "" && files.length === 0) return;

    const lazyImages = files.map((item) => {
      return {
        type: "image",
        mediaUrl: URL.createObjectURL(item),
        pending: true,
        local: true,
      } as AttachmentModel;
    });
    sendMutation({
      type: inputRef.current.innerText.trim() === "" ? "media" : "text",
      content: inputRef.current.innerText,
      attachments: lazyImages,
      files: files,
    });

    inputRef.current.innerText = "";
    setFiles([]);
  };

  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  const keydownBindingFn = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const key = e.key;

      if (key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % mentions.length);
      } else if (key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex(
          (prev) => (prev - 1 + mentions.length) % mentions.length,
        );
      } else if (key === "Enter" && showMention) {
        e.preventDefault();
        chooseMention(mentions[selectedIndex].userId);
      }

      // Enter mà không giữ Shift -> gửi tin nhắn
      else if (key === "Enter" && !e.shiftKey) {
        e.preventDefault(); // Ngăn xuống dòng
        chat();
      }

      // Nếu nội dung đang rỗng và người dùng gõ phím không phải là Backspace
      else if (isEmpty && key !== "Backspace") {
        setIsEmpty(false);
      }
      // Nhấn @ để hiển thị Mention
      else if (key === "@") {
        setShowMention(true);
      }
      // Mọi phím khác -> ẩn Mention
      else {
        setShowMention(false);
      }
    },
    [
      isEmpty,
      chat,
      setShowMention,
      mentions,
      selectedIndex,
      chooseMention,
      showMention,
    ],
  );

  const keyupBindingFn = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      e.preventDefault();

      const input = inputRef.current;
      if (!input) return;

      const text = input.innerText.trim();

      // Cập nhật isEmpty nếu cần
      if (text === "" && !isEmpty) {
        setIsEmpty(true);
      }

      // Lấy selection trong contentEditable
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;

      const range = selection.getRangeAt(0);
      const clonedRange = range.cloneRange();
      clonedRange.selectNodeContents(input);
      clonedRange.setEnd(range.endContainer, range.endOffset);

      const cursorPosition = clonedRange.toString().length;

      if (cursorPosition > 0) {
        const textBeforeCursor = input.innerText.substring(0, cursorPosition);
        const charBeforeCursor = textBeforeCursor[textBeforeCursor.length - 1];

        // Nếu trước đó là @ và vừa nhấn Ctrl + Space
        if (charBeforeCursor === "@" && e.key === " " && e.ctrlKey) {
          setShowMention(true);
        }
      }
    },
    [isEmpty, setIsEmpty, setShowMention],
  );

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
  // useEventListener("keydown", hideMentionOnKey);

  // const closeEmojiOnClick = useCallback((e: MouseEvent) => {
  //   const target = e.target as HTMLElement;
  //   const classList = Array.from(target.classList);
  //   if (
  //     target.closest(".emoji-item") ||
  //     classList.some((item) => item.includes("epr"))
  //   )
  //     return;
  //   setShowEmoji(false);
  // }, []);
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
  };

  const removeFile = useCallback(
    (fileName: string) => {
      setFiles((current) => current.filter((item) => item.name !== fileName));
    },
    [files],
  );

  useEffect(() => {
    if (files?.length !== 0) setCaretToEnd(false);
  }, [files]);

  const { data: reply } = useQuery({
    queryKey: ["reply"],
    queryFn: () => undefined, // không fetch
    enabled: false, // chỉ dùng cache
  });

  return (
    <div className={`flex w-full items-center justify-center laptop:mb-4`}>
      <div
        className={`${className} chat-input-container relative flex w-full grow flex-col bg-white
        transition-all duration-200
        ${
          isPhoneScreen()
            ? "max-w-140"
            : !toggle || toggle === "" || toggle === "null"
              ? "laptop:max-w-240"
              : "laptop:max-w-180"
        }  
        `}
      >
        {/* MARK: FORWARD MESSAGE */}
        {reply && (
          <div className="flex">
            <div className="mb-2 border-l-[.3rem] border-l-light-blue-500/50 px-3">
              <p className="truncate italic text-light-blue-500">
                Reply to {reply.contact}
              </p>
              <p className="truncate">{reply.replyContent}</p>
            </div>
            <CloseOutlined
              className="flex cursor-pointer items-start"
              onClick={(e) => {
                e.stopPropagation(); // Prevent bubbling to parent
                queryClient.removeQueries({ queryKey: ["reply"], exact: true });
              }}
            />
          </div>
        )}
        {/* MARK: FILES */}
        {files?.length !== 0 ? (
          <div className="custom-scrollbar flex gap-4 overflow-x-auto rounded-2xl p-6">
            {files?.map((item) => (
              <ImageItem file={item} onClick={removeFile} key={item.name} />
            ))}
          </div>
        ) : (
          ""
        )}

        {/* MARK: Chat Input */}
        <div className={`mention-item relative w-full`}>
          {/* MARK: MENTION */}
          {conversation.isGroup ? (
            <div
              data-show={showMention}
              className="hide-scrollbar z-2 absolute bottom-32 left-20 flex flex-col overflow-y-scroll
          scroll-smooth rounded-[.7rem] bg-white p-2 text-sm shadow-[0_2px_10px_rgba(0,0,0,0.1)] transition-all duration-200
          data-[show=false]:pointer-events-none data-[show=true]:pointer-events-auto data-[show=false]:opacity-0 data-[show=true]:opacity-100 
          phone:max-h-72 phone:w-[18rem] laptop:max-h-80 laptop:w-[20rem]"
            >
              {mentions?.map((item, index) => (
                <div
                  key={item.userId}
                  className={`mention-user flex cursor-pointer gap-4 rounded-[.7rem] p-3 ${index === selectedIndex ? "active" : ""}`}
                  onClick={() => chooseMention(item.userId)}
                >
                  <ImageWithLightBoxAndNoLazy
                    src={item.avatar}
                    slides={[
                      {
                        src: item.avatar,
                      },
                    ]}
                    className="aspect-square cursor-pointer phone:w-8 tablet:w-10 laptop:w-12"
                    circle
                  />
                  <p>{item.name}</p>
                </div>
              ))}
            </div>
          ) : (
            ""
          )}

          {/* MARK: MENU */}
          <div className="flex flex-col gap-4 px-4 pb-2 pt-4">
            <div className="flex items-center gap-4">
              <label
                className="emoji-item toolbar-btn fa-regular fa-face-smile flex aspect-square cursor-pointer items-center justify-center rounded-full bg-gray-100 text-base text-gray-500 hover:bg-gray-100 hover:text-light-blue-500"
                onClick={() => setShowEmoji(true)}
              ></label>

              <div className="toolbar-btn flex aspect-square items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-100 hover:text-light-blue-500">
                <input
                  multiple
                  type="file"
                  accept=".doc,.docx,.xls,.xlsx,.pdf"
                  className="hidden"
                  id="choose-file"
                  onChange={chooseFile}
                ></input>
                <label
                  htmlFor="choose-file"
                  className="flex w-full cursor-pointer items-center justify-center"
                >
                  <i className="fa-solid fa-paperclip text-base"></i>
                </label>
              </div>
              <div className="toolbar-btn flex aspect-square items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-100 hover:text-light-blue-500">
                <input
                  multiple
                  type="file"
                  accept="image/*"
                  className="hidden"
                  id="choose-image"
                  onChange={chooseFile}
                ></input>
                <label
                  htmlFor="choose-image"
                  className="flex w-full cursor-pointer items-center justify-center"
                >
                  <i className="fa-solid fa-image text-base"></i>
                </label>
              </div>
              <button className="toolbar-btn flex aspect-square items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-100 hover:text-light-blue-500">
                <i className="fa-solid fa-microphone text-base"></i>
              </button>
            </div>

            {/* MARK: TEXT INPUT */}
            <div className="flex items-end gap-4">
              <div className="flex-1 self-center">
                <CustomContentEditable
                  ref={inputRef}
                  onKeyDown={keydownBindingFn}
                  onKeyUp={keyupBindingFn}
                  isEmpty={isEmpty}
                />
              </div>
              <button className="send-btn flex aspect-square cursor-pointer items-center justify-center rounded-full bg-light-blue-400 text-white laptop:w-9">
                <i className="fa-solid fa-paper-plane laptop:text-xs"></i>
              </button>
            </div>
          </div>
        </div>
        {/* MARK: EMOJI */}
        {showEmoji && (
          <div className="-top-176 absolute left-0">
            <Suspense
              fallback={
                <div className="h-176 w-84 animate-pulse rounded-lg bg-gray-100" />
              }
            >
              <LazyEmojiPicker
                onEmojiSelect={(e) => (inputRef.current.innerText += e.native)}
                onClickOutside={(e) => {
                  if (e.target.classList.contains("emoji-item"))
                    setShowEmoji(true);
                  else setShowEmoji(false);
                }}
              />
            </Suspense>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInput;
