import { UsergroupAddOutlined } from "@ant-design/icons";
import React, { useState } from "react";
import BackgroundPortal from "../common/BackgroundPortal";
import AddMembersModal from "./AddMembersModal";

const AddMembers = React.memo((props) => {
  const { selected, show, onClose } = props;
  const [open, setOpen] = useState(false);
  return (
    <>
      <UsergroupAddOutlined
        className="hover:text-[var(--main-color-bold)]"
        style={{ fontSize: "18px", transition: "all 0.2s" }}
        onClick={() => setOpen(true)}
      />
      <BackgroundPortal
        show={open}
        className="laptop:!w-[50rem] desktop:!w-[70rem]"
        title="Add members"
        onClose={() => setOpen(false)}
      >
        <AddMembersModal
          id={selected?.id}
          members={selected?.participants.map((item) => item.contact)}
          onClose={() => setOpen(false)}
        />
      </BackgroundPortal>
    </>
  );
});

export default AddMembers;
