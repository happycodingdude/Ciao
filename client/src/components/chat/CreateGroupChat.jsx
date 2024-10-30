import React, { useState } from "react";
import { HttpRequest } from "../../common/Utility";
import {
  useAuth,
  useFetchConversations,
  useFetchFriends,
} from "../../hook/CustomHooks";
import CustomModal from "../common/CustomModal";

const CreateGroupChat = () => {
  const auth = useAuth();
  const { friends } = useFetchFriends();
  const { setSelected, addNewItem } = useFetchConversations();
  const { reFetchFriends } = useFetchFriends();

  const [formData, setFormData] = useState();
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);

  const openCreateGroupChat = () => {
    setFormData({
      title: "Create group chat",
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
          options: friends
            .filter((item) => item.id !== auth.id)
            .map((item) => {
              return { label: item.contactName, value: item.contactId };
            }),
        },
      ],
    });
    setShow(true);
  };

  const createGroupChat = (data) => {
    const body = {
      title: data.Title[0],
      isGroup: true,
      participants: [
        ...[
          {
            contactId: auth.id,
            isNotifying: true,
            isModerator: true,
          },
        ],
        ...data.Friends.filter((item) => item !== "").map((item) => {
          return {
            contactId: item,
            isNotifying: true,
          };
        }),
      ],
    };
    HttpRequest({
      method: "post",
      url: import.meta.env.VITE_ENDPOINT_CONVERSATION_INCLUDENOTIFY,
      token: auth.token,
      data: body,
    }).then((res) => {
      addNewItem(res.data);
      setSelected(res.data);
    });
  };

  return (
    <>
      <div
        onClick={openCreateGroupChat}
        className="fa fa-users base-icon-lg"
      ></div>
      <CustomModal
        show={show}
        forms={formData}
        onClose={handleClose}
        onSubmit={createGroupChat}
      />
    </>
  );
};

export default CreateGroupChat;
