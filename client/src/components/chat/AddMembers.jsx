import { UsergroupAddOutlined } from "@ant-design/icons";
import React from "react";
import BackgroundPortal from "../common/BackgroundPortal";
import AddMembersModal from "./AddMembersModal";

const AddMembers = React.memo((props) => {
  const { selected, show, onClose } = props;
  return (
    <>
      <UsergroupAddOutlined style={{ fontSize: "16px" }} />
      <BackgroundPortal
        show={show}
        className="laptop:!w-[50rem] desktop:!w-[70rem]"
        title="Add members"
        onClose={onClose}
      >
        <AddMembersModal
          id={selected?.id}
          members={selected?.participants.map((item) => item.contact)}
          onClose={onClose}
        />
      </BackgroundPortal>
    </>
  );
});

export default AddMembers;
