import GroupAddOutlinedIcon from "@mui/icons-material/GroupAddOutlined";
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
      <GroupAddOutlinedIcon
        fontSize="large"
        className="cursor-pointer"
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
