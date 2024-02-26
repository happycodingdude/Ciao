import React, { useState } from "react";
import { HttpRequest } from "../../common/Utility";
import { useAuth, useFetchFriends } from "../../hook/CustomHooks";
import CustomModal from "../common/CustomModal";

const AddParticipants = (props) => {
  const { participants, conversation } = props;
  const auth = useAuth();
  const { load } = useFetchFriends();

  const [formData, setFormData] = useState();
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);

  const handleAddParticipant = () => {
    load().then((res) => {
      setFormData({
        title: "Create group chat",
        data: [
          {
            label: "Members",
            name: "Members",
            type: "multiple",
            options: res
              .filter(
                (item) =>
                  !participants.some(
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
      url: `api/conversations/${conversation?.Id}/participants`,
      token: auth.token,
      data: data.Members.map((item) => {
        return {
          ConversationId: conversation.Id,
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
        className={`fa fa-user-plus flex aspect-square w-[15%] cursor-pointer items-center justify-center rounded-[50%] 
        bg-[var(--main-color-thin)] text-base font-normal text-[var(--main-color-medium)] hover:bg-[var(--main-color-light)]`}
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
