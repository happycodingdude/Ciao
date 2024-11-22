import { UsergroupAddOutlined } from "@ant-design/icons";
import React, { useState } from "react";
import BackgroundPortal from "../common/BackgroundPortal";
import CreateGroupChatModal from "./CreateGroupChatModal";

const CreateGroupChat = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      {/* <div
        onClick={() => setOpen(true)}
        className="fa fa-user-group base-icon-lg"
      ></div> */}
      {/* <GroupAddOutlinedIcon
        sx={{ fontSize: "2rem" }}
        className="cursor-pointer"
        onClick={() => setOpen(true)}
      /> */}
      <UsergroupAddOutlined
        style={{ fontSize: "16px" }}
        onClick={() => setOpen(true)}
      />
      <BackgroundPortal
        show={open}
        className="laptop:!w-[50rem] desktop:!w-[70rem]"
        title="Create group"
        onClose={() => setOpen(false)}
      >
        <CreateGroupChatModal onClose={() => setOpen(false)} />
      </BackgroundPortal>
    </>
  );
};

export default CreateGroupChat;
