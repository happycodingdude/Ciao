// import { Tooltip } from "antd";
import axios from "axios";
import React, { useState } from "react";
import useAuth from "../../hook/useAuth";
import CustomModal from "../common/CustomModal";

const CreateGroupChat = () => {
  const auth = useAuth();

  const [formData, setFormData] = useState();
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);

  const handleCreateGroupChat = () => {
    const cancelToken = axios.CancelToken.source();
    const headers = {
      "Content-Type": "application/json",
      Authorization: "Bearer " + auth.token,
    };
    axios
      .get("api/contacts", {
        cancelToken: cancelToken.token,
        headers: headers,
      })
      .then((res) => {
        if (res.status !== 200) throw new Error(res.status);
        setFormData({
          title: "Create group",
          data: [
            {
              label: "Title",
              name: "Title",
              type: "input",
            },
            {
              label: "Friends",
              name: "Friends",
              type: "multiple",
              options: res.data.data
                .filter((item) => item.Id !== auth.id)
                .map((item) => {
                  return { label: item.Name, value: item.Id };
                }),
            },
          ],
        });
        setShow(true);
      })
      .catch((err) => {
        console.log(err);
      });

    return () => {
      cancelToken.cancel();
    };
  };

  const createGroupChat = (data) => {
    console.log(data);
    // handleClose();
    const cancelToken = axios.CancelToken.source();
    const headers = {
      "Content-Type": "application/json",
      Authorization: "Bearer " + auth.token,
    };
    const body = {
      Title: data.Title[0],
      Participants: [
        {
          ContactId: auth.id,
          IsNotifying: true,
          IsModerator: true,
        },
      ],
    };
    body.Participants = [
      ...body.Participants,
      ...data.Friends.filter((item) => item !== "").map((item) => {
        return {
          ContactId: item,
          IsNotifying: true,
        };
      }),
    ];
    console.log(body);
    axios
      .post(`api/conversations`, body, {
        cancelToken: cancelToken.token,
        headers: headers,
      })
      .then((res) => {
        if (res.status !== 200) throw new Error(res.status);
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
        onClick={handleCreateGroupChat}
        className="fa fa-users flex flex-1 cursor-pointer items-center justify-center rounded-lg text-sm font-normal transition-all duration-200 hover:bg-[#e7e7e7]"
      ></div>
      <CustomModal
        show={show}
        forms={formData}
        onClose={handleClose}
        onSubmit={createGroupChat}
      ></CustomModal>
    </>
  );
};

export default CreateGroupChat;
