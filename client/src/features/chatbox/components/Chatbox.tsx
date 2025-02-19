import { useQueryClient } from "@tanstack/react-query";
import { debounce } from "lodash";
import React, { useCallback, useEffect, useRef, useState } from "react";
import RelightBackground from "../../../components/RelightBackground";
import useEventListener from "../../../hooks/useEventListener";
import useConversation from "../../listchat/hooks/useConversation";
import { MessageCache } from "../../listchat/types";
import useMessage from "../hooks/useMessage";
import getMessages from "../services/getMessages";
import MessageContent from "./MessageContent";
const Chatbox = () => {
  // console.log("Chatbox calling");
  // const { isToggle } = props;

  const queryClient = useQueryClient();

  const refPage = useRef<number>(1);

  // const { data: info } = useInfo();
  const { data: conversations } = useConversation();
  const { data: messages } = useMessage(
    conversations?.selected?.id,
    refPage.current,
  );

  // console.log(messages);

  const refChatContent = useRef<HTMLDivElement>();
  // const refChatboxContainer = useRef();
  // const refInput = useRef();

  // const [fetching, setFetching] = useState(false);
  const [autoScrollBottom, setAutoScrollBottom] = useState(true);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);

  const scrollChatContentToBottom = () => {
    refChatContent.current.scrollTop = refChatContent.current.scrollHeight;
    // refChatContent.current.scrollTop = 0;
  };

  // const {
  //   mutate: sendMutation,
  //   isPending,
  //   // variables,
  // } = useMutation({
  //   mutationFn: async (param) => {
  //     let randomId = Math.random().toString(36).substring(2, 7);

  //     queryClient.setQueryData(["conversation"], (oldData) => {
  //       const clonedConversations = oldData.conversations.map((item) => {
  //         return Object.assign({}, item);
  //       });
  //       const updatedConversations = clonedConversations.map((conversation) => {
  //         if (conversation.id !== conversations?.selected.id)
  //           return conversation;
  //         conversation.lastMessage =
  //           param.type === "text"
  //             ? param.content
  //             : param.files.map((item) => item.name).join(",");
  //         return conversation;
  //       });
  //       return {
  //         ...oldData,
  //         conversations: updatedConversations,
  //         filterConversations: updatedConversations,
  //       };
  //     });

  //     queryClient.setQueryData(["message"], (oldData) => {
  //       return {
  //         ...oldData,
  //         messages: [
  //           ...(oldData.messages || []),
  //           {
  //             id: randomId,
  //             type: param.type,
  //             content: param.content,
  //             contactId: info.id,
  //             attachments: param.attachments,
  //             currentReaction: null,
  //             noLazy: true,
  //             pending: true,
  //           },
  //         ],
  //         newMessage: true,
  //       };
  //     });

  //     let bodyToCreate = {
  //       type: param.type,
  //       content: param.content,
  //     };
  //     let bodyLocal = Object.assign({}, bodyToCreate);

  //     if (param.files.length !== 0) {
  //       const uploaded = await uploadFile(param.files).then((uploads) => {
  //         return uploads.map((item) => ({
  //           type: item.type,
  //           mediaUrl: item.url,
  //           mediaName: item.name,
  //           mediaSize: item.size,
  //         }));
  //       });
  //       bodyToCreate = {
  //         ...bodyToCreate,
  //         attachments: uploaded,
  //       };
  //       bodyLocal = {
  //         ...bodyLocal,
  //         attachments: param.attachments,
  //       };
  //     }

  //     var id = await sendMessage(conversations?.selected.id, bodyToCreate);
  //     // await delay(3000);

  //     queryClient.setQueryData(["message"], (oldData) => {
  //       const updatedMessages = oldData.messages.map((message) => {
  //         if (message.id !== randomId) return message;
  //         message.id = id;
  //         message.loaded = true;
  //         message.pending = false;
  //         return message;
  //       });
  //       return {
  //         ...oldData,
  //         messages: updatedMessages,
  //       };
  //     });

  //     if (param.files.length !== 0) {
  //       queryClient.setQueryData(["attachment"], (oldData) => {
  //         const cloned = oldData.map((item) => {
  //           return Object.assign({}, item);
  //         });
  //         // Chỉ cần lấy item đầu tiên vì là thời gian gần nhất
  //         var firstItem = cloned[0];
  //         // Nếu undefined tức là chưa có attachment nào
  //         // hoặc nếu ngày gần nhất không phải hôm nay
  //         // -> tạo object mới
  //         if (!firstItem || firstItem.date !== moment().format("MM/DD/YYYY")) {
  //           cloned.unshift({
  //             date: moment().format("MM/DD/YYYY"),
  //             attachments: param.attachments,
  //           });
  //           return cloned;
  //         }
  //         // Ngược lại thì ngày gần nhất là hôm nay
  //         else {
  //           const newData = cloned.map((item) => {
  //             if (item.date === moment().format("MM/DD/YYYY")) {
  //               return {
  //                 ...item,
  //                 attachments: [...param.attachments, ...item.attachments],
  //               };
  //             }
  //             return item;
  //           });
  //           return newData;
  //         }
  //       });
  //     }
  //   },
  // });

  // const uploadFile = async (files) => {
  //   // Create a root reference
  //   const storage = getStorage();
  //   return Promise.all(
  //     files.map((item) => {
  //       if (
  //         ["doc", "docx", "xls", "xlsx", "pdf"].includes(
  //           item.name.split(".")[1],
  //         )
  //       ) {
  //         return uploadBytes(ref(storage, `file/${item.name}`), item).then(
  //           (snapshot) => {
  //             return getDownloadURL(snapshot.ref).then((url) => {
  //               return {
  //                 type: "file",
  //                 url: url,
  //                 name: item.name,
  //                 size: item.size,
  //               };
  //             });
  //           },
  //         );
  //       }
  //       return uploadBytes(ref(storage, `img/${item.name}`), item).then(
  //         (snapshot) => {
  //           return getDownloadURL(snapshot.ref).then((url) => {
  //             return {
  //               type: "image",
  //               url: url,
  //               name: item.name,
  //               size: item.size,
  //             };
  //           });
  //         },
  //       );
  //     }),
  //   );
  // };

  useEffect(() => {
    // blurImage(".chatbox-content");
    scrollChatContentToBottom();
  }, [messages]);

  useEffect(() => {
    refChatContent.current.style.scrollBehavior = "auto";
    if (autoScrollBottom) {
      scrollChatContentToBottom();
      setTimeout(() => {
        refChatContent.current.style.scrollBehavior = "smooth";
      }, 0);
    }
  }, [autoScrollBottom]);

  useEffect(() => {
    refPage.current = 1;
    setAutoScrollBottom(true);
    // setTimeout(() => {
    //   refInput.current.focus();
    // }, 100);
  }, [conversations?.selected]);

  // const sendMedia = async () => {
  //   const uploaded = await uploadFile().then((uploads) => {
  //     return uploads.map((item) => ({
  //       type: item.type,
  //       mediaUrl: item.url,
  //       mediaName: item.name,
  //       mediaSize: item.size,
  //     }));
  //   });

  //   const lazyImages = files.map((item) => {
  //     // console.log(URL.createObjectURL(item));
  //     return {
  //       type: "image",
  //       mediaUrl: URL.createObjectURL(item),
  //     };
  //   });
  //   setFiles([]);
  //   sendMutation({ type: "media", attachments: lazyImages });
  // };

  // Event listener
  // const closeProfile = useCallback((e) => {
  //   if (e.target.closest(".profile-container")) setOpen(false);
  // }, []);
  // useEventListener("click", closeProfile);

  const fetchMoreMessage = async (conversationId: string, hasMore: boolean) => {
    if (!hasMore) return;

    const currentScrollHeight = refChatContent.current.scrollHeight;
    // setFetching(true);

    const newMessages = await getMessages(conversationId, refPage.current);

    queryClient.setQueryData(["message"], (oldData: MessageCache) => {
      return {
        ...oldData,
        messages: [...newMessages.messages, ...oldData.messages],
        hasMore: newMessages.hasMore,
      };
    });

    requestAnimationFrame(() => {
      refChatContent.current.style.scrollBehavior = "auto";
      refChatContent.current.scrollTop =
        refChatContent.current.scrollHeight - currentScrollHeight;
      refChatContent.current.style.scrollBehavior = "smooth";
    });
  };

  // const debounceFetch = useMemo(
  //   () =>
  //     debounce(
  //       () => fetchMoreMessage(conversations?.selected.id, messages.hasMore),
  //       100,
  //     ),
  //   [conversations?.selected.id, messages.hasMore],
  // );

  const debounceFetch = useCallback(debounce(fetchMoreMessage, 100), []);

  const handleScroll = useCallback(() => {
    // Nếu cuộn lên 1 khoảng lớn hơn kích thước ô chat thì hiện nút scroll to bottom
    const distanceFromBottom =
      refChatContent.current.scrollHeight -
      (refChatContent.current.scrollTop + refChatContent.current.clientHeight);
    if (
      refChatContent.current.clientHeight !== 0 &&
      distanceFromBottom >= refChatContent.current.clientHeight
    )
      setShowScrollToBottom(true);
    else setShowScrollToBottom(false);

    // Nếu cuộn lên top và còn dữ liệu cũ -> lấy thêm dữ liệu
    if (refChatContent.current.scrollTop === 0) {
      setAutoScrollBottom(false);
      refPage.current = refPage.current + 1;
      debounceFetch(conversations?.selected.id, messages.hasMore);
    }
  }, [conversations?.selected.id, messages]);
  useEventListener("scroll", handleScroll, refChatContent.current);

  return (
    <div className="chatbox-content relative flex h-full max-h-[92%] w-full flex-col justify-end overflow-hidden">
      <RelightBackground
        data-show={showScrollToBottom}
        onClick={scrollChatContentToBottom}
        className={`absolute bottom-[5%] right-[50%] z-20
            data-[show=false]:pointer-events-none data-[show=true]:pointer-events-auto 
            data-[show=false]:opacity-0 data-[show=true]:opacity-100`}
      >
        <div className="fa fa-chevron-down base-icon"></div>
      </RelightBackground>
      <div
        ref={refChatContent}
        className="hide-scrollbar flex grow flex-col gap-[2rem] overflow-y-scroll bg-[var(--bg-color-extrathin)] px-[1rem] pb-[2rem]"
      >
        {messages?.messages
          ? [...messages?.messages]
              // .reverse()
              .map((message, index) => (
                <MessageContent
                  message={message}
                  id={conversations.selected.id}
                  mt={index === 0}
                />
              ))
          : ""}
      </div>
    </div>
  );
};

export default Chatbox;
