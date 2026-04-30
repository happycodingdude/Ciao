import { CloseOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import useChatDetailToggles from "../../hooks/useChatDetailToggles";
import useConversation from "../../hooks/useConversation";
import useEventListener from "../../hooks/useEventListener";
import useInfo from "../../hooks/useInfo";
import { Route } from "../../routes/_layout.conversations.$conversationId";
import { sendMessage } from "../../services/message.service";
import "../../styles/chatinput.css";
import { ChatInputProps } from "../../types/base.types";
import { ConversationCache, ConversationModel } from "../../types/conv.types";
import {
  AttachmentCache,
  AttachmentModel,
  MentionModel,
  MessageCache,
  PendingMessageModel,
  SendMessageRequest,
  SendMessageResponse,
} from "../../types/message.types";
import { getToday } from "../../utils/datetime";
import delay from "../../utils/delay";
import { isPhoneScreen } from "../../utils/getScreenSize";
import { uploadFile } from "../../utils/uploadFile";
import CustomContentEditable from "../common/CustomContentEditable";
import ImageWithLightBoxAndNoLazy from "../common/ImageWithLightBoxAndNoLazy";
import ImageItem from "../message/ImageItem";

// ✅ Lazy load emoji picker to reduce initial bundle (-550KB)
const LazyEmojiPicker = lazy(() => import("../common/LazyEmojiPicker"));

const ChatInput = (props: ChatInputProps) => {
  const { className } = props;

  const queryClient = useQueryClient();

  const { toggle } = useChatDetailToggles();
  const { data: info } = useInfo();
  const { data: conversations } = useConversation();

  const { conversationId } = Route.useParams();
  const conversation = conversations.conversations.find(
    (c) => c.id === conversationId,
  );

  const { data: reply } = useQuery({
    queryKey: ["reply"],
    queryFn: () => null,
  });

  const [mentions, setMentions] = useState<MentionModel[]>([]);
  const [showMention, setShowMention] = useState<boolean>(false);
  const [showEmoji, setShowEmoji] = useState<boolean>(false);
  const [files, setFiles] = useState<File[]>([]);

  const [isEmpty, setIsEmpty] = useState<boolean>(true);

  const inputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setFiles([]);
    setMentions(() => {
      const list = conversation.members
        .filter((item) => item.contact.id !== info.id)
        .map((item) => ({
          name: item.contact.name!,
          avatar: item.contact.avatar ?? null,
          userId: item.contact.id!,
        }));

      return [
        {
          name: "All",
          avatar: null,
          userId: "all",
        },
        ...list,
      ];
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

  // const chooseMention = (id: string) => {
  //   const user = mentions.find((item) => item.userId === id);
  //   inputRef.current.innerText = inputRef.current.innerText + `[${user.name}]`;
  //   setCaretToEnd(true);
  //   setShowMention(false);
  //   setSelectedIndex(0);
  // };
  const chooseMention = (id: string) => {
    const user = mentions.find((item) => item.userId === id);
    if (!user || !inputRef.current) return;

    // 👉 QUAN TRỌNG: focus lại editor khi click (mất selection khi click ra ngoài)
    // inputRef.current.focus();

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);

    // lấy text trước cursor để tìm @ gần nhất
    const container = range.startContainer;
    const text = container.textContent ?? "";
    const before = text.substring(0, range.startOffset);
    const atIndex = before.lastIndexOf("@");

    if (atIndex === -1) return;

    // xoá đoạn "@abc" đang gõ
    range.setStart(container, atIndex);
    range.deleteContents();

    // 👇 hiển thị chỉ name, nhưng lưu raw ở data attribute
    const mentionNode = document.createElement("span");
    mentionNode.textContent = user.name; // chỉ hiển thị name
    mentionNode.setAttribute("data-mention", `@[${user.name}]`); // lưu format gửi đi
    mentionNode.contentEditable = "false";
    mentionNode.style.color = "#1d9bf0";
    mentionNode.style.fontWeight = "500";

    // insert vào vị trí cursor
    range.insertNode(mentionNode);

    // thêm space sau mention
    const space = document.createTextNode(" ");
    mentionNode.after(space);

    // đưa cursor ra sau
    range.setStartAfter(space);
    range.setEndAfter(space);
    selection.removeAllRanges();
    selection.addRange(range);

    setShowMention(false);
    setSelectedIndex(0);
  };

  // ✅ khi gửi message → convert lại đúng format @[name]
  const getMessageValue = () => {
    if (!inputRef.current) return "";

    const parseNodes = (nodes: NodeListOf<ChildNode>): string => {
      let result = "";

      nodes.forEach((node: any) => {
        if (node.nodeType === Node.TEXT_NODE) {
          result += node.textContent;
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          const el = node as HTMLElement;

          // 👇 handle mention
          const mention = el.getAttribute?.("data-mention");
          if (mention) {
            result += mention;
            return;
          }

          // 👇 handle xuống dòng (div, p, br)
          if (el.tagName === "BR") {
            result += "\n";
            return;
          }

          if (el.tagName === "DIV" || el.tagName === "P") {
            result += parseNodes(el.childNodes) + "\n";
            return;
          }

          result += parseNodes(el.childNodes);
        }
      });

      return result;
    };

    return parseNodes(inputRef.current.childNodes);
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
                hasAttachment: hasMedia,
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
      if (reply)
        bodyToCreate = {
          ...bodyToCreate,
          ...reply,
        };

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
                  ...reply,
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
                  ...reply,
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

      queryClient.setQueryData(["reply"], null);

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
    let content = getMessageValue();
    if (content === "" && files.length === 0) return;

    // console.log(content);

    const lazyImages = files.map((item) => {
      return {
        type: "image",
        mediaUrl: URL.createObjectURL(item),
        pending: true,
        local: true,
      } as AttachmentModel;
    });
    sendMutation({
      type: content === "" ? "media" : "text",
      content: content,
      attachments: lazyImages,
      files: files,
    });

    inputRef.current.innerText = "";
    setFiles([]);
  };

  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  const getCharBeforeCursor = () => {
    const input = inputRef.current;
    if (!input) return null;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return null;

    const range = selection.getRangeAt(0);
    const clonedRange = range.cloneRange();
    clonedRange.selectNodeContents(input);
    clonedRange.setEnd(range.endContainer, range.endOffset);

    const cursorPosition = clonedRange.toString().length;
    const textBeforeCursor = input.innerText.substring(0, cursorPosition);
    return textBeforeCursor[textBeforeCursor.length - 1] || null;
  };

  const keydownBindingFn = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const key = e.key;

      // Di chuyển lên xuống trong danh sách mention khi đang hiển thị
      if (key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % mentions.length);
      } else if (key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex(
          (prev) => (prev - 1 + mentions.length) % mentions.length,
        );
      }
      // Nhấn Enter khi đang hiển thị mention -> chọn mention
      if (key === "Enter" && showMention) {
        e.preventDefault();
        chooseMention(mentions[selectedIndex].userId);
      }

      // Enter mà không giữ Shift -> gửi tin nhắn
      else if (key === "Enter" && !e.shiftKey) {
        e.preventDefault(); // Ngăn xuống dòng
        chat();
      }

      // Nếu nội dung đang rỗng và người dùng gõ phím không phải là Backspace
      if (isEmpty && key !== "Backspace") {
        setIsEmpty(false);
      }
      // Nếu người dùng gõ Backspace và trước đó là ký tự @ thì ẩn mention đi
      if (key === "Backspace") {
        if (getCharBeforeCursor() === "@") {
          setShowMention(false);
        }
      }
      // Nhấn @ để hiển thị Mention
      // nếu ký tự trước là @ thì không hiện ký tự @ nữa mà hiện menu mention luôn
      if (key === "@") {
        const input = inputRef.current;
        if (!input) return;

        if (getCharBeforeCursor() === "@") {
          e.preventDefault(); // Ngăn chặn ký tự "@" được thêm vào
          setShowMention(true);
          return; // ⛔ chặn không cho thêm "@"
        }

        setShowMention(true);
      }
      // Nhấn Ésc -> ẩn Mention
      if (key === "Escape") {
        setShowMention(false);
      }
      // Nhấn Space khi đang hiện mention -> ẩn mention
      if (key === " " && showMention) {
        // e.preventDefault();
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
        // Nhấn Ctrl + Space, tìm ký tự @ gần nhất trước con trỏ, nếu từ đó đến vị trí con trỏ không có space nào khác thì hiện mention
        if (e.ctrlKey && e.key === " ") {
          e.preventDefault();

          const input = inputRef.current;
          if (!input) return;

          const selection = window.getSelection();
          if (!selection || selection.rangeCount === 0) return;

          const range = selection.getRangeAt(0);
          const clonedRange = range.cloneRange();
          clonedRange.selectNodeContents(input);
          clonedRange.setEnd(range.endContainer, range.endOffset);

          const cursorPosition = clonedRange.toString().length;
          const textBeforeCursor = input.innerText.substring(0, cursorPosition);

          const atIndex = textBeforeCursor.lastIndexOf("@");

          if (atIndex !== -1) {
            const textFromAtToCursor = textBeforeCursor.substring(atIndex + 1);

            // 👉 nếu không có space giữa @ và cursor thì show mention
            if (!/\s/.test(textFromAtToCursor)) {
              setShowMention(true);
            }
          }
        }
        // Tìm kiếm mention theo tên khi showMention đang bật
        else {
          if (showMention) {
            // Khi mention đang hiện thị và người dùng gõ thêm ký tự, ta sẽ tìm kiếm trong danh sách mention
            // lưu ý loại bỏ ký tự @ ở đầu nếu có
            // if (charBeforeCursor === "@") {
            const input = inputRef.current;
            if (!input) return;

            const selection = window.getSelection();
            if (!selection || selection.rangeCount === 0) return;

            const range = selection.getRangeAt(0);
            const clonedRange = range.cloneRange();
            clonedRange.selectNodeContents(input);
            clonedRange.setEnd(range.endContainer, range.endOffset);

            const cursorPosition = clonedRange.toString().length;
            const fullText = input.innerText;

            // 👉 tìm @ gần nhất trước cursor
            const beforeCursor = fullText.substring(0, cursorPosition);
            const atIndex = beforeCursor.lastIndexOf("@");

            if (atIndex !== -1) {
              // 👉 lấy từ @ đến space đầu tiên SAU @ (không phụ thuộc cursor)
              const afterAt = fullText.substring(atIndex + 1);
              const spaceIndex = afterAt.search(/\s/);

              const searchText =
                spaceIndex === -1
                  ? afterAt // không có space → lấy hết
                  : afterAt.substring(0, spaceIndex);

              console.log("text to search:", searchText);

              if (searchText !== "") {
                setMentions(() => {
                  const list = conversation.members
                    .filter((item) => item.contact.id !== info.id)
                    .map((item) => ({
                      name: item.contact.name!,
                      avatar: item.contact.avatar ?? null,
                      userId: item.contact.id!,
                    }));
                  const listToSearch = [
                    {
                      name: "All",
                      avatar: null,
                      userId: "all",
                    },
                    ...list,
                  ];
                  return listToSearch.filter((item) =>
                    item.name.toLowerCase().includes(searchText.toLowerCase()),
                  );
                });
              } else {
                setMentions(() => {
                  const list = conversation.members
                    .filter((item) => item.contact.id !== info.id)
                    .map((item) => ({
                      name: item.contact.name!,
                      avatar: item.contact.avatar ?? null,
                      userId: item.contact.id!,
                    }));

                  return [
                    {
                      name: "All",
                      avatar: null,
                      userId: "all",
                    },
                    ...list,
                  ];
                });
              }
            }
          }
        }
      }
    },
    [isEmpty, setIsEmpty, showMention, setShowMention],
  );

  const refMentionContainer = useRef<HTMLDivElement | null>(null);
  const mentionRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const ensureItemVisible = (id: number) => {
    const container = refMentionContainer.current;
    const item = mentionRefs.current[id];

    if (!container || !item) return;

    const itemTop = item.offsetTop;
    const itemBottom = itemTop + item.clientHeight;

    const viewTop = container.scrollTop;
    const viewBottom = viewTop + container.clientHeight;

    // Item nằm phía trên viewport
    if (itemTop < viewTop) {
      container.scrollTo({
        top: itemTop,
        behavior: "smooth",
      });
    }

    // Item nằm phía dưới viewport
    else if (itemBottom > viewBottom) {
      container.scrollTo({
        top: itemBottom - container.clientHeight,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    ensureItemVisible(selectedIndex);
  }, [selectedIndex]);

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

  return (
    <div className={`mb-2 flex w-full items-center justify-center`}>
      <div
        className={`${className} chat-input-container relative flex w-full grow flex-col bg-white
        transition-all duration-200
        ${
          isPhoneScreen()
            ? "max-w-140"
            : !toggle || toggle === "" || toggle === "null"
              ? "laptop-lg:max-w-240 laptop:max-w-240"
              : "laptop-lg:max-w-180 laptop:max-w-180"
        }  
        `}
      >
        {/* MARK: REPLY MESSAGE */}
        {reply && (
          <div className="flex w-full items-center justify-center py-4">
            <div className="flex w-[95%] items-center justify-between rounded-xl border-l-[.3rem] border-l-light-blue-500/50 bg-light-blue-100 px-4 py-2">
              <div className="max-w-[80%]">
                <p className="truncate italic text-light-blue-500">
                  Reply to {reply.replyContactName}
                </p>
                <p className="truncate ">{reply.replyContent}</p>
              </div>
              <CloseOutlined
                className="flex cursor-pointer items-start"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent bubbling to parent
                  queryClient.setQueryData(["reply"], null);
                }}
              />
            </div>
          </div>
        )}
        {/* MARK: FILES */}
        {files?.length !== 0 ? (
          <div className="flex gap-4 overflow-x-auto rounded-2xl px-6 py-3">
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
              ref={refMentionContainer}
              data-show={showMention}
              className="z-2 laptop:max-h-60 laptop:w-60 absolute bottom-24 left-0
          flex flex-col gap-2 overflow-y-scroll scroll-smooth rounded-[.7rem] bg-white p-2
          shadow-[0_2px_10px_rgba(0,0,0,0.1)] transition-all duration-200 
          data-[show=false]:pointer-events-none data-[show=true]:pointer-events-auto data-[show=false]:opacity-0 data-[show=true]:opacity-100"
            >
              {mentions.length === 0 ? (
                <p className="text-center text-sm text-gray-500">
                  No members found
                </p>
              ) : (
                mentions?.map((item, index) => (
                  <div
                    key={item.userId}
                    ref={(el) => (mentionRefs.current[index] = el)}
                    className={`mention-user flex cursor-pointer gap-4 rounded-[.7rem] px-3 py-1 ${index === selectedIndex ? "active" : ""}`}
                    // onClick={() => chooseMention(item.userId)}
                    onMouseDown={(e) => {
                      e.preventDefault(); // giữ selection
                      chooseMention(item.userId);
                    }}
                  >
                    <ImageWithLightBoxAndNoLazy
                      src={item.avatar}
                      slides={[
                        {
                          src: item.avatar,
                        },
                      ]}
                      className="aspect-square h-8 cursor-pointer"
                      circle
                    />
                    <p>{item.name}</p>
                  </div>
                ))
              )}
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
              <button className="send-btn laptop:w-9 flex aspect-square cursor-pointer items-center justify-center rounded-full bg-light-blue-400 text-white">
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
