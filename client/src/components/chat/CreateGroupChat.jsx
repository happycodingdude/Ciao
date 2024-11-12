import React, { useState } from "react";
import BackgroundPortal from "../common/BackgroundPortal";
import CreateGroupChatModal from "./CreateGroupChatModal";

const CreateGroupChat = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div
        onClick={() => setOpen(true)}
        className="fa fa-user-group base-icon-lg"
      ></div>
      <BackgroundPortal
        show={open}
        className="laptop:!w-[40rem] desktop:!w-[35%]"
        title="Create group"
        onClose={() => setOpen(false)}
      >
        <CreateGroupChatModal onClose={() => setOpen(false)} />
      </BackgroundPortal>
    </>
  );
};

export default CreateGroupChat;
