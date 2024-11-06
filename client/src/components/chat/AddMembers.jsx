import React, { useState } from "react";
import { HttpRequest } from "../../common/Utility";
import {
  useAuth,
  useFetchConversations,
  useFetchFriends,
  useFetchParticipants,
} from "../../hook/CustomHooks";

const AddMembers = () => {
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
    <div className="flex flex-col p-10 pt-12 text-[90%] laptop:h-[45rem] desktop:h-[80rem]">
      <CustomInput
        type="text"
        label="Search for name"
        reference={refInput}
        onChange={(e) => {
          findContact(e.target.value);
        }}
      />
      <div className="list-friend-container hide-scrollbar mt-4 flex grow flex-col overflow-y-scroll scroll-smooth text-[var(--text-main-color)]">
        {contacts.map((item, i) => (
          <FriendItem
            key={item.id}
            friend={item}
            setContacts={setContacts}
            onClose={onClose}
          />
        ))}
      </div>
    </div>
  );
};

export default AddMembers;
