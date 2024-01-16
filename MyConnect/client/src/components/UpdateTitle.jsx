import { Tooltip } from "antd";
import axios from "axios";
import React, { useState } from "react";
import useAuth from "../hook/useAuth";
import CustomModal from "./CustomModal";

const UpdateTitle = ({ reference }) => {
  const auth = useAuth();

  const [formData, setFormData] = useState();
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);

  const handleUpdateTitle = () => {
    setFormData({
      title: "Update title",
      data: [
        {
          label: "Title",
          name: "Title",
          type: "input",
          value: reference.conversation.Title,
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
      <Tooltip
        className="fa fa-edit cursor-pointer text-[1.3rem] font-normal text-gray-500 hover:text-blue-500"
        title="Update title"
        onClick={handleUpdateTitle}
      ></Tooltip>
      <CustomModal
        show={show}
        forms={formData}
        onClose={handleClose}
        onSubmit={updateTitle}
      ></CustomModal>
    </>
  );
};

export default UpdateTitle;
