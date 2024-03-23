import { Tooltip } from "antd";
import React, { useState } from "react";
import { HttpRequest } from "../../common/Utility";
import { useAuth, useFetchConversations } from "../../hook/CustomHooks";
import CustomModal from "../common/CustomModal";

const UpdateTitle = () => {
  const auth = useAuth();
  const { selected, setSelected } = useFetchConversations();

  const [formData, setFormData] = useState();
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);

  const handleUpdateTitle = () => {
    setFormData({
      title: "Update title",
      data: [
        {
          label: "Title",
          name: "Title",
          type: "input",
          value: selected.Title,
        },
      ],
    });
    setShow(true);
  };

  const updateTitle = (data) => {
    if (data.Title === null) return;
    selected.Title = data.Title[0];

    HttpRequest({
      method: "put",
      url: `api/conversations`,
      token: auth.token,
      data: selected,
    }).then((res) => {
      setSelected((current) => ({ ...current, Title: data.Title[0] }));
    });
  };

  return (
    <>
      <Tooltip
        className="fa fa-edit h-full cursor-pointer text-[var(--main-color-normal)] hover:text-[var(--main-color)]"
        title="Change title"
        onClick={handleUpdateTitle}
      />
      <CustomModal
        show={show}
        forms={formData}
        onClose={handleClose}
        onSubmit={updateTitle}
      />
    </>
  );
};

export default UpdateTitle;
