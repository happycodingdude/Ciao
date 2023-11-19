import axios from "axios";
import moment from "moment";
import React, { useEffect, useRef, useState } from "react";
import useAuth from "../hook/useAuth";

const Chatbox = ({ conversation }) => {
  console.log("Chatbox calling");
  const auth = useAuth();

  const refChatInput = useRef();
  const refChatContent = useRef();

  const [participants, setParticipants] = useState();
  const [messages, setMessages] = useState();

  useEffect(() => {
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
          console.log(res.data.data);
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
          console.log(res.data.data);
          setMessages(res.data.data);

          setTimeout(() => {
            refChatContent.current.scrollTop =
              refChatContent.current.scrollHeight;
          }, 100);
        } else throw new Error(res.status);
      })
      .catch((err) => {
        console.log(err);
      });

    return () => {
      cancelToken.cancel();
    };
  }, [conversation]);

  const scrollChatContentToBottom = () => {
    refChatContent.current.scrollTop = refChatContent.current.scrollHeight;
  };

  const sendMessage = () => {
    const cancelToken = axios.CancelToken.source();
    const headers = {
      "Content-Type": "application/json",
      Authorization: "Bearer " + auth.token,
    };
    const body = {
      Type: "text",
      Content: refChatInput.current.value,
      ContactId: auth.id,
      ConversationId: conversation.Id,
    };
    axios
      .post(`api/messages`, body, {
        cancelToken: cancelToken.token,
        headers: headers,
      })
      .then((res) => {
        if (res.status === 200) {
          console.log(res.data.data);
          refChatInput.current.value = "";
          setMessages([...messages, res.data.data]);
          setTimeout(() => {
            refChatContent.current.scrollTop =
              refChatContent.current.scrollHeight;
          }, 100);
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

  return (
    <>
      <div className="my-[1rem] flex grow flex-col items-center gap-[1rem]">
        <div className="relative flex w-full grow flex-col overflow-hidden rounded-[1rem] bg-white [&>*]:px-[2rem]">
          <div
            className="fa fa-arrow-down absolute bottom-[1rem] right-[1rem] flex aspect-square w-[3rem] cursor-pointer items-center justify-center rounded-[1rem]
                        bg-gray-300 font-normal text-gray-500"
            onClick={scrollChatContentToBottom}
          ></div>
          <div className="flex items-center justify-between border-b-[.1rem] border-b-gray-400">
            <div className="relative flex h-full items-center gap-[8rem]">
              {participants?.map((item, i) =>
                i < 3 ? (
                  <div
                    className={`absolute aspect-square h-[70%] rounded-[50%] border-[.2rem] border-white bg-[red]
                                            left-[${i * 2}rem]`}
                  ></div>
                ) : (
                  ""
                ),
              )}
              <a
                href="#"
                className="fa fa-plus absolute left-[9rem] flex aspect-square h-[70%] items-center justify-center rounded-[50%] border-[.2rem] border-dashed border-gray-500 text-[130%] font-normal"
              ></a>
            </div>
            <div className="text-center">
              <p className="font-bold">{conversation?.Title}</p>
              <p className="text-gray-400">status</p>
            </div>
            <div className="flex gap-[1rem]">
              <div className="fa fa-search font-normal text-gray-500"></div>
              <div className="flex items-center gap-[.3rem]">
                <div className="aspect-square w-[.5rem] rounded-[50%] bg-gray-500"></div>
                <div className="aspect-square w-[.5rem] rounded-[50%] bg-gray-500"></div>
                <div className="aspect-square w-[.5rem] rounded-[50%] bg-gray-500"></div>
              </div>
            </div>
          </div>
          <div
            ref={refChatContent}
            className="hide-scrollbar my-[2rem] flex flex-col gap-[2rem] overflow-y-scroll scroll-smooth"
          >
            {messages?.map((date) => (
              <>
                <div
                  className="flex items-center text-center
                                    before:mr-[2rem] before:h-[.1rem] before:grow before:bg-gray-400
                                    after:ml-[2rem] after:h-[.1rem]  after:grow after:bg-gray-400"
                >
                  {moment(date.Date).format("DD/MM/YYYY")}
                </div>
                {date.Messages.map((message) => (
                  <div className="flex items-center gap-[2rem]">
                    <div className="aspect-square w-[5rem] self-start rounded-[50%] bg-orange-400"></div>
                    <div className="flex w-full flex-col">
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
                      <p className=" text-gray-400">{message.Content}</p>
                    </div>
                  </div>
                ))}
              </>
            ))}
          </div>
        </div>
        <div className="r flex w-full  items-center justify-evenly rounded-[1rem] bg-white py-[.3rem]">
          <div className="flex grow items-center justify-evenly">
            <a href="#" className="fa fa-image font-normal text-gray-500"></a>
            <a href="#" className="fa fa-file font-normal text-gray-500"></a>
          </div>
          <div className="grow-[2]">
            <input
              ref={refChatInput}
              type="text"
              placeholder="Text here"
              className="w-full rounded-[.5rem] border-[.1rem] border-gray-400 focus:outline-none"
              onKeyDown={handlePressKey}
            ></input>
          </div>
          <div className="flex grow items-center justify-center">
            <a
              href="#"
              className="fa fa-paper-plane flex aspect-square w-[4rem] items-center justify-center rounded-[1rem] bg-blue-500 font-normal text-white"
              onClick={sendMessage}
            ></a>
          </div>
        </div>
      </div>
    </>
  );
};

export default Chatbox;
