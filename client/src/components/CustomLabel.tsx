import { Tooltip } from "antd";
import React from "react";
import { CustomLabelProps } from "../types";

const CustomLabel = (props: CustomLabelProps) => {
  const { title, className, tooltip } = props;
  return (
    <Tooltip title={tooltip ? title : ""}>
      <p
        className={`${className ?? ""} overflow-hidden text-ellipsis whitespace-nowrap`}
        // onClick={onClick ?? (() => {})}
      >
        {title}
      </p>
    </Tooltip>
  );
};

export default CustomLabel;
