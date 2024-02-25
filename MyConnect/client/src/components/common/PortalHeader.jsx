import { CloseOutlined } from "@ant-design/icons";
import React from "react";

const PortalHeader = ({ title, onClose }) => {
  return (
    <div className="inline-flex h-[5rem] w-full items-center justify-between bg-gradient-radial-to-bc from-[var(--sub-color)] to-[var(--main-color-normal)] p-8 text-white">
      <p className="text-base font-medium leading-10 ">{title}</p>
      <CloseOutlined
        className="flex cursor-pointer items-start text-base"
        onClick={onClose}
      />
    </div>
  );
};

export default PortalHeader;
