import { UsergroupAddOutlined } from "@ant-design/icons";
import React, { useState } from "react";
import BackgroundPortal from "../../../components/BackgroundPortal";
import AddMembersModal from "./AddMembersModal";

const AddMembers = () => {
  const [open, setOpen] = useState<boolean>(false);
  return (
    <>
      <UsergroupAddOutlined
        className="base-icon-sm transition-all duration-200 hover:text-[var(--main-color-bold)]"
        // style={{ fontSize: "18px", transition: "all 0.2s" }}
        onClick={() => setOpen(true)}
      />
      <BackgroundPortal
        show={open}
        className="laptop:!w-[50rem] desktop:!w-[70rem]"
        title="Add members"
        onClose={() => setOpen(false)}
      >
        <AddMembersModal onClose={() => setOpen(false)} />
      </BackgroundPortal>
    </>
  );
};

export default AddMembers;
