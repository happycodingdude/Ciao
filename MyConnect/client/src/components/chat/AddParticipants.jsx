import React, { useState } from "react";
import { HttpRequest } from "../../common/Utility";
import {
  useAuth,
  useFetchConversations,
  useFetchFriends,
  useFetchParticipants,
} from "../../hook/CustomHooks";
import CustomModal from "../common/CustomModal";

const AddParticipants = () => {
  const auth = useAuth();
  const { selected } = useFetchConversations();
  const { participants } = useFetchParticipants();
  const { friends } = useFetchFriends();

  const [formData, setFormData] = useState();
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);

  const handleAddParticipant = () => {
    setFormData({
      title: "Add members",
      data: [
        {
          label: "Members",
          name: "Members",
          type: "multiple",
          options: friends
            .filter(
              (item) =>
                !participants.some(
                  (participant) => participant.ContactId === item.ContactId,
                ),
            )
            .map((item) => {
              return { label: item.ContactName, value: item.ContactId };
            }),
        },
      ],
    });
    setShow(true);
  };

  const addParticipant = (data) => {
    handleClose();
    HttpRequest({
      method: "post",
      url: `api/conversations/${selected.Id}/participants`,
      token: auth.token,
      data: data.Members.map((item) => {
        return {
          ConversationId: selected.Id,
          ContactId: item,
          IsNotifying: true,
        };
      }),
    });
    // .then((res) => {
    //   setParticipants((current) => [...current, ...res]);
    // });
  };
  return (
    <>
      <div
        onClick={handleAddParticipant}
        className={`fa fa-user-plus flex aspect-square w-[13%] cursor-pointer items-center justify-center rounded-[50%] 
        bg-[var(--main-color-thin)] text-sm font-normal text-[var(--main-color-medium)] hover:bg-[var(--main-color-light)]`}
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
