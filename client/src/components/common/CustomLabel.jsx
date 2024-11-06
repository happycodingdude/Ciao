import { Tooltip } from "antd";
import React from "react";

const CustomLabel = ({ title, className, tooltip, onClick }) => {
  return (
    <Tooltip title={tooltip ? title : ""}>
      <p
        className={`${className ?? ""} overflow-hidden text-ellipsis whitespace-nowrap`}
        onClick={onClick ?? (() => {})}
      >
        {title}
      </p>
    </Tooltip>
  );
};

export default CustomLabel;
