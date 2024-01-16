import { Form, Mentions, Tooltip } from "antd";
import axios from "axios";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import parse from "html-react-parser";
import moment from "moment";
import React, { useCallback, useEffect, useRef, useState } from "react";
import useAuth from "../hook/useAuth";
import AddParticipants from "./AddParticipants";
import CustomLabel from "./CustomLabel";
import ImageWithLightBox from "./ImageWithLightBox";

const page = 1;
const limit = 10;

const Chatbox = ({ reference }) => {
  console.log("Chatbox calling");
  const auth = useAuth();

  const [form] = Form.useForm();
  const refChatInput = useRef();
  const refChatContent = useRef();
  const refScrollButton = useRef();
  // const refChatboxOption = useRef();
  // const refChatboxOptionMenu = useRef();
  const refToggleInformationContainer = useRef();
  const refChatboxContainer = useRef();
  const refTitleContainer = useRef();

  const [files, setFiles] = useState([]);
  const [participants, setParticipants] = useState();
  const [messages, setMessages] = useState();
  const [suggestion, setSuggestion] = useState();

  const handleSetParticipants = () => {
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
        const suggestion = res.data.data
          .filter((item) => item.ContactId !== auth.id)
          .map((item) => {
            return {
              key: item.Contact.Id,
              value: item.Contact.Id,
              label: item.Contact.Name,
            };
          });
        setSuggestion(suggestion);

        reference.refInformation.setParticipants(res.data.data);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    if (!reference.conversation) return;

    setFiles([]);

    const cancelToken = axios.CancelToken.source();
    const headers = {
      "Content-Type": "application/json",
      Authorization: "Bearer " + auth.token,
    };

    axios
      .get(
        `api/conversations/${reference.conversation?.Id}/messages?page=${page}&limit=${limit}`,
        {
          cancelToken: cancelToken.token,
          headers: headers,
        },
      )
      .then((res) => {
        if (res.status !== 200) throw new Error(res.status);
        // refChatContent.current.classList.remove("scroll-smooth");
        refChatContent.current.scrollTop = 0;
        setMessages(res.data.data.reverse());
      })
      .catch((err) => {
        console.log(err);
      });

    handleSetParticipants();

    return () => {
      cancelToken.cancel();
    };
  }, [reference.conversation.Id]);

  useEffect(() => {
    reference.refChatbox.setParticipants = handleSetParticipants;
    reference.refChatbox.newMessage = (message) => {
      setMessages((current) => {
        return [...current, message];
      });
    };
  }, [handleSetParticipants, setMessages]);

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

    // refChatContent.current.classList.add("scroll-smooth");
    setTimeout(() => {
      refChatContent.current.scrollTop = refChatContent.current.scrollHeight;
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
      if (refChatInput.current.textarea.value === "") return;
      body = {
        ...body,
        Type: "text",
        Content: refChatInput.current.textarea.value,
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

        form.resetFields();
        setFiles([]);
        setMessages([...messages, res.data.data]);

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
    // Press Shift + Enter to generate new line
    if (e.keyCode == 13 && !e.shiftKey) {
      e.preventDefault();
      if (refChatInput.current.textarea.value === "") return;
      sendMessage();
    }
    // Press tab to choose
    // else if (e.keyCode == 9) {
    //   e.preventDefault();
    // }
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

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, true);
    return () => {
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [handleScroll]);

  const toggleInformationContainer = () => {
    reference.toggleInformationContainer();
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
    refTitleContainer.current.classList.toggle("max-w-[30rem]");
    refTitleContainer.current.classList.toggle("max-w-[40rem]");
  };

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

  const generateContent = (text) => {
    if (reference.contacts.some((item) => text.includes(`@${item.Id}`))) {
      reference.contacts.map((item) => {
        text = text.replace(
          `@${item.Id}`,
          `<span className="text-blue-400 cursor-pointer">${item.Name}</span>`,
        );
      });
      return parse(text);
    }
    return text;
  };

  const showProfile = () => {
    console.log("showProfile calling");
  };

  return (
    <>
      <div
        ref={refChatboxContainer}
        className="flex flex-1 grow-[2] flex-col items-center gap-[1rem]"
      >
        <div className="relative flex w-full grow flex-col overflow-hidden rounded-[1rem] bg-white [&>*]:px-[2rem]">
          <div
            ref={refScrollButton}
            className="fa fa-arrow-down absolute bottom-[1rem] right-[1rem] flex aspect-square w-[3rem] cursor-pointer items-center justify-center
                      rounded-[50%] bg-gray-300 font-normal text-gray-500"
            onClick={scrollChatContentToBottom}
          ></div>
          <div className="flex items-center justify-between border-b-[.1rem] border-b-gray-300 py-[.5rem] laptop:max-h-[5.5rem]">
            <div className="relative flex h-full min-w-[20%] items-center">
              {participants?.map((item, i) =>
                i < 3 ? (
                  <ImageWithLightBox
                    src={item.Contact.Avatar ?? ""}
                    className={`absolute aspect-square h-[70%] cursor-pointer rounded-[50%] border-[.2rem] border-white bg-[image:var(--image-url)] bg-[length:100%_100%] bg-center ${
                      i === 0 ? "left-0" : ""
                    } ${i === 1 ? "left-[2rem]" : ""} ${
                      i === 2 ? "left-[4rem]" : ""
                    }`}
                    slides={[
                      {
                        src: item.Contact.Avatar ?? "",
                      },
                    ]}
                    onClick={showProfile}
                  ></ImageWithLightBox>
                ) : (
                  ""
                ),
              )}
              <AddParticipants
                reference={{
                  participants,
                  conversation: reference.conversation,
                }}
              ></AddParticipants>
            </div>
            <div
              ref={refTitleContainer}
              className="relative flex max-w-[30rem] flex-col items-center"
            >
              <CustomLabel
                className="font-bold text-gray-600"
                title={reference.conversation?.Title}
                tooltip
                update
                reference={reference}
              ></CustomLabel>
              <p className="text-gray-400">
                Last seen{" "}
                {moment(reference.conversation?.LastSeenTime).format(
                  "DD/MM/YYYY",
                ) === moment().format("DD/MM/YYYY")
                  ? moment(reference.conversation?.LastSeenTime).fromNow()
                  : moment(reference.conversation?.LastSeenTime).format(
                      "DD/MM HH:mm",
                    )}
              </p>
            </div>
            <div className="flex justify-end gap-[1rem]">
              <div className="fa fa-search cursor-not-allowed self-center font-normal text-gray-500"></div>
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
            {messages?.map((message) => (
              <div className="flex items-center gap-[2rem]">
                <ImageWithLightBox
                  src={
                    reference.contacts.find(
                      (item) => item.Id == message.ContactId,
                    ).Avatar ?? ""
                  }
                  className="aspect-square cursor-pointer self-start rounded-[50%] laptop:w-[clamp(3.5rem,calc(100%/15),4.5rem)] 
                          desktop:w-[calc(100%/20)]"
                  slides={[
                    {
                      src:
                        reference.contacts.find(
                          (item) => item.Id == message.ContactId,
                        ).Avatar ?? "",
                    },
                  ]}
                  onClick={showProfile}
                ></ImageWithLightBox>
                <div className="flex w-[90%] flex-col">
                  <div className="flex items-center gap-[1rem]">
                    <h1 className="font-semibold">
                      {message.ContactId === auth.id
                        ? "You"
                        : reference.contacts.find(
                            (item) => item.Id == message.ContactId,
                          ).Name}
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
                      {moment(message.CreatedTime).format("DD/MM/YYYY") ===
                      moment().format("DD/MM/YYYY")
                        ? moment(message.CreatedTime).format("HH:mm")
                        : moment(message.CreatedTime).format("DD/MM HH:mm")}
                    </p>
                    <img
                      src="../src/img/double-check.svg"
                      className="w-[2rem]"
                    ></img>
                  </div>
                  {message.Type === "text" ? (
                    <div className="break-words text-gray-400">
                      {generateContent(message.Content)}
                    </div>
                  ) : (
                    <div
                      className={`grid gap-[1rem] ${
                        message.Type === "media" &&
                        message.Attachments.length === 1
                          ? "grid-cols-[50%]"
                          : "grid-cols-[repeat(auto-fill,minmax(20rem,1fr))]"
                      }  break-words text-gray-400`}
                    >
                      {message.Attachments.map((item, index) => (
                        <ImageWithLightBox
                          src={item.MediaUrl}
                          title={item.MediaName?.split(".")[0]}
                          className="my-auto cursor-pointer rounded-2xl"
                          slides={message.Attachments.map((item) => ({
                            src:
                              item.Type === "image"
                                ? item.MediaUrl
                                : "../src/assets/filenotfound.svg",
                          }))}
                          index={index}
                        ></ImageWithLightBox>
                      ))}
                    </div>
                  )}
                </div>
              </div>
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
            <Tooltip title="Choose image">
              <label
                for="choose-image"
                className="fa fa-image cursor-pointer font-normal text-gray-500"
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
            <Tooltip title="Choose image">
              <label
                for="choose-file"
                className="fa fa-file cursor-pointer font-normal text-gray-500"
              ></label>
            </Tooltip>
          </div>
          {files.length !== 0 ? (
            <div
              className={`${
                files.length === 1
                  ? "grid-cols-[50%]"
                  : "laptop:grid-cols-[repeat(auto-fit,minmax(10rem,1fr))] desktop:grid-cols-[repeat(auto-fit,minmax(15rem,1fr))]"
              } hide-scrollbar grid max-h-[10rem] w-full gap-[1rem] overflow-y-auto rounded-[.8rem] border-[.1rem] border-gray-300 px-[1rem] 
          py-[.5rem] 
          laptop:w-[clamp(40rem,75%,70rem)]         
          desktop:w-[clamp(70rem,75%,120rem)]`}
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
                  className={`relative aspect-video rounded-[.8rem] bg-[image:var(--image-url)] bg-[length:100%_100%] bg-center`}
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
              <Form form={form}>
                <Form.Item name="mentions" className="mb-0">
                  <Mentions
                    ref={refChatInput}
                    className="mention-input"
                    options={suggestion}
                    onKeyDown={handlePressKey}
                  ></Mentions>
                </Form.Item>
              </Form>
              {/* <input
                ref={refChatInput}
                type="text"
                placeholder="Write some text"
                className="w-full rounded-[.8rem] border-[.1rem] border-gray-300 px-[1rem] py-[.5rem] focus:outline-none"
                onKeyDown={handlePressKey}
              ></input> */}
            </div>
          )}
          <div className="flex h-full grow items-center justify-center laptop:max-h-[3.5rem] desktop:max-h-[4.5rem]">
            <Tooltip title="Send">
              <div
                className="fa fa-paper-plane flex aspect-square h-full cursor-pointer items-center justify-center rounded-[.8rem] bg-blue-500 text-[90%] font-normal text-white"
                onClick={sendMessage}
              ></div>
            </Tooltip>
          </div>
        </div>
      </div>
    </>
  );
};

export default Chatbox;
