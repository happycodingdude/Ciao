import { Tooltip } from "antd";
import React from "react";

const CustomLabel = ({ title, className, tooltip }) => {
  return (
    <Tooltip title={tooltip ? title : ""}>
      <p
        className={`overflow-hidden text-ellipsis whitespace-nowrap ${className}`}
      >
        {title}
      </p>
    </Tooltip>
  );
};

export default CustomLabel;
