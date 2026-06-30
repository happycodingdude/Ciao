import { CloseOutlined } from "@ant-design/icons";
import { PortalHeaderProps } from "../../types/base.types";

const PortalHeader = (props: PortalHeaderProps) => {
  const { title, description, icon, onClose } = props;
  return (
    <div className="text-(--text-main-color) flex w-full shrink-0 items-start justify-between gap-4 px-6 pt-6 pb-4">
      <div className="flex min-w-0 items-center gap-3">
        {/* Biểu tượng chức năng — badge vuông bo góc, nền xanh đặc, icon trắng */}
        {icon && (
          <span className="bg-light-blue-500 shadow-light-blue-500/25 flex aspect-square w-11 shrink-0 items-center justify-center rounded-xl text-lg text-white shadow-lg">
            {icon}
          </span>
        )}
        <div className="flex min-w-0 flex-col gap-0.5">
          <p className="truncate text-xl font-semibold leading-tight">{title}</p>
          {description && (
            <p className="text-(--text-main-color-blur) truncate text-sm leading-tight">
              {description}
            </p>
          )}
        </div>
      </div>
      <CloseOutlined
        className="text-(--text-main-color-blur) hover:text-(--text-main-color) mt-1 shrink-0 cursor-pointer text-base transition-colors"
        onClick={(e) => {
          e.stopPropagation(); // Prevent bubbling to parent
          onClose?.();
        }}
      />
    </div>
  );
};

export default PortalHeader;
