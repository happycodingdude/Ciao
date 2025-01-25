import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import moment from "moment";
import React, { useRef } from "react";
import useInfo from "../../authentication/hooks/useInfo";
import useConversation from "../../listchat/hooks/useConversation";
import sendMessage from "../services/sendMessage";
import ListMessage from "./ListMessage";

const Chatbox = (props) => {
  console.log("Chatbox calling");
  const { isToggle } = props;

  const queryClient = useQueryClient();

  // const [page, setPage] = useState(2);

  const { data: info } = useInfo();
  const { data: conversations } = useConversation();
  // const { data: messages } = useMessage(conversations?.selected?.id, page);

  // const refChatContent = useRef();
  const refChatboxContainer = useRef();
  const refInput = useRef();

  // const [fetching, setFetching] = useState(false);
  // const [autoScrollBottom, setAutoScrollBottom] = useState(true);
  // const [showScrollToBottom, setShowScrollToBottom] = useState(false);

  // useEffect(() => {
  //   blurImage(".chatbox-content");
  //   scrollChatContentToBottom();
  // }, [messages]);

  // useEffect(() => {
  //   refChatContent.current.classList.remove("scroll-smooth");
  //   if (autoScrollBottom) {
  //     scrollChatContentToBottom();
  //     setTimeout(() => {
  //       refChatContent.current.classList.add("scroll-smooth");
  //     }, 500);
  //   }
  // }, [autoScrollBottom]);

  // useEffect(() => {
  //   // setPage(2);
  //   // setAutoScrollBottom(true);
  //   setTimeout(() => {
  //     refInput.current.focus();
  //   }, 100);
  // }, [conversations?.selected]);

  // const chooseFile = (e) => {
  //   const chosenFiles = Array.from(e.target.files);
  //   if (chosenFiles.length === 0) return;

  //   const mergedFiles = chosenFiles.filter((item) => {
  //     if (!files.some((file) => file.name === item.name)) return item;
  //   });
  //   setFiles([...files, ...mergedFiles]);

  //   e.target.value = null;
  // };

  // const removeFile = (e) => {
  //   setFiles(files.filter((item) => item.name !== e.target.dataset.key));
  // };

  const delay = (delay) => {
    return new Promise((resolve) => setTimeout(resolve, delay));
  };

  const {
    mutate: sendMutation,
    // isPending,
    // variables,
  } = useMutation({
    mutationFn: async (param) => {
      let randomId = Math.random().toString(36).substring(2, 7);

      queryClient.setQueryData(["conversation"], (oldData) => {
        const clonedConversations = oldData.conversations.map((item) => {
          return Object.assign({}, item);
        });
        const updatedConversations = clonedConversations.map((conversation) => {
          if (conversation.id !== conversations?.selected.id)
            return conversation;
          conversation.lastMessage =
            param.type === "text"
              ? param.content
              : param.files.map((item) => item.name).join(",");
          return conversation;
        });
        return {
          ...oldData,
          conversations: updatedConversations,
          filterConversations: updatedConversations,
        };
      });

      queryClient.setQueryData(
        ["message", conversations?.selected.id],
        (oldData) => {
          return {
            ...oldData,
            messages: [
              ...(oldData.messages || []),
              {
                id: randomId,
                type: param.type,
                content: param.content,
                contactId: info.id,
                attachments: param.attachments,
                currentReaction: null,
                noLazy: true,
                pending: true,
              },
            ],
            newMessage: true,
          };
        },
      );

      let bodyToCreate = {
        moderator: conversations?.selected.participants.find(
          (q) => q.isModerator === true,
        ).contact.id,
        type: param.type,
        content: param.content,
      };
      let bodyLocal = Object.assign({}, bodyToCreate);

      if (param.files.length !== 0) {
        const uploaded = await uploadFile(param.files).then((uploads) => {
          return uploads.map((item) => ({
            type: item.type,
            mediaUrl: item.url,
            mediaName: item.name,
            mediaSize: item.size,
          }));
        });
        bodyToCreate = {
          ...bodyToCreate,
          attachments: uploaded,
        };
        bodyLocal = {
          ...bodyLocal,
          attachments: param.attachments,
        };
      }

      var id = await sendMessage(conversations?.selected.id, bodyToCreate);
      // await delay(3000);

      queryClient.setQueryData(
        ["message", conversations?.selected.id],
        (oldData) => {
          const updatedMessages = oldData.messages.map((message) => {
            if (message.id !== randomId) return message;
            message.id = id;
            message.loaded = true;
            message.pending = false;
            return message;
          });
          return {
            ...oldData,
            messages: updatedMessages,
          };
        },
      );

      if (param.files.length !== 0) {
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

  const uploadFile = async (files) => {
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

  // useEffect(() => {
  //   scrollChatContentToBottom();
  // }, [isPending]);

  // const scrollChatContentToBottom = () => {
  //   // refChatContent.current.scrollTop = refChatContent.current.scrollHeight;
  //   // refChatContent.current.scrollTop = 0;
  // };

  // Event listener
  // const closeProfile = useCallback((e) => {
  //   if (e.target.closest(".profile-container")) setOpen(false);
  // }, []);
  // useEventListener("click", closeProfile);

  // const fetchMoreMessage = (conversationId, page, currentScrollHeight) => {
  //   setFetching(true);
  //   HttpRequest({
  //     method: "get",
  //     url: import.meta.env.VITE_ENDPOINT_MESSAGE_GETWITHPAGING.replace(
  //       "{id}",
  //       conversationId,
  //     ).replace("{page}", page),
  //   }).then((data) => {
  //     queryClient.setQueryData(["message"], (oldData) => {
  //       const cloned = Object.assign({}, oldData);
  //       cloned.messages = [...cloned.messages, ...data.data.messages];
  //       cloned.nextExist = data.data.nextExist;
  //       return cloned;
  //     });
  //     setPage((current) => current + 1);
  //     setFetching(false);
  //     requestAnimationFrame(() => {
  //       refChatContent.current.style.scrollBehavior = "auto";
  //       refChatContent.current.scrollTop =
  //         refChatContent.current.scrollHeight - currentScrollHeight;
  //       refChatContent.current.style.scrollBehavior = "smooth";
  //     });
  //   });
  // };

  // const debounceFetch = useCallback(debounce(fetchMoreMessage, 100), []);

  // const handleScroll = useCallback(async () => {
  //   // Nếu scroll 1 khoảng lớn hơn kích thước ô chat thì hiện nút scroll to bottom
  //   const distanceFromBottom =
  //     refChatContent.current.scrollHeight -
  //     (refChatContent.current.scrollTop + refChatContent.current.clientHeight);
  //   if (
  //     refChatContent.current.clientHeight !== 0 &&
  //     distanceFromBottom >= refChatContent.current.clientHeight
  //   )
  //     setShowScrollToBottom(true);
  //   else setShowScrollToBottom(false);

  //   if (refChatContent.current.scrollTop === 0 && messages.nextExist) {
  //     setAutoScrollBottom(false);
  //     const currentScrollHeight = refChatContent.current.scrollHeight;
  //     debounceFetch(conversations?.selected.id, page, currentScrollHeight);
  //   }
  //   // }, [conversations?.selected, messages, page]);
  // }, [conversations?.selected, page]);
  // useEventListener("scroll", handleScroll);

  return (
    <div
      ref={refChatboxContainer}
      className={`relative flex w-full grow flex-col items-center border-r-[.1rem] border-r-[var(--border-color)]
        ${isToggle ? "" : "shrink-0"}`}
    >
      {/* {fetching ? <FetchingMoreMessages loading /> : ""} */}
      {/* <RelightBackground
          data-show={showScrollToBottom}
          onClick={scrollChatContentToBottom}
          className={`absolute bottom-[5%] right-[50%] z-20
            data-[show=false]:pointer-events-none data-[show=true]:pointer-events-auto 
            data-[show=false]:opacity-0 data-[show=true]:opacity-100`}
        >
          <div className="fa fa-chevron-down base-icon"></div>
        </RelightBackground> */}
      <ListMessage
        conversationId={conversations?.selected?.id}
        send={sendMutation}
      />
      {/* <div
          ref={refChatContent}
          className="hide-scrollbar flex grow flex-col gap-[2rem] overflow-y-scroll bg-[var(--bg-color-extrathin)] px-[1rem] pb-[2rem]"
        >
          {messages?.messages
            ? [...messages?.messages]
                .reverse()
                .map((message, index) => (
                  <MessageContent
                    message={message}
                    id={conversations.selected.id}
                    mt={index === 0}
                  />
                ))
            : ""}
        </div> */}
      {/* <ChatInput
        className="chatbox"
        send={(text, files) => {
          if (text.trim() === "" && files.length === 0) return;

          const lazyImages = files.map((item) => {
            return {
              type: "image",
              mediaUrl: URL.createObjectURL(item),
            };
          });
          // setFiles([]);
          sendMutation({
            type: text.trim() === "" ? "media" : "text",
            content: text,
            attachments: lazyImages,
            files: files,
          });
        }}
        ref={refInput}
      /> */}
    </div>
  );
};

export default Chatbox;
