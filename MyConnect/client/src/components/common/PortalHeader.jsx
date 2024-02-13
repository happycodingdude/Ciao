import { CloseOutlined } from "@ant-design/icons";
import React from "react";

const PortalHeader = ({ title, onClose }) => {
  return (
    <div
      className="bg-gradient-radial-to-bc inline-flex h-[5rem] w-full 
      items-center justify-between from-white to-pink-300 p-8
      text-white"
    >
      <p className="text-base font-medium leading-10 ">{title}</p>
      <CloseOutlined
        className="flex cursor-pointer items-start text-base"
        onClick={onClose}
      />
    </div>
  );
};

export default PortalHeader;
