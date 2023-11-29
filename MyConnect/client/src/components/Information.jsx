import axios from "axios";
import React, { useEffect, useState } from "react";
import useAuth from "../hook/useAuth";

const Information = ({ conversation, removeInListChat }) => {
  console.log("Information calling");
  const auth = useAuth();

  const [participants, setParticipants] = useState();
  const [isNotifying, setIsNotifying] = useState(false);

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
            removeInListChat(res.data.data.ConversationId);
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

  return (
    <>
      <div className="w-[clamp(30rem,20vw,40rem)] shrink-0 origin-right overflow-hidden rounded-[1rem] bg-white duration-[.5s] [&>*:not(:first-child)]:mt-[2rem] [&>*]:border-b-gray-300 [&>*]:px-[2rem] [&>*]:pb-[1rem]">
        <div className="flex justify-between border-b-[.1rem] pt-[1rem]">
          <p className="font-bold text-gray-600">Contact Information</p>
          <div className="flex items-center gap-[.3rem]">
            <div className="aspect-square w-[.5rem] rounded-[50%] bg-gray-500"></div>
            <div className="aspect-square w-[.5rem] rounded-[50%] bg-gray-500"></div>
            <div className="aspect-square w-[.5rem] rounded-[50%] bg-gray-500"></div>
          </div>
        </div>
        <div className="flex flex-col gap-[1rem] border-b-[.1rem]">
          <div className="flex flex-col items-center">
            <div className="aspect-square w-[5rem] rounded-[50%] bg-orange-400"></div>
            <p className="font-bold text-gray-600">{conversation?.Title}</p>
            <p className=" text-gray-400">{participants?.length} members</p>
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
        <div className="border-b-[.1rem]">
          <label className="uppercase text-gray-400">username</label>
          <p className="text-blue-500">@user_name</p>
        </div>
        <div className=" border-b-[.1rem]">
          <div className="flex justify-between">
            <label className="font-bold text-gray-600">Files</label>
            <a href="#" className="text-blue-500">
              See all
            </a>
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
    </>
  );
};

export default Information;
