// import { Tooltip } from "antd";
import React, { useState } from "react";
import { HttpRequest } from "../../common/Utility";
import { useAuth } from "../../hook/CustomHooks";
import CustomModal from "../common/CustomModal";

const CreateGroupChat = () => {
  const auth = useAuth();

  const [formData, setFormData] = useState();
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);

  const openCreateGroupChat = () => {
    HttpRequest({
      method: "get",
      url: `api/contacts`,
      token: auth.token,
    }).then((res) => {
      if (!res) return;
      setFormData({
        title: "Create group chat",
        data: [
          {
            label: "Title",
            name: "Title",
            type: "input",
          },
          {
            label: "Members",
            name: "Members",
            type: "multiple",
            options: res
              .filter((item) => item.Id !== auth.id)
              .map((item) => {
                return { label: item.Name, value: item.Id };
              }),
          },
        ],
      });
      setShow(true);
    });
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
        ...data.Members.filter((item) => item !== "").map((item) => {
          return {
            ContactId: item,
            IsNotifying: true,
          };
        }),
      ],
    };
    HttpRequest({
      method: "post",
      url: `api/conversations`,
      token: auth.token,
      data: body,
    });
  };

  return (
    <>
      <div
        onClick={openCreateGroupChat}
        className="fa fa-users flex flex-1 cursor-pointer items-center justify-center rounded-lg text-sm font-normal transition-all duration-200 hover:bg-[#e7e7e7]"
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
