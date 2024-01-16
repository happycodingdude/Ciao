import { Tooltip } from "antd";
import React from "react";
import UpdateTitle from "./UpdateTitle";

const CustomLabel = ({ title, className, tooltip, update, reference }) => {
  return (
    <div className="flex w-full justify-center gap-[.5rem]">
      <Tooltip title={tooltip ? title : ""}>
        <p
          className={`overflow-hidden text-ellipsis whitespace-nowrap ${className}`}
        >
          {title}
        </p>
      </Tooltip>
      {update ? <UpdateTitle reference={reference}></UpdateTitle> : ""}
    </div>
  );
};

export default CustomLabel;
