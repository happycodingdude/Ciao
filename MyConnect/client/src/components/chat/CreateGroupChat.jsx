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
            .filter((item) => item.Id !== auth.id)
            .map((item) => {
              return { label: item.ContactName, value: item.ContactId };
            }),
        },
      ],
    });
    setShow(true);
  };

  const createGroupChat = (data) => {
    const body = {
      Title: data.Title[0],
      IsGroup: true,
      Participants: [
        ...[
          {
            ContactId: auth.id,
            IsNotifying: true,
            IsModerator: true,
          },
        ],
        ...data.Friends.filter((item) => item !== "").map((item) => {
          return {
            ContactId: item,
            IsNotifying: true,
          };
        }),
      ],
    };
    HttpRequest({
      method: "post",
      url: `api/conversations?includeNotify=true`,
      token: auth.token,
      data: body,
    }).then((res) => {
      addNewItem(res);
      setSelected(res);
    });
  };

  return (
    <>
      <div
        onClick={openCreateGroupChat}
        className="fa fa-users flex flex-1 cursor-pointer items-center justify-center rounded-lg text-sm font-normal 
        transition-all duration-200 hover:bg-[var(--search-bg-color)] "
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
