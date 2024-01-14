import axios from "axios";
import React, { useCallback, useEffect, useRef, useState } from "react";
import useAuth from "../hook/useAuth";
import CustomModal from "./CustomModal";

export const UpdateTitle1 = ({ reference }) => {
  const auth = useAuth();

  const refChatboxOption = useRef();
  const refChatboxOptionMenu = useRef();

  const [formData, setFormData] = useState();
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);

  const toggleChatboxOption = useCallback((event) => {
    // click anywhere on screen except the option toggle
    if (!refChatboxOption.current?.contains(event.target)) {
      refChatboxOptionMenu.current.classList.remove("scale-y-100");
    } else if (refChatboxOptionMenu.current.classList.contains("scale-y-100"))
      refChatboxOptionMenu.current.classList.remove("scale-y-100");
    else refChatboxOptionMenu.current.classList.add("scale-y-100");
  }, []);

  useEffect(() => {
    window.addEventListener("click", toggleChatboxOption, true);
    return () => {
      window.removeEventListener("click", toggleChatboxOption, true);
    };
  }, [toggleChatboxOption]);

  const handleUpdateTitle = () => {
    setFormData({
      title: "Update title",
      data: [
        {
          label: "Title",
          name: "Title",
          type: "input",
        },
      ],
    });
    setShow(true);
  };

  const updateTitle = (data) => {
    console.log(data);
    if (data.Title === null) return;
    reference.conversation.Title = data.Title[0];

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

  return (
    <>
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
      <CustomModal
        show={show}
        forms={formData}
        onClose={handleClose}
        onSubmit={updateTitle}
      ></CustomModal>
    </>
  );
};
