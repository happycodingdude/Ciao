import { Tooltip } from "antd";
import { CustomLabelProps } from "../types";

const CustomLabel = (props: CustomLabelProps) => {
  const { title, className, tooltip } = props;
  return (
    <Tooltip title={tooltip ? title : ""}>
      <p
        className={`${className ?? ""} w-full overflow-hidden text-ellipsis whitespace-nowrap`}
      >
        {title}
      </p>
    </Tooltip>
  );
};

export default CustomLabel;
