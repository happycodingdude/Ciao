import { CloseOutlined } from "@ant-design/icons";
import React from "react";

const PortalHeader = (props) => {
  const { title, onClose } = props;
  return (
    <div className="flex h-full w-full items-center justify-between border-b-[.1rem] border-[var(--border-color)] px-8 py-4 text-md text-[var(--text-main-color)]">
      <p className="font-medium">{title}</p>
      <CloseOutlined
        className="flex cursor-pointer items-start"
        onClick={(e) => {
          e.stopPropagation(); // Prevent bubbling to parent
          onClose();
        }}
      />
    </div>
  );
};

export default PortalHeader;
