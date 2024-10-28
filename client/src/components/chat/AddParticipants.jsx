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
  const { participants, reFetch: reFetchParticipants } = useFetchParticipants();
  const { friends } = useFetchFriends();

  const [formData, setFormData] = useState();
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);

  const handleAddParticipant = () => {
    setFormData({
      title: "Add members",
      data: [
        {
          label: "Friends",
          name: "Friends",
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
      url: import.meta.env.VITE_ENDPOINT_PARTICIPANT_ADD.replace(
        "{id}",
        selected.Id,
      ),
      token: auth.token,
      data: data.Friends.map((item) => {
        return {
          ConversationId: selected.Id,
          ContactId: item,
          IsNotifying: true,
        };
      }),
    }).then((res) => {
      reFetchParticipants(selected.Id);
    });
  };
  return (
    <>
      <div
        onClick={handleAddParticipant}
        className={`fa fa-user-plus flex items-center justify-center font-normal`}
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
