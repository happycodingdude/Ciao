import { UsergroupAddOutlined } from "@ant-design/icons";
import React, { useState } from "react";
import BackgroundPortal from "../common/BackgroundPortal";
import CreateGroupChatModal from "./CreateGroupChatModal";

const CreateGroupChat = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <UsergroupAddOutlined
        className="hover:text-[var(--main-color-bold)]"
        style={{ fontSize: "16px", transition: "all 0.2s" }}
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
