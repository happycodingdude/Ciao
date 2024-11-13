import { CloseOutlined } from "@ant-design/icons";
import React from "react";

const PortalHeader = ({ title, onClose }) => {
  return (
    <div className="flex h-full w-full items-center justify-between border-b-[.1rem] border-[var(--text-main-color)] px-8 py-4 text-md text-[var(--text-main-color)]">
      <p className="font-medium">{title}</p>
      <CloseOutlined
        className="flex cursor-pointer items-start"
        onClick={onClose}
      />
    </div>
  );
};

export default PortalHeader;
