// import { Tooltip } from "antd";
import React, { useState } from "react";
import { HttpRequest } from "../../common/Utility";
import { useAuth } from "../../hook/CustomHooks";
import CustomModal from "../common/CustomModal";

const AddParticipants = ({ reference }) => {
  const auth = useAuth();

  const [formData, setFormData] = useState();
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);

  const handleAddParticipant = () => {
    HttpRequest({
      method: "get",
      url: `api/contacts`,
      token: auth.token,
    }).then((res) => {
      if (!res) return;
      setFormData({
        title: "Add member",
        data: [
          {
            label: "Members",
            name: "Members",
            type: "multiple",
            options: res
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
    });
  };

  const addParticipant = (data) => {
    handleClose();
    HttpRequest({
      method: "post",
      url: `api/conversations/${reference.conversation?.Id}/participants`,
      token: auth.token,
      data: data.Members.map((item) => {
        return {
          ConversationId: reference.conversation.Id,
          ContactId: item,
          IsNotifying: true,
        };
      }),
    });
  };
  return (
    <>
      <div
        onClick={handleAddParticipant}
        className={`fa fa-user-plus flex aspect-square w-[15%] cursor-pointer items-center justify-center rounded-[50%] bg-pink-100 text-base font-normal text-pink-500 hover:bg-pink-200`}
      ></div>
      <CustomModal
        show={show}
        forms={formData}
        onClose={handleClose}
        onSubmit={addParticipant}
      />
    </>
  );
};

export default AddParticipants;
