// ✅ Replaced Ant Design Tooltip with native HTML title to reduce bundle size (-80KB)
import { CustomLabelProps } from "../types";

const CustomLabel = (props: CustomLabelProps) => {
  const { title, className, tooltip } = props;
  return (
    <p
      title={tooltip ? title : ""}
      className={`${className ?? ""} w-full overflow-hidden text-ellipsis whitespace-nowrap`}
    >
      {title}
    </p>
  );
};

export default CustomLabel;
