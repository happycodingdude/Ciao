import { CloseOutlined } from "@ant-design/icons";
import { PortalHeaderProps } from "../types";

const PortalHeader = (props: PortalHeaderProps) => {
  const { title, onClose } = props;
  return (
    <div className="border-(--border-color) text-(--text-main-color) flex h-full w-full items-center justify-between border-b-[.1rem] px-8 py-4 text-base">
      <p className="font-medium">{title}</p>
      <CloseOutlined
        className="flex cursor-pointer items-start"
        onClick={(e) => {
          e.stopPropagation(); // Prevent bubbling to parent
          onClose();
        }}
      />
    </div>
  );
};

export default PortalHeader;
