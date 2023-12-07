import { wrapGrid } from "animate-css-grid";
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import useAuth from "../hook/useAuth";

const Information = ({ conversation, func }) => {
  console.log("Information calling");
  const auth = useAuth();

  const [participants, setParticipants] = useState();
  const [attachments, setAttachments] = useState();
  const [displayAttachments, setDisplayAttachments] = useState();
  const [isNotifying, setIsNotifying] = useState(false);

  const refInformation = useRef();
  const refGrid = useRef();

  const showInformation = () => {
    refInformation.current.classList.remove("animate-information-hide");
    refInformation.current.classList.add("animate-information-show");
  };

  const hideInformation = () => {
    refInformation.current.classList.remove("animate-information-show");
    refInformation.current.classList.add("animate-information-hide");
  };

  const toggleInformation = () => {
    if (refInformation.current.classList.contains("animate-information-hide"))
      showInformation();
    else hideInformation();
  };

  useEffect(() => {
    func.refInformation.toggleInformation = toggleInformation;
  }, [toggleInformation]);

  useEffect(() => {
    if (!conversation) return;
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
          setIsNotifying(
            res.data.data.find((item) => item.ContactId === auth.id)
              ?.IsNotifying,
          );
        } else throw new Error(res.status);
      })
      .catch((err) => {
        console.log(err);
      });

    axios
      .get(`api/conversations/${conversation?.Id}/attachments`, {
        cancelToken: cancelToken.token,
        headers: headers,
      })
      .then((res) => {
        if (res.status === 200) {
          setAttachments(res.data.data);
          setDisplayAttachments(res.data.data[0].Attachments.slice(0, 8));
          wrapGrid(refGrid.current, { duration: 600, easing: "backInOut" });
        } else throw new Error(res.status);
      })
      .catch((err) => {
        console.log(err);
      });

    return () => {
      cancelToken.cancel();
    };
  }, [conversation]);

  const toggleNotification = (e) => {
    const checked = e.target.checked;
    const cancelToken = axios.CancelToken.source();
    const headers = {
      "Content-Type": "application/json",
      Authorization: "Bearer " + auth.token,
    };
    const selected = participants.find((item) => item.ContactId === auth.id);
    selected.IsNotifying = e.target.checked;
    axios
      .put(`api/participants`, selected, {
        cancelToken: cancelToken.token,
        headers: headers,
      })
      .then((res) => {
        if (res.status === 200) {
          setIsNotifying(checked);
        } else throw new Error(res.status);
      })
      .catch((err) => {
        console.log(err);
      });

    return () => {
      cancelToken.cancel();
    };
  };

  useEffect(() => {
    localStorage.setItem("notification", isNotifying);
  }, [isNotifying]);

  const deleteChat = () => {
    if (confirm("Delete this chat?") === true) {
      const cancelToken = axios.CancelToken.source();
      const headers = {
        "Content-Type": "application/json",
        Authorization: "Bearer " + auth.token,
      };
      const selected = participants.find((item) => item.ContactId === auth.id);
      selected.IsDeleted = true;
      axios
        .put(`api/participants`, selected, {
          cancelToken: cancelToken.token,
          headers: headers,
        })
        .then((res) => {
          if (res.status === 200)
            func.removeInListChat(res.data.data.ConversationId);
          else throw new Error(res.status);
        })
        .catch((err) => {
          console.log(err);
        });

      return () => {
        cancelToken.cancel();
      };
    }
  };

  const showAllAttachment = () => {
    // if (refGrid.current.classList.contains("grid-cols-[repeat(4,1fr)]")) {
    //   refGrid.current.classList.remove("grid-cols-[repeat(4,1fr)]");
    //   refGrid.current.classList.add("grid-cols-[repeat(5,1fr)]");
    // } else {
    //   refGrid.current.classList.add("grid-cols-[repeat(4,1fr)]");
    //   refGrid.current.classList.remove("grid-cols-[repeat(5,1fr)]");
    // }
  };

  const imageOnError = (e) => {
    e.target.onerror = null;
    e.target.src = "../src/assets/imagenotfound.jpg";
  };

  return (
    <div
      ref={refInformation}
      className="hide-scrollbar w-[calc(100%/4)] shrink-0 overflow-hidden overflow-y-auto scroll-smooth rounded-[1rem] bg-white [&>*:not(:first-child)]:mt-[2rem] [&>*]:border-b-gray-300 [&>*]:px-[2rem] [&>*]:pb-[1rem]"
    >
      <div className="flex items-center justify-between border-b-[.1rem] pt-[1rem] laptop:h-[5.5rem]">
        <p className="font-bold text-gray-600">Contact Information</p>
        <div className="flex items-center gap-[.3rem]">
          <div className="aspect-square w-[.5rem] rounded-[50%] bg-gray-500"></div>
          <div className="aspect-square w-[.5rem] rounded-[50%] bg-gray-500"></div>
          <div className="aspect-square w-[.5rem] rounded-[50%] bg-gray-500"></div>
        </div>
      </div>
      <div className="flex flex-col gap-[1rem] border-b-[.1rem]">
        <div className="flex flex-col items-center gap-[.5rem]">
          <div className="aspect-square w-[20%] rounded-[50%] bg-orange-400"></div>
          <p className="font-bold text-gray-600">{conversation?.Title}</p>
          <div className="cursor-pointer text-gray-400">
            {participants?.length} members
          </div>
        </div>
        <div className="flex w-full justify-evenly">
          <a
            href="#"
            className="fa fa-phone flex aspect-[4/1.5] w-[10rem] items-center justify-center rounded-[1rem] border-[.1rem] border-gray-400 font-normal text-blue-500"
          ></a>
          <a
            href="#"
            className="fa fa-video flex aspect-[4/1.5] w-[10rem] items-center justify-center rounded-[1rem] border-[.1rem] border-gray-400 font-normal text-blue-500"
          ></a>
        </div>
      </div>
      {/* <div className="border-b-[.1rem]">
        <label className="uppercase text-gray-400">username</label>
        <p className="text-blue-500">@user_name</p>
      </div> */}
      <div className="flex flex-col gap-[1rem] border-b-[.1rem]">
        <div className="flex justify-between">
          <label className="font-bold text-gray-600">Attachments</label>
          <div
            onClick={showAllAttachment}
            className="cursor-pointer text-blue-500"
          >
            See all
          </div>
        </div>
        <div
          ref={refGrid}
          className="grid w-full grid-cols-[repeat(4,1fr)] gap-[1rem]"
        >
          {displayAttachments?.map((item) => (
            // <div
            //   style={{
            //     "--image-url": `url('${item.MediaUrl}')`,
            //   }}
            //   className="aspect-square cursor-pointer rounded-2xl bg-[image:var(--image-url)] bg-[length:100%_100%] bg-center"
            // ></div>
            <img
              src={item.MediaUrl}
              onError={imageOnError}
              className="aspect-square cursor-pointer rounded-2xl"
            ></img>
          ))}
        </div>
      </div>
      <div className="flex justify-between border-b-[.1rem]">
        <label className="fa fa-bell font-normal text-gray-500">
          &ensp;Notification
        </label>
        <div className="relative">
          <input
            type="checkbox"
            id="checkbox"
            className="peer absolute opacity-0"
            checked={isNotifying}
            onChange={toggleNotification}
          ></input>
          <label
            for="checkbox"
            className="
                        relative                
                        block h-[100%]
                        w-[clamp(3rem,2.5vw,4rem)]
                        cursor-pointer
                        rounded-[5rem]
                        bg-gray-400
                        duration-[.3s]
                        before:absolute
                        before:z-[2]
                        before:aspect-square
                        before:h-full
                        before:rounded-[50%]
                        before:border-[.2rem]
                        before:border-gray-400
                        before:bg-white
                        before:duration-[.3s]
                        peer-checked:bg-blue-500
                        before:peer-checked:translate-x-[100%]
                        before:peer-checked:border-blue-500
                        laptop:before:peer-checked:translate-x-[110%]"
          ></label>
        </div>
      </div>
      <div
        onClick={deleteChat}
        className="fa fa-trash cursor-pointer font-normal text-red-500"
      >
        &ensp;Delete chat
      </div>
    </div>
  );
};

export default Information;
