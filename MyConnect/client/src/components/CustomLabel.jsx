import { Tooltip } from "antd";
import React from "react";

const CustomLabel = ({ title }) => {
  return (
    <Tooltip title={title}>
      <p className="w-full overflow-hidden text-ellipsis whitespace-nowrap font-bold text-gray-600">
        {title}
      </p>
    </Tooltip>
  );
};

export default CustomLabel;
