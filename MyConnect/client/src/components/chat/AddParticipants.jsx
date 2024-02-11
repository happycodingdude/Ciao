// import { Tooltip } from "antd";
import axios from "axios";
import React, { useState } from "react";
import useAuth from "../../hook/useAuth";
import CustomModal from "../common/CustomModal";

const AddParticipants = ({ reference }) => {
  const auth = useAuth();

  const [formData, setFormData] = useState();
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);

  const handleAddParticipant = () => {
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
          title: "Add member",
          data: [
            {
              label: "Members",
              name: "Members",
              type: "multiple",
              options: res.data.data
                .filter(
                  (item) =>
                    !reference.participants.some(
                      (participant) => participant.ContactId === item.Id,
                    ),
                )
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

  const addParticipant = (data) => {
    console.log(data);
    handleClose();
    const cancelToken = axios.CancelToken.source();
    const headers = {
      "Content-Type": "application/json",
      Authorization: "Bearer " + auth.token,
    };
    const body = data.Members.map((item) => {
      return {
        ConversationId: reference.conversation.Id,
        ContactId: item,
        IsNotifying: true,
      };
    });
    axios
      .post(
        `api/conversations/${reference.conversation?.Id}/participants`,
        body,
        {
          cancelToken: cancelToken.token,
          headers: headers,
        },
      )
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
      {/* <Tooltip
        className="fa fa-plus absolute left-[9rem] flex aspect-square h-[70%] cursor-pointer items-center justify-center rounded-[50%] border-[.2rem] border-dashed border-gray-500 text-[130%] font-normal text-gray-500"
        title="Add member"
        onClick={handleAddParticipant}
      ></Tooltip> */}
      <div
        onClick={handleAddParticipant}
        className={`fa fa-user-plus flex aspect-square w-[15%] cursor-pointer items-center justify-center rounded-[50%] bg-pink-100 text-base font-normal text-pink-500 hover:bg-pink-200`}
      ></div>
      <CustomModal
        show={show}
        forms={formData}
        onClose={handleClose}
        onSubmit={addParticipant}
      ></CustomModal>
    </>
  );
};

export default AddParticipants;
