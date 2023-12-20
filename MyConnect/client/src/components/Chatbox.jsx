// import { wrapGrid } from "animate-css-grid";
import axios from "axios";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import moment from "moment";
import React, { useCallback, useEffect, useRef, useState } from "react";
import useAuth from "../hook/useAuth";
import CustomModal from "./CustomModal";

const Chatbox = ({ reference }) => {
  console.log("Chatbox calling");
  const auth = useAuth();

  const refChatInput = useRef();
  const refChatContent = useRef();
  const refScrollButton = useRef();
  const refChatboxOption = useRef();
  const refChatboxOptionMenu = useRef();
  const refToggleInformationContainer = useRef();

  const [files, setFiles] = useState([]);
  const [participants, setParticipants] = useState();
  const [messages, setMessages] = useState();
  useEffect(() => {
    if (!reference.conversation) return;

    setFiles([]);

    const cancelToken = axios.CancelToken.source();
    const headers = {
      "Content-Type": "application/json",
      Authorization: "Bearer " + auth.token,
    };
    axios
      .get(`api/conversations/${reference.conversation?.Id}/participants`, {
        cancelToken: cancelToken.token,
        headers: headers,
      })
      .then((res) => {
        if (res.status !== 200) throw new Error(res.status);
        setParticipants(res.data.data);
      })
      .catch((err) => {
        console.log(err);
      });
    axios
      .get(`api/conversations/${reference.conversation?.Id}/messages`, {
        cancelToken: cancelToken.token,
        headers: headers,
      })
      .then((res) => {
        if (res.status !== 200) throw new Error(res.status);
        refChatContent.current.classList.remove("scroll-smooth");
        refChatContent.current.scrollTop = 0;
        setMessages(res.data.data);
      })
      .catch((err) => {
        console.log(err);
      });

    return () => {
      cancelToken.cancel();
    };
  }, [reference.conversation]);

  useEffect(() => {
    if (navigator.serviceWorker) {
      navigator.serviceWorker
        .register("/firebase-messaging-sw.js")
        .then(navigator.serviceWorker.ready)
        .then(() => {
          navigator.serviceWorker.onmessage = (event) => {
            // event is a MessageEvent object
            console.log(
              `The service worker sent me a message: ${event.data.data}`,
            );

            // user config unnotified
            if (localStorage.getItem("notification") === "false") return;

            // add new message to current list
            var newArr = messages?.map((item) => {
              if (
                item.Messages.some(
                  (message) => message.Id === event.data.data.Id,
                )
              )
                return item;
              if (
                item.Date !==
                moment(event.data.data.CreatedTime).format("MM/DD/YYYY")
              )
                return item;

              item.Messages = [...item.Messages, event.data.data];
              return item;
            });
            setMessages(newArr);

            setTimeout(() => {
              refChatContent.current.scrollTop =
                refChatContent.current.scrollHeight;
            }, 200);
          };
        });

      // navigator.serviceWorker.addEventListener("message", (event) => {
      //   // event is a MessageEvent object
      //   console.log(`The service worker sent me a message: ${event.data}`);
      // });
    }

    refChatContent.current.classList.add("scroll-smooth");
    // refChatContent.current.scrollTop = refChatContent.current.scrollHeight;
    setTimeout(() => {
      refChatContent.current.scrollTop = refChatContent.current.scrollHeight;
    }, 500);

    // setTimeout(() => {
    //   const grids = Array.from(document.querySelectorAll(".grid-chat"));
    //   grids.map((grid) => {
    //     wrapGrid(grid, { duration: 400, easing: "easeOut" });
    //   });
    // }, 500);
  }, [messages]);

  const scrollChatContentToBottom = () => {
    refChatContent.current.scrollTop = refChatContent.current.scrollHeight;
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

  const sendMessage = async () => {
    const cancelToken = axios.CancelToken.source();
    const headers = {
      "Content-Type": "application/json",
      Authorization: "Bearer " + auth.token,
    };
    var body = {
      ContactId: auth.id,
      ConversationId: reference.conversation.Id,
    };
    if (files.length === 0) {
      body = {
        ...body,
        Type: "text",
        Content: refChatInput.current.value,
      };
    } else {
      body = {
        ...body,
        Type: "media",
        Attachments: await uploadFile().then((uploads) => {
          return uploads.map((item) => ({
            Type: item.type,
            MediaUrl: item.url,
            MediaName: item.name,
            MediaSize: item.size,
          }));
        }),
      };
    }
    axios
      .post(`api/messages/send`, body, {
        cancelToken: cancelToken.token,
        headers: headers,
      })
      .then((res) => {
        if (res.status !== 200) throw new Error(res.status);
        if (refChatInput.current !== null) refChatInput.current.value = "";
        setFiles([]);

        // add new message to current list
        if (messages.length === 0) {
          var firstMessage = [
            {
              Date: moment().format("MM/DD/YYYY"),
              Messages: [res.data.data],
            },
          ];
          setMessages(firstMessage);
        } else {
          var newArr = messages.map((item) => {
            if (
              item.Date ===
              moment(res.data.data.CreatedTime).format("MM/DD/YYYY")
            ) {
              item.Messages = [...item.Messages, res.data.data];
              return item;
            }
            return item;
          });
          setMessages(newArr);
        }

        setTimeout(() => {
          refChatContent.current.scrollTop =
            refChatContent.current.scrollHeight;
        }, 500);
      })
      .catch((err) => {
        console.log(err);
      });

    return () => {
      cancelToken.cancel();
    };
  };

  const handlePressKey = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  // The scroll listener
  const handleScroll = useCallback(() => {
    if (
      refChatContent.current.scrollHeight - refChatContent.current.scrollTop >
      500
    )
      refScrollButton.current.classList.remove("hidden");
    else refScrollButton.current.classList.add("hidden");
  }, []);

  const toggleChatboxOption = useCallback((event) => {
    // click anywhere on screen except the option toggle
    if (!refChatboxOption.current?.contains(event.target)) {
      refChatboxOptionMenu.current.classList.remove("scale-y-100");
    } else if (refChatboxOptionMenu.current.classList.contains("scale-y-100"))
      refChatboxOptionMenu.current.classList.remove("scale-y-100");
    else refChatboxOptionMenu.current.classList.add("scale-y-100");
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("click", toggleChatboxOption, true);
    return () => {
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("click", toggleChatboxOption, true);
    };
  }, [handleScroll, toggleChatboxOption]);

  const updateTitle = () => {
    var title = prompt("New title", reference.conversation.Title);
    if (title === null || title === "") return;
    reference.conversation.Title = title;

    const cancelToken = axios.CancelToken.source();
    const headers = {
      "Content-Type": "application/json",
      Authorization: "Bearer " + auth.token,
    };
    axios
      .put("api/conversations", reference.conversation, {
        cancelToken: cancelToken.token,
        headers: headers,
      })
      .then((res) => {
        if (res.status !== 200) throw new Error(res.status);
        reference.setConversation({ ...reference.conversation });
      })
      .catch((err) => {
        console.log(err);
      });

    return () => {
      cancelToken.cancel();
    };
  };

  const toggleInformationContainer = () => {
    reference.toggleInformationContainer();

    refToggleInformationContainer.current.classList.add("animate-spin");
    setTimeout(() => {
      refToggleInformationContainer.current.classList.remove("animate-spin");
      refToggleInformationContainer.current.classList.toggle("fa-arrow-left");
      refToggleInformationContainer.current.classList.toggle("fa-arrow-right");
      refChatContent.current.scrollTop = refChatContent.current.scrollHeight;
    }, 500);

    // const grids = Array.from(document.querySelectorAll(".grid-chat"));
    // grids.map((grid) => {
    //   if (
    //     grid.classList.contains(
    //       "grid-cols-[repeat(auto-fill,minmax(20rem,1fr))]",
    //     )
    //   ) {
    //     grid.classList.remove(
    //       "grid-cols-[repeat(auto-fill,minmax(20rem,1fr))]",
    //     );
    //     grid.classList.add("grid-cols-[repeat(auto-fill,minmax(18rem,1fr))]");
    //   } else {
    //     grid.classList.add("grid-cols-[repeat(auto-fill,minmax(20rem,1fr))]");
    //     grid.classList.remove(
    //       "grid-cols-[repeat(auto-fill,minmax(18rem,1fr))]",
    //     );
    //   }
    // });
  };

  const chooseFile = (e) => {
    const chosenFiles = Array.from(e.target.files);
    if (chosenFiles.length === 0) return;

    const mergedFiles = chosenFiles.filter((item) => {
      if (!files.some((file) => file.name === item.name)) return item;
    });
    setFiles([...files, ...mergedFiles]);
    console.log(mergedFiles);

    e.target.value = null;
  };

  const removeFile = (e) => {
    setFiles(files.filter((item) => item.name !== e.target.dataset.key));
  };

  const imageOnError = (e) => {
    e.target.onerror = null;
    e.target.src = "../src/assets/imagenotfound.jpg";
  };

  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleAddParticipant = () => {
    setShow(true);
  };

  const addParticipant = () => {};

  return (
    <>
      <div className="z-10 flex w-[calc(100%/2)] grow flex-col items-center gap-[1rem]">
        <div className="relative flex w-full grow flex-col overflow-hidden rounded-[1rem] bg-white [&>*]:px-[2rem]">
          <div
            ref={refScrollButton}
            className="fa fa-arrow-down absolute bottom-[1rem] right-[1rem] flex aspect-square w-[3rem] cursor-pointer items-center justify-center
                      rounded-[50%] bg-gray-300 font-normal text-gray-500"
            onClick={scrollChatContentToBottom}
          ></div>
          <div className="flex items-center justify-between border-b-[.1rem] border-b-gray-300 py-[.5rem] laptop:max-h-[5.5rem]">
            <div className="relative flex h-full basis-[25%]  items-center">
              {participants?.map((item, i) =>
                i < 3 ? (
                  <div
                    style={{
                      "--image-url": `url('${
                        item.Contact.Avatar ?? "../src/assets/imagenotfound.jpg"
                      }'`,
                    }}
                    className={`absolute aspect-square h-[70%] rounded-[50%] border-[.2rem] border-white bg-[image:var(--image-url)] bg-[length:100%_100%] bg-center ${
                      i === 0 ? "left-0" : ""
                    } ${i === 1 ? "left-[2rem]" : ""} ${
                      i === 2 ? "left-[4rem]" : ""
                    }`}
                  ></div>
                ) : (
                  ""
                ),
              )}
              <div
                onClick={handleAddParticipant}
                className="fa fa-plus absolute left-[9rem] flex aspect-square h-[70%] cursor-pointer items-center justify-center rounded-[50%] border-[.2rem] border-dashed border-gray-500 text-[130%] font-normal text-gray-500"
              ></div>
            </div>
            <div className="grow text-center">
              <p className="font-bold text-gray-600">
                {reference.conversation?.Title}
              </p>
              {participants?.find((item) => item.ContactId !== auth.id)?.Contact
                .IsOnline ? (
                <p className="text-blue-500">Online</p>
              ) : (
                <p className="text-gray-400">
                  Last seen{" "}
                  {moment(
                    participants?.find((item) => item.ContactId !== auth.id)
                      ?.Contact.LastLogout,
                  ).format("DD/MM/YYYY") === moment().format("DD/MM/YYYY")
                    ? moment(
                        participants?.find((item) => item.ContactId !== auth.id)
                          ?.Contact.LastLogout,
                      ).fromNow()
                    : moment(
                        participants?.find((item) => item.ContactId !== auth.id)
                          ?.Contact.LastLogout,
                      ).format("DD/MM HH:mm")}
                </p>
              )}
            </div>
            <div className="flex justify-end gap-[1rem]">
              <div className="fa fa-search self-center font-normal text-gray-500"></div>
              <div
                ref={refChatboxOption}
                className="relative flex cursor-pointer items-center gap-[.3rem]"
              >
                <div className="aspect-square w-[.5rem] rounded-[50%] bg-gray-500"></div>
                <div className="aspect-square w-[.5rem] rounded-[50%] bg-gray-500"></div>
                <div className="aspect-square w-[.5rem] rounded-[50%] bg-gray-500"></div>
                <div
                  ref={refChatboxOptionMenu}
                  className="absolute right-0 top-[120%] flex w-[15rem] origin-top scale-y-0 flex-col rounded-2xl bg-gray-200 py-[1rem] duration-[.5s] [&>*]:text-gray-500"
                >
                  <span
                    className="pl-[1rem] hover:bg-gray-300"
                    onClick={updateTitle}
                  >
                    Update title
                  </span>
                </div>
              </div>
              <div
                ref={refToggleInformationContainer}
                onClick={toggleInformationContainer}
                className="fa fa-arrow-right flex aspect-square w-[3rem] cursor-pointer items-center justify-center rounded-[1rem] text-lg font-normal text-gray-500"
              ></div>
            </div>
          </div>
          <div
            ref={refChatContent}
            className="hide-scrollbar my-[2rem] flex w-full flex-col gap-[2rem] overflow-y-scroll scroll-smooth"
          >
            {messages?.map((date) => (
              <>
                <div
                  className="flex items-center text-center text-gray-400
                                  before:mr-[2rem] before:h-[.1rem] before:grow before:bg-gray-400
                                  after:ml-[2rem] after:h-[.1rem]  after:grow after:bg-gray-400"
                >
                  {moment(date.Date).format("DD/MM/YYYY")}
                </div>
                {date.Messages.map((message) => (
                  <div className="flex items-center gap-[2rem]">
                    <div
                      className="aspect-square self-start rounded-[50%] bg-orange-400 
                  laptop:w-[clamp(3.5rem,calc(100%/15),4.5rem)] 
                  desktop:w-[calc(100%/20)]"
                    ></div>
                    <div className="flex w-[90%] flex-col">
                      <div className="flex items-center gap-[1rem]">
                        <h1 className="font-semibold">
                          {message.ContactId === auth.id
                            ? "You"
                            : participants?.find(
                                (item) => item.ContactId === message.ContactId,
                              )?.Contact.Name}
                        </h1>
                        {participants?.find(
                          (item) => item.ContactId === message.ContactId,
                        )?.IsModerator ? (
                          <div className="rounded-[.8rem] bg-orange-400 px-[.5rem] py-[.1rem] text-[var(--text-morderator-color)]">
                            Moderator
                          </div>
                        ) : (
                          ""
                        )}
                        <p className="text-blue-400">
                          {moment(message.CreatedTime).format("HH:mm")}
                        </p>
                        <img
                          src="../src/img/double-check.svg"
                          className="w-[2rem]"
                        ></img>
                      </div>
                      <div
                        className={`grid gap-[1rem] ${
                          message.Type === "media" &&
                          message.Attachments.length === 1
                            ? "grid-cols-[50%]"
                            : "grid-cols-[repeat(auto-fill,minmax(20rem,1fr))]"
                        }  break-words text-gray-400`}
                      >
                        {message.Type === "text"
                          ? message.Content
                          : message.Attachments.map((item) => (
                              <img
                                src={
                                  item.Type === "image"
                                    ? item.MediaUrl
                                    : "../src/assets/filenotfound.svg"
                                }
                                onError={imageOnError}
                                className="my-auto cursor-pointer rounded-2xl"
                                title={item.MediaName?.split(".")[0]}
                              ></img>
                            ))}
                      </div>
                    </div>
                  </div>
                ))}
              </>
            ))}
          </div>
        </div>
        <div className="flex w-full  items-center justify-evenly rounded-[1rem] bg-white py-[.5rem]">
          <div className="flex grow items-center justify-evenly">
            <input
              multiple
              type="file"
              accept="image/png, image/jpeg"
              className="hidden"
              id="choose-image"
              onChange={chooseFile}
            ></input>
            <label
              for="choose-image"
              className="fa fa-image cursor-pointer font-normal text-gray-500"
            ></label>
            <input
              multiple
              type="file"
              accept=".doc,.docx,.xls,.xlsx,.pdf"
              className="hidden"
              id="choose-file"
              onChange={chooseFile}
            ></input>
            <label
              for="choose-file"
              className="fa fa-file cursor-pointer font-normal text-gray-500"
            ></label>
          </div>
          {files.length !== 0 ? (
            <div
              className={`${
                files.length === 1
                  ? "grid-cols-[50%]"
                  : "grid-cols-[repeat(auto-fit,minmax(10rem,1fr))]"
              } hide-scrollbar grid w-full gap-[1rem] overflow-y-auto rounded-[.8rem] border-[.1rem] border-gray-300 px-[1rem] py-[.5rem] 
          laptop:max-h-[10rem] 
          laptop:w-[clamp(40rem,70%,70rem)]          
          desktop:w-[80rem]`}
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
                      ? "url('../src/assets/imagenotfound.jpg')"
                      : `url('${URL.createObjectURL(item)}'`,
                  }}
                  className={`relative aspect-square rounded-[.8rem] bg-[image:var(--image-url)] bg-[length:100%_100%] bg-center`}
                  title={item.name.split(".")[0]}
                >
                  <span
                    data-key={item.name}
                    onClick={removeFile}
                    className="fa fa-times-circle absolute right-[0] top-[-5%] z-[1] aspect-square w-[1rem] cursor-pointer rounded-[50%] bg-white text-red-500 hover:text-blue-500"
                    title="Clear image"
                  ></span>
                </div>
              ))}
            </div>
          ) : (
            <div className="grow-[2]">
              <input
                ref={refChatInput}
                type="text"
                placeholder="Write some text"
                className="w-full rounded-[.8rem] border-[.1rem] border-gray-300 px-[1rem] py-[.5rem] focus:outline-none"
                onKeyDown={handlePressKey}
              ></input>
            </div>
          )}
          <div className="flex h-full grow items-center justify-center laptop:max-h-[3.5rem] desktop:max-h-[4.5rem]">
            <div
              className="fa fa-paper-plane flex aspect-square h-full cursor-pointer items-center justify-center rounded-[.8rem] bg-blue-500 text-[90%] font-normal text-white"
              onClick={sendMessage}
            ></div>
          </div>
        </div>
        <CustomModal
          show={show}
          handleClose={handleClose}
          saveChanges={addParticipant}
        ></CustomModal>
      </div>
    </>
  );
};

export default Chatbox;
