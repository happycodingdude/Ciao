import { wrapGrid } from "animate-css-grid";
import axios from "axios";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import moment from "moment";
import React, { useCallback, useEffect, useRef, useState } from "react";
import useAuth from "../hook/useAuth";

const Chatbox = ({ conversation, func }) => {
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
    if (!conversation) return;

    // const storage = getStorage();
    // const storageRef = ref(storage, "img/anhdep1.jpg");
    // getDownloadURL(storageRef).then((url) => {
    //   console.log(url);
    // });
    setFiles([]);

    const cancelToken = axios.CancelToken.source();
    const headers = {
      "Content-Type": "application/json",
      Authorization: "Bearer " + auth.token,
    };
    axios
      .get(`api/conversations/${conversation?.Id}/participants`, {
        cancelToken: cancelToken.token,
        headers: headers,
      })
      .then((res) => {
        if (res.status === 200) {
          setParticipants(res.data.data);
        } else throw new Error(res.status);
      })
      .catch((err) => {
        console.log(err);
      });
    axios
      .get(`api/conversations/${conversation?.Id}/messages`, {
        cancelToken: cancelToken.token,
        headers: headers,
      })
      .then((res) => {
        if (res.status === 200) {
          refChatContent.current.classList.remove("scroll-smooth");
          refChatContent.current.scrollTop = 0;
          setMessages(res.data.data);
        } else throw new Error(res.status);
      })
      .catch((err) => {
        console.log(err);
      });

    return () => {
      cancelToken.cancel();
    };
  }, [conversation]);

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
    refChatContent.current.scrollTop = refChatContent.current.scrollHeight;

    setTimeout(() => {
      const grids = Array.from(document.querySelectorAll(".grid-chat"));
      grids.map((grid) => {
        wrapGrid(grid, { duration: 400, easing: "easeOut" });
      });
    }, 500);
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
                console.log(url);
                return { type: "file", url: url };
              });
            },
          );
        }
        return uploadBytes(ref(storage, `img/${item.name}`), item).then(
          (snapshot) => {
            return getDownloadURL(snapshot.ref).then((url) => {
              console.log(url);
              return { type: "image", url: url };
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
      ConversationId: conversation.Id,
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
        Type: "file",
        Attachments: await uploadFile().then((uploads) => {
          return uploads.map((item) => ({
            Type: item.type,
            MediaUrl: item.url,
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
        if (res.status === 200) {
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
        } else throw new Error(res.status);
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

  const handleUpdateTitle = () => {
    var title = prompt("New title");
    if (title === null || title === "") return;
    conversation.Title = title;

    const cancelToken = axios.CancelToken.source();
    const headers = {
      "Content-Type": "application/json",
      Authorization: "Bearer " + auth.token,
    };
    axios
      .put("api/conversations", conversation, {
        cancelToken: cancelToken.token,
        headers: headers,
      })
      .then((res) => {
        if (res.status === 200) {
          console.log(res.data.data);
        } else throw new Error(res.status);
      })
      .catch((err) => {
        console.log(err);
      });

    return () => {
      cancelToken.cancel();
    };
  };

  const toggleInformationContainer = () => {
    func.toggleInformationContainer();

    refToggleInformationContainer.current.classList.add("animate-spin");
    setTimeout(() => {
      refToggleInformationContainer.current.classList.remove("animate-spin");
      refToggleInformationContainer.current.classList.toggle("fa-arrow-left");
      refToggleInformationContainer.current.classList.toggle("fa-arrow-right");
      refChatContent.current.scrollTop = refChatContent.current.scrollHeight;
    }, 500);

    const grids = Array.from(document.querySelectorAll(".grid-chat"));
    grids.map((grid) => {
      if (
        grid.classList.contains(
          "grid-cols-[repeat(auto-fit,minmax(20rem,1fr))]",
        )
      ) {
        grid.classList.remove("grid-cols-[repeat(auto-fit,minmax(20rem,1fr))]");
        grid.classList.add("grid-cols-[repeat(auto-fit,minmax(15rem,1fr))]");
      } else {
        grid.classList.add("grid-cols-[repeat(auto-fit,minmax(20rem,1fr))]");
        grid.classList.remove("grid-cols-[repeat(auto-fit,minmax(15rem,1fr))]");
      }
    });
  };

  const chooseFile = (e) => {
    // console.log(e.target.files);
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

  const imageOnError = (e) => {
    e.target.onerror = null;
    e.target.src = "../src/assets/imagenotfound.jpg";
  };

  return (
    <div className="z-10 flex w-[calc(100%/2)] grow flex-col items-center gap-[1rem]">
      <div className="relative flex w-full grow flex-col overflow-hidden rounded-[1rem] bg-white [&>*]:px-[2rem]">
        <div
          ref={refScrollButton}
          className="fa fa-arrow-down absolute bottom-[1rem] right-[1rem] flex aspect-square w-[3rem] cursor-pointer items-center justify-center
                      rounded-[50%] bg-gray-300 font-normal text-gray-500"
          onClick={scrollChatContentToBottom}
        ></div>
        <div className="flex items-center justify-between border-b-[.1rem] border-b-gray-300 py-[.5rem] laptop:max-h-[5.5rem]">
          <div className="relative flex h-full basis-[calc(100%/3)] items-center">
            {participants?.map((item, i) =>
              i < 3 ? (
                <div
                  className={`absolute aspect-square h-[70%] rounded-[50%] border-[.2rem] border-white bg-[red] ${
                    i === 0 ? "left-0" : ""
                  } ${i === 1 ? "left-[2rem]" : ""} ${
                    i === 2 ? "left-[4rem]" : ""
                  }`}
                ></div>
              ) : (
                ""
              ),
            )}
            <a
              href="#"
              className="fa fa-plus absolute left-[9rem] flex aspect-square h-[70%] items-center justify-center rounded-[50%] border-[.2rem] border-dashed border-gray-500 text-[130%] font-normal text-gray-500"
            ></a>
          </div>
          <div className="basis-[calc(100%/3)] text-center">
            <p className="font-bold text-gray-600">{conversation?.Title}</p>
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
          <div className="flex basis-[calc(100%/3)] justify-end gap-[1rem]">
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
                  onClick={handleUpdateTitle}
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
                  <div className="aspect-square self-start rounded-[50%] bg-orange-400 laptop:w-[calc(100%/15)] desktop:w-[calc(100%/20)]"></div>
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
                        message.Type === "file" &&
                        message.Attachments.length === 1
                          ? "grid-cols-[repeat(1,70%)]"
                          : "grid-chat grid-cols-[repeat(auto-fit,minmax(20rem,1fr))]"
                        // "grid-cols-[repeat(2,1fr)]"
                      }  break-words text-gray-400`}
                    >
                      {message.Type === "text"
                        ? message.Content
                        : message.Attachments.map((item) => {
                            return item.Type === "image" ? (
                              <img
                                src={item.MediaUrl}
                                onError={imageOnError}
                                className="aspect-video cursor-pointer rounded-2xl"
                              ></img>
                            ) : (
                              <img
                                src="../src/assets/filenotfound.svg"
                                onError={imageOnError}
                                className="aspect-video cursor-pointer rounded-2xl"
                              ></img>
                            );
                          })}
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
                ? "grid-cols-[repeat(1,50%)]"
                : "grid-cols-[repeat(auto-fit,minmax(12rem,1fr))]"
            } hide-scrollbar grid h-full gap-[1rem] overflow-y-auto rounded-[.8rem] border-[.1rem] border-gray-300 px-[1rem] py-[.5rem] 
          laptop:max-h-[10rem] 
          laptop:w-[clamp(40rem,70%,70rem)]          
          desktop:w-[80rem]`}
          >
            {files.map((item) => {
              return ["doc", "docx", "xls", "xlsx", "pdf"].includes(
                item.name.split(".")[1],
              ) ? (
                <div
                  className={`group relative aspect-video rounded-[.8rem]
                  before:absolute before:h-full before:w-full before:rounded-[.8rem] 
                  before:bg-[url('../src/assets/imagenotfound.jpg')] before:bg-[length:100%_100%] before:bg-center
                  hover:before:opacity-50`}
                >
                  <span
                    data-key={item.name}
                    onClick={removeFile}
                    // className="fa fa-times-circle absolute right-[0] top-[-5%] aspect-square w-[1rem] cursor-pointer rounded-[50%] text-red-500 group-hover:opacity-100"
                    // className="absolute right-1/2 top-1/2 aspect-square w-[5rem] translate-x-[50%] translate-y-[-50%] cursor-pointer rounded-[50%] bg-red-500 text-red-500 group-hover:opacity-100"
                    className="before:absolute before:left-[5%] before:top-1/2 before:h-[.5rem] before:w-[5rem] before:translate-x-[80%] before:translate-y-[-50%] before:rotate-[28deg] before:scale-0 before:cursor-pointer before:bg-red-500 
                    before:text-red-500 before:duration-[.2s] after:absolute after:bottom-[5%] after:left-[5%] after:top-1/2 after:h-[.5rem] after:w-[5rem] after:translate-x-[80%] after:translate-y-[-50%] after:rotate-[-28deg] after:scale-0
                    after:cursor-pointer after:bg-red-500
                    after:text-red-500 after:duration-[.2s]
                    group-hover:before:scale-100 group-hover:after:scale-100"
                  ></span>
                </div>
              ) : (
                <div
                  style={{
                    "--image-url": `url('${URL.createObjectURL(item)}'`,
                  }}
                  className={`group relative aspect-video rounded-[.8rem]
                  before:absolute before:h-full before:w-full before:rounded-[.8rem] 
                  before:bg-[image:var(--image-url)] before:bg-[length:100%_100%] before:bg-center
                  hover:before:opacity-50`}
                >
                  <span
                    data-key={item.name}
                    onClick={removeFile}
                    // className="fa fa-times-circle absolute right-[0] top-[-5%] aspect-square w-[1rem] cursor-pointer rounded-[50%] text-red-500 group-hover:opacity-100"
                    // className="absolute right-1/2 top-1/2 aspect-square w-[5rem] translate-x-[50%] translate-y-[-50%] cursor-pointer rounded-[50%] bg-red-500 text-red-500 group-hover:opacity-100"
                    className="before:absolute before:left-[5%] before:top-1/2 before:h-[.5rem] before:w-[5rem] before:translate-x-[80%] before:translate-y-[-50%] before:rotate-[28deg] before:scale-0 before:cursor-pointer before:bg-red-500 
                    before:text-red-500 before:duration-[.2s] after:absolute after:bottom-[5%] after:left-[5%] after:top-1/2 after:h-[.5rem] after:w-[5rem] after:translate-x-[80%] after:translate-y-[-50%] after:rotate-[-28deg] after:scale-0
                    after:cursor-pointer after:bg-red-500
                    after:text-red-500 after:duration-[.2s]
                    group-hover:before:scale-100 group-hover:after:scale-100"
                  ></span>
                </div>
              );
            })}
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
    </div>
  );
};

export default Chatbox;
