import { CloseOutlined } from "@ant-design/icons";
import React from "react";

const PortalHeader = ({ title, onClose }) => {
  return (
    <div className="flex h-full w-full items-center justify-between bg-gradient-radial-to-bc from-[var(--sub-color)] to-[var(--main-color-normal)] p-8 text-white">
      <p className="font-medium">{title}</p>
      <CloseOutlined
        className="flex cursor-pointer items-start"
        onClick={onClose}
      />
    </div>
  );
};

export default PortalHeader;
